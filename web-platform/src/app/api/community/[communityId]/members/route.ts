import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { getMembersByCommunity } from "@/services/roleService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageRoster"))) {
    return NextResponse.json({ error: "Missing permission: canManageRoster" }, { status: 403 });
  }

  const members = await getMembersByCommunity(communityId);
  return NextResponse.json(members);
}
