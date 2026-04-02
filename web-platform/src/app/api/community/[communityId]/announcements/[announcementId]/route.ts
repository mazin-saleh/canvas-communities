import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { updateAnnouncement, deleteAnnouncement } from "@/services/announcementService";

type RouteContext = { params: Promise<{ communityId: string; announcementId: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, announcementId: aid } = await ctx.params;
  const communityId = Number(cid);
  const announcementId = Number(aid);
  if (!communityId || !announcementId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageAnnouncements"))) {
    return NextResponse.json({ error: "Missing permission: canManageAnnouncements" }, { status: 403 });
  }

  const body = await req.json();
  const announcement = await updateAnnouncement(announcementId, body);
  return NextResponse.json(announcement);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, announcementId: aid } = await ctx.params;
  const communityId = Number(cid);
  const announcementId = Number(aid);
  if (!communityId || !announcementId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageAnnouncements"))) {
    return NextResponse.json({ error: "Missing permission: canManageAnnouncements" }, { status: 403 });
  }

  await deleteAnnouncement(announcementId);
  return new NextResponse(null, { status: 204 });
}
