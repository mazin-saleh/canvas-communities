import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Weights for each interaction type — feeds the ML collaborative filter
const INTERACTION_WEIGHTS: Record<string, number> = {
  view: 0.5,
  click: 1.0,
  rsvp: 2.0,
  join: 3.0,
};

/**
 * POST /api/user/track
 * Body: { userId, communityId, type }
 *
 * Logs an implicit interaction signal for the recommendation engine.
 * Fire-and-forget from the frontend — never blocks UI.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, communityId, type } = await req.json();

    if (!userId || !communityId || !type) {
      return NextResponse.json(
        { error: "userId, communityId, and type required" },
        { status: 400 }
      );
    }

    const weight = INTERACTION_WEIGHTS[type];
    if (weight === undefined) {
      return NextResponse.json(
        { error: `Invalid interaction type: ${type}` },
        { status: 400 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        userId: Number(userId),
        communityId: Number(communityId),
        type,
        weight,
      },
    });

    return NextResponse.json({ ok: true, id: interaction.id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to track interaction" },
      { status: 500 }
    );
  }
}
