import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { updateEvent, deleteEvent } from "@/services/eventService";

type RouteContext = { params: Promise<{ communityId: string; eventId: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, eventId: eid } = await ctx.params;
  const communityId = Number(cid);
  const eventId = Number(eid);
  if (!communityId || !eventId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageEvents"))) {
    return NextResponse.json({ error: "Missing permission: canManageEvents" }, { status: 403 });
  }

  const body = await req.json();
  if (body.date) body.date = new Date(body.date);
  const event = await updateEvent(eventId, body);
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, eventId: eid } = await ctx.params;
  const communityId = Number(cid);
  const eventId = Number(eid);
  if (!communityId || !eventId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageEvents"))) {
    return NextResponse.json({ error: "Missing permission: canManageEvents" }, { status: 403 });
  }

  await deleteEvent(eventId);
  return new NextResponse(null, { status: 204 });
}
