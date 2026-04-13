// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminRequestStatus } from "@/lib/access-enums";
import {
  ForbiddenError,
  UnauthorizedError,
  isClubOwner,
  readBearerTokenFromHeaders,
  validateDbSession,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

const permissionsSchema = z.object({
  canManageSettings: z.boolean(),
  canManageRoles: z.boolean(),
  canManageEvents: z.boolean(),
  canManageGallery: z.boolean(),
  canManageAnnouncements: z.boolean(),
  canManageRoster: z.boolean(),
  canBlacklistUsers: z.boolean(),
});

const manageRolesSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve_request"),
    requestId: z.number().int().positive(),
    permissions: permissionsSchema,
  }),
  z.object({
    action: z.literal("deny_request"),
    requestId: z.number().int().positive(),
    reason: z.string().trim().min(3).max(500).optional(),
  }),
  z.object({
    action: z.literal("update_permissions"),
    adminUserId: z.number().int().positive(),
    permissions: permissionsSchema,
  }),
  z.object({
    action: z.literal("transfer_ownership"),
    newOwnerUserId: z.number().int().positive(),
  }),
]);

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

async function approveRequestAsOwner(
  ownerUserId: number,
  clubId: number,
  requestId: number,
  permissions: z.infer<typeof permissionsSchema>
) {
  const request = await prisma.adminRequest.findFirst({
    where: {
      id: requestId,
      communityId: clubId,
      status: AdminRequestStatus.PENDING,
    },
    select: {
      id: true,
      userId: true,
      communityId: true,
    },
  });

  if (!request) {
    return null;
  }

  const membershipPromise = prisma.membership.upsert({
    where: {
      userId_communityId: {
        userId: request.userId,
        communityId: clubId,
      },
    },
    update: {},
    create: {
      userId: request.userId,
      communityId: clubId,
    },
  });

  const adminUpsertPromise = prisma.clubAdmin.upsert({
    where: {
      userId_communityId: {
        userId: request.userId,
        communityId: clubId,
      },
    },
    update: {
      ...permissions,
      assignedBy: ownerUserId,
      updatedAt: new Date(),
    },
    create: {
      userId: request.userId,
      communityId: clubId,
      ...permissions,
      assignedBy: ownerUserId,
    },
  });

  const requestUpdatePromise = prisma.adminRequest.update({
    where: { id: request.id },
    data: {
      status: AdminRequestStatus.APPROVED,
      respondedBy: ownerUserId,
      respondedAt: new Date(),
    },
  });

  const auditLogPromise = prisma.auditLog.create({
    data: {
      actorId: ownerUserId,
      action: "OWNER_APPROVED_ADMIN_REQUEST",
      targetType: "AdminRequest",
      targetId: request.id,
      communityId: clubId,
      metadata: {
        approvedUserId: request.userId,
        permissions,
      },
    },
  });

  const [, adminRecord] = await prisma.$transaction([
    membershipPromise,
    adminUpsertPromise,
    requestUpdatePromise,
    auditLogPromise,
  ]);

  return {
    approvedRequestId: request.id,
    adminRecord,
  };
}

async function denyRequestAsOwner(
  ownerUserId: number,
  clubId: number,
  requestId: number,
  reason?: string
) {
  const request = await prisma.adminRequest.findFirst({
    where: {
      id: requestId,
      communityId: clubId,
      status: AdminRequestStatus.PENDING,
    },
    select: { id: true, userId: true },
  });

  if (!request) {
    return null;
  }

  const requestUpdatePromise = prisma.adminRequest.update({
    where: { id: request.id },
    data: {
      status: AdminRequestStatus.DENIED,
      respondedBy: ownerUserId,
      respondedAt: new Date(),
    },
  });

  const auditLogPromise = prisma.auditLog.create({
    data: {
      actorId: ownerUserId,
      action: "OWNER_DENIED_ADMIN_REQUEST",
      targetType: "AdminRequest",
      targetId: request.id,
      communityId: clubId,
      metadata: {
        deniedUserId: request.userId,
        reason: reason ?? null,
      },
    },
  });

  await prisma.$transaction([requestUpdatePromise, auditLogPromise]);

  return {
    deniedRequestId: request.id,
  };
}

