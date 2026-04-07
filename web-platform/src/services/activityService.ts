import { prisma } from "@/lib/prisma";

export async function getActivityFeed(userId: number) {
  const [announcements, events, memberships, recommendations] =
    await Promise.all([
      prisma.announcement.findMany({
        where: {
        status: "published",
        community: {
            members: {
            some: { userId }
            }
        }
        },
        include: { community: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.event.findMany({
        where: {
        status: "published",
        community: {
            members: {
            some: { userId }
            }
        }
        },
        include: { community: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.membership.findMany({
        where: { userId },
        include: { community: true },
        orderBy: { joinedAt: "desc" },
        take: 10,
      }),

      prisma.recommendation.findMany({
        where: { userId },
        include: { community: true },
        orderBy: { computedAt: "desc" },
        take: 10,
      }),
    ]);

  const feed = [
    ...announcements.map(a => ({
      id: `announcement-${a.id}`,
      type: "announcement",
      title: `${a.community.name} posted a new announcement`,
      description: a.title,
      timestamp: a.createdAt,
      community: a.community,
    })),

    ...events.map(e => ({
      id: `event-${e.id}`,
      type: "event",
      title: `${e.community.name} added a new event`,
      description: e.title,
      timestamp: e.createdAt,
      community: e.community,
    })),

    ...memberships.map(m => ({
      id: `membership-${m.id}`,
      type: "update",
      title: `You joined ${m.community.name}`,
      description: "Your membership has been added successfully.",
      timestamp: m.joinedAt,
      community: m.community,
    })),

    ...recommendations.map(r => ({
      id: `rec-${r.id}`,
      type: "recommendation",
      title: `We found new clubs for you`,
      description: r.community.name,
      timestamp: r.computedAt,
      community: r.community,
    })),
  ];

  return feed
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20);
}

export async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: {
      status: "published",
      date: { gte: new Date() },
    },
    include: { community: true },
    orderBy: { date: "asc" },
    take: 5,
  });
}