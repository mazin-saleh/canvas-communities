// @ts-nocheck — depends on AdminRequest/ClubAdmin/AuditLog models not yet in schema
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminRequestStatus, PlatformRole } from "@/lib/access-enums";
import {
  ForbiddenError,
  UnauthorizedError,
  readBearerTokenFromHeaders,
  validateDbSession,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const createAdminRequestSchema = z.object({
  justification: z
    .string()
    .trim()
    .min(20, "Justification must be at least 20 characters")
    .max(2000, "Justification must be 2000 characters or fewer"),
});

function parseClubId(rawClubId: string): number | null {
  const parsed = Number(rawClubId);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

function buildValidationError(error: z.ZodError): string {
  const [firstIssue] = error.issues;
  return firstIssue?.message ?? "Invalid request payload";
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ clubId: string }> }
) {
  try {
    const { clubId: rawClubId } = await context.params;
    const clubId = parseClubId(rawClubId);
    if (!clubId) {
      return NextResponse.json({ error: "Invalid clubId" }, { status: 404 });
    }

    const sessionToken = readBearerTokenFromHeaders(req.headers);
    const session = await validateDbSession({ sessionToken });

    const [club, user] = await Promise.all([
      prisma.community.findUnique({ where: { id: clubId }, select: { id: true } }),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, platformRole: true },
      }),
    ]);

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const isGeneralUser = user.platformRole === PlatformRole.GENERAL_USER;
    const membership = await prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId: session.userId,
          communityId: clubId,
        },
      },
      select: { id: true },
    });

    if (!isGeneralUser && !membership) {
      throw new ForbiddenError(
        "Only general users or existing club members can request admin access"
      );
    }

    const existingPendingRequest = await prisma.adminRequest.findFirst({
      where: {
        userId: session.userId,
        status: AdminRequestStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        { error: "You already have a pending admin request" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = createAdminRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: buildValidationError(parsed.error) },
        { status: 400 }
      );
    }

    const adminRequest = await prisma.adminRequest.create({
      data: {
        userId: session.userId,
        communityId: clubId,
        status: AdminRequestStatus.PENDING,
        justification: parsed.data.justification,
      },
      select: {
        id: true,
        userId: true,
        communityId: true,
        status: true,
        justification: true,
        requestedAt: true,
      },
    });

    return NextResponse.json(adminRequest, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: buildValidationError(error) }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
