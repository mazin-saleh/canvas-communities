import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformOwnerAction } from "@/lib/route-auth";
import { getRolesByCommunity, createRole } from "@/services/roleService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const roles = await getRolesByCommunity(communityId);
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformOwnerAction(auth.userId, communityId))) {
    return NextResponse.json({ error: "Club owner role required" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Role name is required" }, { status: 400 });

  const role = await createRole({
    communityId,
    name: body.name,
    color: body.color,
    permissions: body.permissions ?? [],
  });
  return NextResponse.json(role, { status: 201 });
}
