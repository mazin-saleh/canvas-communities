import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/user/similar?userId=1&topK=10
 *
 * Proxy to the ML engine's user-to-user similarity endpoint.
 * Used by the admin dashboard to visualize how the model connects users.
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
      `${mlUrl}/similar-users/${userId}?top_k=${topKParam}`,
      { signal: AbortSignal.timeout(30000) }
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `ML engine returned ${res.status}: ${detail}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch similar users" },
      { status: 500 }
    );
  }
}
