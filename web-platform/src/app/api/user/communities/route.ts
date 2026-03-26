import { NextRequest, NextResponse } from "next/server";
import { getUserCommunities } from "@/services/userService";

export async function GET(req: NextRequest) {
  try {
    const userIdParam = req.nextUrl.searchParams.get("userId");
    const userId = Number(userIdParam);
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const communities = await getUserCommunities(userId);
    return NextResponse.json(communities);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}