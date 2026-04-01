import { prisma } from "@/lib/prisma";

export async function getAnnouncementsByCommunity(communityId: number, includeDrafts: boolean) {
  return prisma.announcement.findMany({
    where: {
      communityId,
      ...(includeDrafts ? {} : { status: "published" }),
    },
    include: {
      createdBy: { select: { id: true, username: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAnnouncement(data: {
  communityId: number;
  createdById: number;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  pinned?: boolean;
}) {
  return prisma.announcement.create({
    data,
    include: {
      createdBy: { select: { id: true, username: true } },
    },
  });
}

export async function updateAnnouncement(
  announcementId: number,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    status: string;
    pinned: boolean;
  }>
) {
  return prisma.announcement.update({
    where: { id: announcementId },
    data,
    include: {
      createdBy: { select: { id: true, username: true } },
    },
  });
}

export async function deleteAnnouncement(announcementId: number) {
  await prisma.announcement.delete({ where: { id: announcementId } });
}
