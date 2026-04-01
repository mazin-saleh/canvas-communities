import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { assignRole, unassignRole } from "@/services/roleService";

type RouteContext = { params: Promise<{ communityId: string; roleId: string }> };

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, roleId: rid } = await ctx.params;
  const communityId = Number(cid);
  const roleId = Number(rid);
  if (!communityId || !roleId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageRoles"))) {
    return NextResponse.json({ error: "Missing permission: canManageRoles" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

  const assignment = await assignRole(roleId, body.membershipId);
  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, roleId: rid } = await ctx.params;
  const communityId = Number(cid);
  const roleId = Number(rid);
  if (!communityId || !roleId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageRoles"))) {
    return NextResponse.json({ error: "Missing permission: canManageRoles" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.membershipId) return NextResponse.json({ error: "membershipId required" }, { status: 400 });

  await unassignRole(roleId, body.membershipId);
  return new NextResponse(null, { status: 204 });
}
