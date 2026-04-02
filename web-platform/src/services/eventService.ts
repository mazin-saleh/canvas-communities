import { prisma } from "@/lib/prisma";

export async function getEventsByCommunity(communityId: number, includesDrafts: boolean) {
  return prisma.event.findMany({
    where: {
      communityId,
      ...(includesDrafts ? {} : { status: "published" }),
    },
    include: {
      _count: { select: { rsvps: true } },
      createdBy: { select: { id: true, username: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function createEvent(data: {
  communityId: number;
  createdById: number;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  locationName?: string;
  latitude?: number | null;
  longitude?: number | null;
  eventType?: string;
  capacity?: number | null;
  status?: string;
}) {
  return prisma.event.create({
    data,
    include: {
      _count: { select: { rsvps: true } },
      createdBy: { select: { id: true, username: true } },
    },
  });
}

export async function updateEvent(
  eventId: number,
  data: Partial<{
    title: string;
    description: string;
    date: Date;
    time: string;
    locationName: string;
    latitude: number | null;
    longitude: number | null;
    eventType: string;
    capacity: number | null;
    status: string;
  }>
) {
  return prisma.event.update({
    where: { id: eventId },
    data,
    include: {
      _count: { select: { rsvps: true } },
      createdBy: { select: { id: true, username: true } },
    },
  });
}

export async function deleteEvent(eventId: number) {
  await prisma.$transaction(async (tx) => {
    await tx.eventRsvp.deleteMany({ where: { eventId } });
    await tx.event.delete({ where: { id: eventId } });
  });
}

export async function rsvpToEvent(eventId: number, userId: number) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");

    if (event.capacity !== null) {
      const count = await tx.eventRsvp.count({ where: { eventId } });
      if (count >= event.capacity) {
        throw new Error("Event is full");
      }
    }

    return tx.eventRsvp.create({
      data: { eventId, userId },
    });
  });
}

export async function cancelRsvp(eventId: number, userId: number) {
  await prisma.eventRsvp.delete({
    where: { eventId_userId: { eventId, userId } },
  });
}
