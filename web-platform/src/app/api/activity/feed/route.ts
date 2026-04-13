import { NextRequest, NextResponse } from "next/server";
import { getActivityFeed } from "@/services/activityService";

export async function GET(req: NextRequest) {
  const userId = Number(req.headers.get("x-user-id"));

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feed = await getActivityFeed(userId);
  return NextResponse.json(feed);
}