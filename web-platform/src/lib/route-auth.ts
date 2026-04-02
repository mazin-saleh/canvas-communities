import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

/**
 * Extract the active user ID from the request.
 * Uses x-user-id header (set by api.ts on every request).
 */
export function getUserIdFromRequest(req: NextRequest): number | null {
  const header = req.headers.get("x-user-id");
  if (!header) return null;
  const id = Number(header);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Check if a user is a super admin (platformRole = SUPER_ADMIN).
 */
export async function checkSuperAdmin(userId: number): Promise<boolean> {
  try {
    const [row] = await prisma.$queryRaw<{ platformRole: string }[]>`
      SELECT "platformRole"::text AS "platformRole" FROM "User" WHERE id = ${userId} LIMIT 1
    `;
    return row?.platformRole === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

/**
 * Check if a user is the owner of a community.
 */
export async function checkClubOwner(userId: number, communityId: number): Promise<boolean> {
  const owner = await prisma.communityOwner.findUnique({ where: { communityId } });
  return owner?.userId === userId;
}

/**
 * Check if a user has a specific permission for a club via their assigned roles.
 */
export async function checkClubPermission(userId: number, communityId: number, permission: string): Promise<boolean> {
  const membership = await prisma.membership.findUnique({
    where: { userId_communityId: { userId, communityId } },
    include: {
      assignedRoles: {
        include: {
          clubRole: {
            include: { permissions: true },
          },
        },
      },
    },
  });

  if (!membership) return false;

  for (const ar of membership.assignedRoles) {
    for (const p of ar.clubRole.permissions) {
      if (p.permission === permission) return true;
    }
  }
  return false;
}

/**
 * Require authentication. Returns userId or a 401 response.
 */
export function requireAuth(req: NextRequest): { userId: number } | NextResponse {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return { userId };
}

/**
 * Check if a user can perform a club action. Returns true if:
 * - User is a super admin, OR
 * - User is the club owner, OR
 * - User has the specified permission via assigned roles
 */
export async function canPerformClubAction(
  userId: number,
  communityId: number,
  permission: string
): Promise<boolean> {
  if (await checkSuperAdmin(userId)) return true;
  if (await checkClubOwner(userId, communityId)) return true;
  return checkClubPermission(userId, communityId, permission);
}

/**
 * Check if user is club owner or super admin.
 */
export async function canPerformOwnerAction(
  userId: number,
  communityId: number
): Promise<boolean> {
  if (await checkSuperAdmin(userId)) return true;
  return checkClubOwner(userId, communityId);
}
