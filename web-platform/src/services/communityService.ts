import { prisma } from "../lib/prisma";

export async function createCommunity(name: string) {
  return prisma.community.create({
    data: {
      name
    }
  });
}

export async function addCommunityTag(communityId: number, tagName: string) {
  return prisma.community.update({
    where: { id: communityId },
    data: {
      tags: {
        connectOrCreate: {
          where: { name: tagName },
          create: { name: tagName }
        }
      }
    }
  });
}

export async function getCommunityById(id: number) {
  return prisma.community.findUnique({
    where: { id },
    include: {
      tags: true,
      members: {
        include: {
          user: { select: { id: true, username: true } },
          assignedRoles: {
            include: {
              clubRole: {
                include: { permissions: true },
              },
            },
          },
        },
      },
      owner: true,
    },
  });
}

export async function updateCommunity(
  id: number,
  data: Partial<{ name: string; description: string; avatarUrl: string | null }>
) {
  return prisma.community.update({
    where: { id },
    data,
    include: {
      tags: true,
      members: {
        include: {
          user: { select: { id: true, username: true } },
          assignedRoles: {
            include: {
              clubRole: {
                include: { permissions: true },
              },
            },
          },
        },
      },
      owner: true,
    },
  });
}