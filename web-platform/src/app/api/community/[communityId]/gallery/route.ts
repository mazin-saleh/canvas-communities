import { NextRequest, NextResponse } from "next/server";
import { requireAuth, canPerformClubAction } from "@/lib/route-auth";
import { getGalleryByCommunity, addGalleryImage } from "@/services/galleryService";

type RouteContext = { params: Promise<{ communityId: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const images = await getGalleryByCommunity(communityId);
  return NextResponse.json(images);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const { communityId: cid } = await ctx.params;
  const communityId = Number(cid);
  if (!communityId) return NextResponse.json({ error: "Invalid community ID" }, { status: 400 });

  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!(await canPerformClubAction(auth.userId, communityId, "canManageGallery"))) {
    return NextResponse.json({ error: "Missing permission: canManageGallery" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const image = await addGalleryImage({
    communityId,
    uploadedById: auth.userId,
    url: body.url,
    caption: body.caption,
    category: body.category,
  });
  return NextResponse.json(image, { status: 201 });
}
