import { NextRequest, NextResponse } from "next/server";
import { joinCommunity } from "@/services/userService";

async function handleJoinCommunity(req: NextRequest) {
  try {
    const { userId, communityId } = await req.json();
    if (!userId || !communityId) {
      return NextResponse.json(
        { error: "userId and communityId required" },
        { status: 400 }
      );
    }

    const membership = await joinCommunity(userId, communityId);
    return NextResponse.json(membership);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleJoinCommunity(req);
}

export async function PATCH(req: NextRequest) {
  return handleJoinCommunity(req);
}
