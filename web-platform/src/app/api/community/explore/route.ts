import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SerendipityPick = {
  community_id: number;
  community_name: string;
  score: number;
  raw_score: number;
  endorsed_by: { user_id: number; username: string; similarity: number }[];
  endorsement_count: number;
};

type MlResponse = {
  user_id: number;
  picks: SerendipityPick[];
};

/**
 * GET /api/community/explore?userId=X&topK=10
 *
 * Proxy to the ML engine's serendipity endpoint. Hydrates the returned
 * community IDs with full Prisma objects (name, description, avatar, tags)
 * so the frontend doesn't need a second round trip.
 *
 * Response shape mirrors the recommendation endpoint so the frontend
 * can reuse the same DiscoveryClubCard component.
 */
export async function GET(req: NextRequest) {
  try {
    const userIdParam = req.nextUrl.searchParams.get("userId");
    const topKParam = req.nextUrl.searchParams.get("topK") ?? "10";

    const userId = Number(userIdParam);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const mlUrl = process.env.PYTHON_BACKEND_URL ?? "http://localhost:8000";
    const res = await fetch(
      `${mlUrl}/explore/${userId}?top_k=${topKParam}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `ML engine returned ${res.status}: ${detail}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as MlResponse;
    const picks = data.picks ?? [];

    if (picks.length === 0) {
      return NextResponse.json([]);
    }

    // Hydrate communities from Prisma so we get full objects (tags, description, avatar)
    const communityIds = picks.map((p) => p.community_id);
    const communities = await prisma.community.findMany({
      where: { id: { in: communityIds } },
      include: { tags: true },
    });

    // Keep the ML engine's ranking — build a lookup and reorder
    const byId = new Map(communities.map((c) => [c.id, c]));
    const hydrated = picks
      .map((pick) => {
        const community = byId.get(pick.community_id);
        if (!community) return null;

        // Build the "why" reason from the strongest endorser
        const topEndorser = pick.endorsed_by[0];
        const others = pick.endorsement_count - 1;
        const reason =
          others > 0
            ? `${topEndorser.username} (${Math.round(topEndorser.similarity * 100)}% similar) and ${others} other${others === 1 ? "" : "s"} joined this`
            : `${topEndorser.username} (${Math.round(topEndorser.similarity * 100)}% similar) joined this`;

        return {
          ...community,
          score: pick.score,
          contentScore: 0,
          collabScore: pick.score,
          reason,
          reasonType: "collab" as const,
          endorsedBy: pick.endorsed_by,
          endorsementCount: pick.endorsement_count,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return NextResponse.json(hydrated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch explore picks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
