import { prisma } from "@/lib/prisma";

export async function getGalleryByCommunity(communityId: number) {
  return prisma.galleryImage.findMany({
    where: { communityId },
    include: {
      uploadedBy: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addGalleryImage(data: {
  communityId: number;
  uploadedById: number;
  url: string;
  caption?: string;
  category?: string;
}) {
  return prisma.galleryImage.create({
    data,
    include: {
      uploadedBy: { select: { id: true, username: true } },
    },
  });
}

export async function deleteGalleryImage(imageId: number) {
  await prisma.galleryImage.delete({ where: { id: imageId } });
}
