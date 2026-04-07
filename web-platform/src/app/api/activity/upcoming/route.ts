import { NextResponse } from "next/server";
import { getUpcomingEvents } from "@/services/activityService";

export async function GET() {
  const events = await getUpcomingEvents();
  return NextResponse.json(events);
}