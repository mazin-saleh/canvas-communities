import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/route-auth";
import { rsvpToEvent, cancelRsvp } from "@/services/eventService";

type RouteContext = { params: Promise<{ communityId: string; eventId: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { eventId: eid } = await ctx.params;
  const eventId = Number(eid);
  if (!eventId) return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const rsvp = await rsvpToEvent(eventId, auth.userId);
    return NextResponse.json(rsvp, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { eventId: eid } = await ctx.params;
  const eventId = Number(eid);
  if (!eventId) return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  await cancelRsvp(eventId, auth.userId);
  return new NextResponse(null, { status: 204 });
}
