import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction, getUserIdFromRequest } from "@/lib/route-auth";
import { getAnnouncementsByCommunity, createAnnouncement } from "@/services/announcementService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  let includeDrafts = false;
  const userId = getUserIdFromRequest(req);
  if (userId) {
    includeDrafts = await canPerformClubAction(userId, communityId, "canManageAnnouncements");
  }

  const announcements = await getAnnouncementsByCommunity(communityId, includeDrafts);
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageAnnouncements"))) {
    return NextResponse.json({ error: "Missing permission: canManageAnnouncements" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const announcement = await createAnnouncement({
    communityId,
    createdById: auth.userId,
    title: body.title,
    description: body.description,
    category: body.category,
    status: body.status ?? "draft",
    pinned: body.pinned ?? false,
  });
  return NextResponse.json(announcement, { status: 201 });
}
