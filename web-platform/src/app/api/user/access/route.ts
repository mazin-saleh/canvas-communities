import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UserAccessRow = {
  id: number;
  username: string;
  platformRole: string | null;
  sessionVersion: number | null;
};

type ClubOwnerRow = { communityId: number };
type ClubAdminRow = {
  communityId: number;
  canManageSettings: boolean;
  canManageRoles: boolean;
  canManageEvents: boolean;
  canManageGallery: boolean;
  canManageAnnouncements: boolean;
  canManageRoster: boolean;
  canBlacklistUsers: boolean;
};

function parseUserId(searchValue: string | null): number | null {
  const parsed = Number(searchValue);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  try {
    const userId = parseUserId(req.nextUrl.searchParams.get("userId"));
    if (!userId) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const [tablePresence] = await prisma.$queryRaw<
      Array<{ hasClubOwner: boolean; hasClubAdmin: boolean }>
    >`
      SELECT
        to_regclass('"ClubOwner"') IS NOT NULL AS "hasClubOwner",
        to_regclass('"ClubAdmin"') IS NOT NULL AS "hasClubAdmin"
    `;

    const userRowsPromise = prisma.$queryRaw<UserAccessRow[]>`
      SELECT
        id,
        username,
        "platformRole"::text AS "platformRole",
        "sessionVersion"
      FROM "User"
      WHERE id = ${userId}
      LIMIT 1
    `;

    const clubOwnerPromise = tablePresence?.hasClubOwner
      ? prisma.$queryRaw<ClubOwnerRow[]>`
          SELECT "communityId" AS "communityId"
          FROM "ClubOwner"
          WHERE "userId" = ${userId}
        `
      : Promise.resolve([] as ClubOwnerRow[]);

    const clubAdminsPromise = tablePresence?.hasClubAdmin
      ? prisma.$queryRaw<ClubAdminRow[]>`
          SELECT
            "communityId" AS "communityId",
            "canManageSettings" AS "canManageSettings",
            "canManageRoles" AS "canManageRoles",
            "canManageEvents" AS "canManageEvents",
            "canManageGallery" AS "canManageGallery",
            "canManageAnnouncements" AS "canManageAnnouncements",
            "canManageRoster" AS "canManageRoster",
            "canBlacklistUsers" AS "canBlacklistUsers"
          FROM "ClubAdmin"
          WHERE "userId" = ${userId}
        `
      : Promise.resolve([] as ClubAdminRow[]);

    const [userRows, memberships, clubOwner, clubAdmins] = await Promise.all([
      userRowsPromise,
      prisma.membership.findMany({
        where: { userId },
        select: {
          communityId: true,
          community: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      clubOwnerPromise,
      clubAdminsPromise,
    ]);

    const user = userRows[0] ?? null;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ownerClubIds = new Set(clubOwner.map((entry) => entry.communityId));
    const adminByClubId = new Map(
      clubAdmins.map((entry) => [entry.communityId, entry])
    );

    const clubs = memberships.map((membership) => {
      const admin = adminByClubId.get(membership.communityId) ?? null;
      const isOwner = ownerClubIds.has(membership.communityId);
      const isAdmin = Boolean(admin);

      return {
        clubId: membership.communityId,
        clubName: membership.community.name,
        avatarUrl: membership.community.avatarUrl,
        isMember: true,
        isOwner,
        isAdmin,
        permissions: {
          canManageSettings: admin?.canManageSettings ?? false,
          canManageRoles: admin?.canManageRoles ?? false,
          canManageEvents: admin?.canManageEvents ?? false,
          canManageGallery: admin?.canManageGallery ?? false,
          canManageAnnouncements: admin?.canManageAnnouncements ?? false,
          canManageRoster: admin?.canManageRoster ?? false,
          canBlacklistUsers: admin?.canBlacklistUsers ?? false,
        },
      };
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          platformRole: user.platformRole ?? "GENERAL_USER",
          sessionVersion: user.sessionVersion ?? 1,
        },
        clubs,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
