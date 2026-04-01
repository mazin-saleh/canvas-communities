import { prisma } from "@/lib/prisma";

export async function getRolesByCommunity(communityId: number) {
  return prisma.clubRole.findMany({
    where: { communityId },
    include: {
      permissions: true,
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createRole(data: {
  communityId: number;
  name: string;
  color?: string;
  permissions: string[];
}) {
  return prisma.$transaction(async (tx) => {
    const role = await tx.clubRole.create({
      data: {
        communityId: data.communityId,
        name: data.name,
        color: data.color,
        permissions: {
          create: data.permissions.map((p) => ({ permission: p })),
        },
      },
      include: {
        permissions: true,
        _count: { select: { members: true } },
      },
    });
    return role;
  });
}

export async function updateRole(
  roleId: number,
  data: {
    name?: string;
    color?: string;
    permissions?: string[];
  }
) {
  if (data.permissions) {
    return prisma.$transaction(async (tx) => {
      await tx.clubRolePermission.deleteMany({ where: { clubRoleId: roleId } });
      return tx.clubRole.update({
        where: { id: roleId },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.color !== undefined ? { color: data.color } : {}),
          permissions: {
            create: data.permissions!.map((p) => ({ permission: p })),
          },
        },
        include: {
          permissions: true,
          _count: { select: { members: true } },
        },
      });
    });
  }

  return prisma.clubRole.update({
    where: { id: roleId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
    include: {
      permissions: true,
      _count: { select: { members: true } },
    },
  });
}

export async function deleteRole(roleId: number) {
  await prisma.$transaction(async (tx) => {
    await tx.clubMemberRole.deleteMany({ where: { clubRoleId: roleId } });
    await tx.clubRolePermission.deleteMany({ where: { clubRoleId: roleId } });
    await tx.clubRole.delete({ where: { id: roleId } });
  });
}

export async function assignRole(roleId: number, membershipId: number) {
  return prisma.clubMemberRole.create({
    data: { clubRoleId: roleId, membershipId },
  });
}

export async function unassignRole(roleId: number, membershipId: number) {
  await prisma.clubMemberRole.delete({
    where: { membershipId_clubRoleId: { membershipId, clubRoleId: roleId } },
  });
}

export async function getUserPermissionsForClub(userId: number, communityId: number) {
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

  if (!membership) return [];

  const permissions = new Set<string>();
  for (const ar of membership.assignedRoles) {
    for (const p of ar.clubRole.permissions) {
      permissions.add(p.permission);
    }
  }
  return Array.from(permissions);
}

export async function getMembersByCommunity(communityId: number) {
  return prisma.membership.findMany({
    where: { communityId },
    include: {
      user: { select: { id: true, username: true } },
      assignedRoles: {
        include: {
          clubRole: { select: { id: true, name: true, color: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

export async function kickMember(membershipId: number) {
  await prisma.$transaction(async (tx) => {
    await tx.clubMemberRole.deleteMany({ where: { membershipId } });
    await tx.membership.delete({ where: { id: membershipId } });
  });
}

export async function isUserClubOwner(userId: number, communityId: number) {
  const owner = await prisma.communityOwner.findUnique({
    where: { communityId },
  });
  return owner?.userId === userId;
}
