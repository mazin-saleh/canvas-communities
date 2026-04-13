import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { kickMember } from "@/services/roleService";

type RouteContext = { params: Promise<{ communityId: string; membershipId: string }> };

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, membershipId: mid } = await ctx.params;
  const communityId = Number(cid);
  const membershipId = Number(mid);
  if (!communityId || !membershipId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageRoster"))) {
    return NextResponse.json({ error: "Missing permission: canManageRoster" }, { status: 403 });
  }

  await kickMember(membershipId);
  return new NextResponse(null, { status: 204 });
}
