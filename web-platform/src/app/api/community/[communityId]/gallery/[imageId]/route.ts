import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { deleteGalleryImage } from "@/services/galleryService";

type RouteContext = { params: Promise<{ communityId: string; imageId: string }> };

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid, imageId: iid } = await ctx.params;
  const communityId = Number(cid);
  const imageId = Number(iid);
  if (!communityId || !imageId) return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageGallery"))) {
    return NextResponse.json({ error: "Missing permission: canManageGallery" }, { status: 403 });
  }

  await deleteGalleryImage(imageId);
  return new NextResponse(null, { status: 204 });
}
