import { NextRequest, NextResponse } from "next/server";
import {
  ForbiddenError,
  UnauthorizedError,
  hasClubPermission,
  isClubOwner,
  readBearerTokenFromHeaders,
  validateDbSession,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

async function canKickMember(userId: number, clubId: number): Promise<boolean> {
  try {
    await isClubOwner(userId, clubId);
    return true;
  } catch (error) {
    if (!(error instanceof ForbiddenError)) {
      throw error;
    }
  }

  await hasClubPermission(userId, clubId, "canManageRoster");
  return true;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clubId: string; memberId: string }> }
) {
  try {
    const { clubId: rawClubId, memberId: rawMemberId } = await context.params;
    const clubId = parsePositiveInteger(rawClubId);
    const memberId = parsePositiveInteger(rawMemberId);

    if (!clubId || !memberId) {
      return NextResponse.json({ error: "Invalid route params" }, { status: 404 });
    }

    const sessionToken = readBearerTokenFromHeaders(req.headers);
    const session = await validateDbSession({ sessionToken });

    await canKickMember(session.userId, clubId);

    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId: memberId,
          communityId: clubId,
        },
      },
      select: { id: true },
    });

    if (!existingMembership) {
      return NextResponse.json({ error: "Member not found in club" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.clubAdmin.deleteMany({
        where: {
          userId: memberId,
          communityId: clubId,
        },
      }),
      prisma.membership.delete({
        where: {
          userId_communityId: {
            userId: memberId,
            communityId: clubId,
          },
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "MEMBER_KICKED",
          targetType: "Membership",
          targetId: existingMembership.id,
          communityId: clubId,
          metadata: {
            kickedUserId: memberId,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        kickedUserId: memberId,
        communityId: clubId,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
