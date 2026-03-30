import { NextRequest, NextResponse } from "next/server";
import { getCommunityById } from "@/services/communityService";

export async function GET(req: NextRequest) {
  try {
    const idParam = req.nextUrl.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "id must be a number" }, { status: 400 });
    }

    const community = await getCommunityById(id);

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    return NextResponse.json(community);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}