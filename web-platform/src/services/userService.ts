import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function createUser(username: string, password: string) {
  // Hasing of user password before storing in DB
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: {
      username,
      password: hashedPassword
    }
  });
}

// Verifies user credentials
export async function verifyUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUsers() {
  return prisma.user.findMany({
    include: {
      interests: true,
      memberships: true
    }
  });
}

export async function addInterest(userId: number, tagName: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      interests: {
        connectOrCreate: {
          where: { name: tagName },
          create: { name: tagName }
        }
      }
    }
  });

  // Trigger ML recomputation (fire-and-forget, don't block response)
  fetch(`${process.env.PYTHON_BACKEND_URL}/recommend/${userId}`, { method: 'POST' })
    .catch(err => console.error('ML recomputation failed:', err));

  return user;
}

export async function removeInterest(userId: number, tagName: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      interests: {
        disconnect: { name: tagName }
      }
    }
  });

  // Trigger ML recomputation (fire-and-forget, don't block response)
  fetch(`${process.env.PYTHON_BACKEND_URL}/recommend/${userId}`, { method: 'POST' })
    .catch(err => console.error('ML recomputation failed:', err));

  return user;
}

export async function getUserInterests(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: true }
  });
  return user?.interests || [];
}

export async function getAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function joinCommunity(userId: number, communityId: number) {
  // Check for existing membership to avoid unique constraint error
  const existing = await prisma.membership.findUnique({
    where: { userId_communityId: { userId, communityId } }
  });

  if (existing) {
    return existing;
  }

  const membership = await prisma.membership.create({
    data: {
      userId,
      communityId
    }
  });

  // Trigger ML recomputation (fire-and-forget, don't block response)
  fetch(`${process.env.PYTHON_BACKEND_URL}/recommend/${userId}`, { method: 'POST' })
    .catch(err => console.error('ML recomputation failed:', err));

  return membership;
}

export async function getUserCommunities(userId: number) {
  return prisma.membership.findMany({
    where: { userId },
    include: {
      community: true
    }
  });
}

// ML-powered recommendations with tag-based fallback
export async function recommendCommunities(userId: number) {
  // First, check if ML recommendations exist in the Recommendation table
  const mlRecommendations = await prisma.recommendation.findMany({
    where: { userId },
    orderBy: { score: 'desc' },
    include: {
      community: {
        include: {
          tags: true
        }
      }
    }
  });

  // If ML recommendations exist, return them with scores preserved
  if (mlRecommendations.length > 0) {
    return mlRecommendations.map(rec => ({
      ...rec.community,
      score: rec.score,
      contentScore: rec.contentScore,
      collabScore: rec.collabScore,
    }));
  }

  // Fallback to tag-based recommendations if no ML data
  // Exclude communities the user has already joined
  return prisma.community.findMany({
    where: {
      tags: {
        some: {
          users: {
            some: { id: userId }
          }
        }
      },
      NOT: {
        members: {
          some: { userId }
        }
      }
    },
    include: {
      tags: true
    },
    orderBy: { name: 'asc' }
  });
}