import { NextResponse } from "next/server";
import { listAllCommunities } from "@/services/communityService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";
    const limit = Math.min(
      24,
      Math.max(1, Number(searchParams.get("limit") || 12)),
    );
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));

    const allCommunities = await listAllCommunities();
    const filtered = query
      ? allCommunities.filter((community) => {
          const name = community.name.toLowerCase();
          const tagHit = community.tags.some((tag) =>
            tag.name.toLowerCase().includes(query),
          );
          return name.includes(query) || tagHit;
        })
      : allCommunities;

    const items = filtered.slice(offset, offset + limit);
    const nextOffset = offset + items.length;

    return NextResponse.json({
      items,
      total: filtered.length,
      hasMore: nextOffset < filtered.length,
      nextOffset,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