async function updateAdminPermissionsAsOwner(
  ownerUserId: number,
  clubId: number,
  adminUserId: number,
  permissions: z.infer<typeof permissionsSchema>
) {
  const admin = await prisma.clubAdmin.findUnique({
    where: {
      userId_communityId: {
        userId: adminUserId,
        communityId: clubId,
      },
    },
    select: { id: true },
  });

  if (!admin) {
    return null;
  }

  const updatePromise = prisma.clubAdmin.update({
    where: { id: admin.id },
    data: {
      ...permissions,
      updatedAt: new Date(),
    },
  });

  const auditLogPromise = prisma.auditLog.create({
    data: {
      actorId: ownerUserId,
      action: "OWNER_UPDATED_ADMIN_PERMISSIONS",
      targetType: "ClubAdmin",
      targetId: admin.id,
      communityId: clubId,
      metadata: {
        adminUserId,
        permissions,
      },
    },
  });

  const [updated] = await prisma.$transaction([updatePromise, auditLogPromise]);

  return {
    updatedAdminId: updated.id,
    permissions,
  };
}

async function transferOwnership(
  currentOwnerUserId: number,
  clubId: number,
  newOwnerUserId: number
) {
  const newOwnerMembership = await prisma.membership.findUnique({
    where: {
      userId_communityId: {
        userId: newOwnerUserId,
        communityId: clubId,
      },
    },
    select: { id: true },
  });

  if (!newOwnerMembership) {
    return null;
  }

  const ownerUpdatePromise = prisma.clubOwner.update({
    where: { communityId: clubId },
    data: {
      userId: newOwnerUserId,
      assignedAt: new Date(),
    },
  });

  const demoteCurrentOwnerPromise = prisma.clubAdmin.upsert({
    where: {
      userId_communityId: {
        userId: currentOwnerUserId,
        communityId: clubId,
      },
    },
    update: {
      canManageSettings: true,
      canManageRoles: true,
      canManageEvents: true,
      canManageGallery: true,
      canManageAnnouncements: true,
      canManageRoster: true,
      canBlacklistUsers: true,
      assignedBy: newOwnerUserId,
      updatedAt: new Date(),
    },
    create: {
      userId: currentOwnerUserId,
      communityId: clubId,
      canManageSettings: true,
      canManageRoles: true,
      canManageEvents: true,
      canManageGallery: true,
      canManageAnnouncements: true,
      canManageRoster: true,
      canBlacklistUsers: true,
      assignedBy: newOwnerUserId,
    },
  });

  const removeNewOwnerAdminEntryPromise = prisma.clubAdmin.deleteMany({
    where: {
      userId: newOwnerUserId,
      communityId: clubId,
    },
  });

  const auditLogPromise = prisma.auditLog.create({
    data: {
      actorId: currentOwnerUserId,
      action: "OWNER_TRANSFERRED_OWNERSHIP",
      targetType: "ClubOwner",
      targetId: clubId,
      communityId: clubId,
      metadata: {
        previousOwnerUserId: currentOwnerUserId,
        newOwnerUserId,
      },
    },
  });

  await prisma.$transaction([
    ownerUpdatePromise,
    demoteCurrentOwnerPromise,
    removeNewOwnerAdminEntryPromise,
    auditLogPromise,
  ]);

  return {
    previousOwnerUserId: currentOwnerUserId,
    newOwnerUserId,
  };
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
    await isClubOwner(session.userId, clubId);

    const body = await req.json();
    const parsed = manageRolesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: buildValidationError(parsed.error) },
        { status: 400 }
      );
    }

    if (parsed.data.action === "approve_request") {
      const result = await approveRequestAsOwner(
        session.userId,
        clubId,
        parsed.data.requestId,
        parsed.data.permissions
      );

      if (!result) {
        return NextResponse.json({ error: "Pending request not found" }, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    if (parsed.data.action === "deny_request") {
      const result = await denyRequestAsOwner(
        session.userId,
        clubId,
        parsed.data.requestId,
        parsed.data.reason
      );

      if (!result) {
        return NextResponse.json({ error: "Pending request not found" }, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    if (parsed.data.action === "update_permissions") {
      const result = await updateAdminPermissionsAsOwner(
        session.userId,
        clubId,
        parsed.data.adminUserId,
        parsed.data.permissions
      );

      if (!result) {
        return NextResponse.json({ error: "Club admin not found" }, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    const result = await transferOwnership(
      session.userId,
      clubId,
      parsed.data.newOwnerUserId
    );

    if (!result) {
      return NextResponse.json(
        { error: "New owner must be an existing club member" },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
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
