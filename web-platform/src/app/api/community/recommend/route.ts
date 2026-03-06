import { NextRequest, NextResponse } from "next/server";
import { recommendCommunities } from "@/services/userService";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const recommendations = await recommendCommunities(userId);
    return NextResponse.json(recommendations);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}