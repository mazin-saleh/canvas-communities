import { NextRequest, NextResponse } from "next/server";
import { leaveCommunity } from "@/services/userService";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, communityId } = await req.json();
    if (!userId || !communityId) {
      return NextResponse.json(
        { error: "userId and communityId required" },
        { status: 400 }
      );
    }

    const result = await leaveCommunity(userId, communityId);
    if (!result) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
