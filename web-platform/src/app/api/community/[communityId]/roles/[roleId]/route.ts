import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformOwnerAction } from "@/lib/route-auth";
import { updateRole, deleteRole } from "@/services/roleService";

type RouteContext = { params: Promise<{ communityId: string; roleId: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, roleId: rid } = await ctx.params;
  const communityId = Number(cid);
  const roleId = Number(rid);
  if (!communityId || !roleId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformOwnerAction(auth.userId, communityId))) {
    return NextResponse.json({ error: "Club owner role required" }, { status: 403 });
  }

  const body = await req.json();
  const role = await updateRole(roleId, body);
  return NextResponse.json(role);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, roleId: rid } = await ctx.params;
  const communityId = Number(cid);
  const roleId = Number(rid);
  if (!communityId || !roleId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformOwnerAction(auth.userId, communityId))) {
    return NextResponse.json({ error: "Club owner role required" }, { status: 403 });
  }

  await deleteRole(roleId);
  return new NextResponse(null, { status: 204 });
}
