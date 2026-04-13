// @ts-nocheck — depends on AdminRequest/ClubAdmin/AuditLog models not yet in schema
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminRequestStatus } from "@/lib/access-enums";
import {
  ForbiddenError,
  UnauthorizedError,
  isSuperAdmin,
  readBearerTokenFromHeaders,
  validateDbSession,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const approveRequestSchema = z.object({
  permissions: z
    .object({
      canManageSettings: z.boolean().default(false),
      canManageRoles: z.boolean().default(false),
      canManageEvents: z.boolean().default(false),
      canManageGallery: z.boolean().default(false),
      canManageAnnouncements: z.boolean().default(false),
      canManageRoster: z.boolean().default(false),
      canBlacklistUsers: z.boolean().default(false),
    })
    .default({
      canManageSettings: false,
      canManageRoles: false,
      canManageEvents: false,
      canManageGallery: false,
      canManageAnnouncements: false,
      canManageRoster: false,
      canBlacklistUsers: false,
    }),
});

function parseRequestId(rawRequestId: string): number | null {
  const parsed = Number(rawRequestId);
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
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId: rawRequestId } = await context.params;
    const requestId = parseRequestId(rawRequestId);
    if (!requestId) {
      return NextResponse.json({ error: "Invalid requestId" }, { status: 404 });
    }

    const sessionToken = readBearerTokenFromHeaders(req.headers);
    const fallbackUserIdRaw = req.nextUrl.searchParams.get("userId");
    const fallbackUserId = Number(fallbackUserIdRaw);
    const hasValidFallbackUserId =
      Number.isInteger(fallbackUserId) && fallbackUserId > 0;

    const actorUserId = sessionToken
      ? (await validateDbSession({ sessionToken })).userId
      : hasValidFallbackUserId
      ? fallbackUserId
      : null;

    if (!actorUserId) {
      throw new UnauthorizedError("Missing session token");
    }

    await isSuperAdmin(actorUserId);

    const body = await req.json();
    const parsed = approveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: buildValidationError(parsed.error) },
        { status: 400 }
      );
    }

    const request = await prisma.adminRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        userId: true,
        communityId: true,
        status: true,
      },
    });

    if (!request || request.status !== AdminRequestStatus.PENDING) {
      return NextResponse.json({ error: "Pending request not found" }, { status: 404 });
    }

    const membershipPromise = prisma.membership.upsert({
      where: {
        userId_communityId: {
          userId: request.userId,
          communityId: request.communityId,
        },
      },
      update: {},
      create: {
        userId: request.userId,
        communityId: request.communityId,
      },
    });

    const adminUpsertPromise = prisma.clubAdmin.upsert({
      where: {
        userId_communityId: {
          userId: request.userId,
          communityId: request.communityId,
        },
      },
      update: {
        ...parsed.data.permissions,
        assignedBy: actorUserId,
        updatedAt: new Date(),
      },
      create: {
        userId: request.userId,
        communityId: request.communityId,
        ...parsed.data.permissions,
        assignedBy: actorUserId,
      },
    });

    const updateRequestPromise = prisma.adminRequest.update({
      where: { id: request.id },
      data: {
        status: AdminRequestStatus.APPROVED,
        respondedAt: new Date(),
        respondedBy: actorUserId,
      },
    });

    const logPromise = prisma.auditLog.create({
      data: {
        actorId: actorUserId,
        action: "ADMIN_REQUEST_APPROVED",
        targetType: "AdminRequest",
        targetId: request.id,
        communityId: request.communityId,
        metadata: {
          approvedUserId: request.userId,
          permissions: parsed.data.permissions,
        },
      },
    });

    const [, adminRecord] = await prisma.$transaction([
      membershipPromise,
      adminUpsertPromise,
      updateRequestPromise,
      logPromise,
    ]);

    return NextResponse.json(
      {
        approvedRequestId: request.id,
        adminRecord,
      },
      { status: 200 }
    );
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
