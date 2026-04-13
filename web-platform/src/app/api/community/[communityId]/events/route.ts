import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction, getUserIdFromRequest } from "@/lib/route-auth";
import { getEventsByCommunity, createEvent } from "@/services/eventService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  let includeDrafts = false;
  const userId = getUserIdFromRequest(req);
  if (userId) {
    includeDrafts = await canPerformClubAction(userId, communityId, "canManageEvents");
  }

  const events = await getEventsByCommunity(communityId, includeDrafts);
  return NextResponse.json(events);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageEvents"))) {
    return NextResponse.json({ error: "Missing permission: canManageEvents" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const event = await createEvent({
    communityId,
    createdById: auth.userId,
    title: body.title,
    description: body.description,
    date: new Date(body.date),
    time: body.time,
    locationName: body.locationName,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    eventType: body.eventType,
    capacity: body.capacity ?? null,
    status: body.status ?? "draft",
  });
  return NextResponse.json(event, { status: 201 });
}
