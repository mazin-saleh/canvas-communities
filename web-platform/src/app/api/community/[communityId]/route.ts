import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { updateCommunity, setCommunityTags } from "@/services/communityService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageSettings"))) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();

  // Update scalar fields (name, description, avatarUrl)
  let community = await updateCommunity(communityId, {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
    ...(body.bannerUrl !== undefined ? { bannerUrl: body.bannerUrl } : {}),
  });

  // Sync tags if provided
  if (Array.isArray(body.tags)) {
    community = await setCommunityTags(communityId, body.tags);
  }

  return NextResponse.json(community);
}
