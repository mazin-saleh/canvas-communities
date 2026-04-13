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

export async function setCommunityTags(communityId: number, tagNames: string[]) {
  // Disconnect all existing tags, then connect/create the desired set
  return prisma.community.update({
    where: { id: communityId },
    data: {
      tags: {
        set: [], // disconnect all
        connectOrCreate: tagNames.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
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

export async function listAllCommunities() {
  return prisma.community.findMany({
    include: {
      tags: true,
    },
    orderBy: { name: "asc" },
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
  data: Partial<{ name: string; description: string; avatarUrl: string | null; bannerUrl: string | null }>
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