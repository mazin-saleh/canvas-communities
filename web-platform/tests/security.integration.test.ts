import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { PlatformRole } from "../src/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";
import { POST as postManageRoles } from "../src/app/api/clubs/[clubId]/manage-roles/route";
import { POST as postApproveRequest } from "../src/app/api/admin/requests/[requestId]/approve/route";
import { POST as postKickMember } from "../src/app/api/clubs/[clubId]/members/[memberId]/kick/route";

type UserRow = {
  id: number;
  platformRole: PlatformRole;
  sessionVersion: number;
};

type SessionRow = {
  id: string;
  sessionToken: string;
  userId: number;
  sessionVersion: number;
  expiresAt: Date;
};

type ClubOwnerRow = {
  userId: number;
  communityId: number;
};

type MembershipRow = {
  userId: number;
  communityId: number;
  role: "club_owner" | "club_admin" | "member";
  permissions?: Record<string, boolean>;
};

type Fixture = {
  ids: {
    ownerA: number;
    ownerB: number;
    adminA: number;
    generalUser: number;
    targetMember: number;
    clubA: number;
    clubB: number;
  };
  tokens: {
    ownerA: string;
    ownerB: string;
    adminA: string;
    generalUser: string;
  };
};

const users = new Map<number, UserRow>();
const sessions = new Map<string, SessionRow>();
const clubOwners: ClubOwnerRow[] = [];
const memberships: MembershipRow[] = [];
const mockPrisma = prisma as unknown as Record<string, unknown>;
const originalDelegates = new Map<string, unknown>();
let fixture: Fixture;

function saveOriginalDelegate(name: string) {
  if (!originalDelegates.has(name)) {
    originalDelegates.set(name, mockPrisma[name]);
  }
}

function restoreDelegates() {
  for (const [name, delegate] of originalDelegates.entries()) {
    if (delegate === undefined) {
      delete mockPrisma[name];
    } else {
      mockPrisma[name] = delegate;
    }
  }
}

function tokenFromWhere(where: Record<string, unknown>): string | null {
  const candidate =
    (where.token as string | undefined) ??
    (where.sessionToken as string | undefined) ??
    (where.id as string | undefined) ??
    (where.hashedToken as string | undefined);
  return typeof candidate === "string" ? candidate : null;
}

function clubIdFromWhere(where: Record<string, unknown>): number | null {
  if (typeof where.communityId === "number") {
    return where.communityId;
  }

  if (typeof where.clubId === "number") {
    return where.clubId;
  }

  if (where.communityId_userId && typeof where.communityId_userId === "object") {
    const value = where.communityId_userId as Record<string, unknown>;
    if (typeof value.communityId === "number") {
      return value.communityId;
    }
  }

  if (where.clubId_userId && typeof where.clubId_userId === "object") {
    const value = where.clubId_userId as Record<string, unknown>;
    if (typeof value.clubId === "number") {
      return value.clubId;
    }
  }

  return null;
}

function userIdFromWhere(where: Record<string, unknown>): number | null {
  if (typeof where.userId === "number") {
    return where.userId;
  }

  if (where.communityId_userId && typeof where.communityId_userId === "object") {
    const value = where.communityId_userId as Record<string, unknown>;
    if (typeof value.userId === "number") {
      return value.userId;
    }
  }

  if (where.clubId_userId && typeof where.clubId_userId === "object") {
    const value = where.clubId_userId as Record<string, unknown>;
    if (typeof value.userId === "number") {
      return value.userId;
    }
  }

  if (where.userId_communityId && typeof where.userId_communityId === "object") {
    const value = where.userId_communityId as Record<string, unknown>;
    if (typeof value.userId === "number") {
      return value.userId;
    }
  }

  if (where.userId_clubId && typeof where.userId_clubId === "object") {
    const value = where.userId_clubId as Record<string, unknown>;
    if (typeof value.userId === "number") {
      return value.userId;
    }
  }

  return null;
}

function installPrismaDelegates() {
  saveOriginalDelegate("session");
  saveOriginalDelegate("user");
  saveOriginalDelegate("clubOwner");
  saveOriginalDelegate("membership");
  saveOriginalDelegate("clubPermission");

  mockPrisma.session = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      const token = tokenFromWhere(where);
      if (!token) {
        return null;
      }
      return sessions.get(token) ?? null;
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const token = tokenFromWhere(where);
      if (!token) {
        return null;
      }
      return sessions.get(token) ?? null;
    },
  };

  mockPrisma.user = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      const id = typeof where.id === "number" ? where.id : null;
      if (!id) {
        return null;
      }
      return users.get(id) ?? null;
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const id = typeof where.id === "number" ? where.id : null;
      if (!id) {
        return null;
      }
      return users.get(id) ?? null;
    },
  };

  mockPrisma.clubOwner = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      const userId = userIdFromWhere(where);
      const communityId = clubIdFromWhere(where);
      if (!userId || !communityId) {
        return null;
      }

      const row = clubOwners.find(
        (owner) => owner.userId === userId && owner.communityId === communityId
      );
      return row ? { userId: row.userId, communityId: row.communityId } : null;
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const userId = userIdFromWhere(where);
      const communityId = clubIdFromWhere(where);
      if (!userId || !communityId) {
        return null;
      }

      const row = clubOwners.find(
        (owner) => owner.userId === userId && owner.communityId === communityId
      );
      return row ? { userId: row.userId, communityId: row.communityId } : null;
    },
  };

  mockPrisma.membership = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      const userId = userIdFromWhere(where);
      const communityId = clubIdFromWhere(where);
      if (!userId || !communityId) {
        return null;
      }

      const row = memberships.find(
        (membership) =>
          membership.userId === userId && membership.communityId === communityId
      );

      if (!row) {
        return null;
      }

      return {
        userId: row.userId,
        communityId: row.communityId,
        role: row.role,
        permissions: row.permissions ?? {},
      };
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const userId = userIdFromWhere(where);
      const communityId = clubIdFromWhere(where);
      if (!userId || !communityId) {
        return null;
      }

      const row = memberships.find(
        (membership) =>
          membership.userId === userId && membership.communityId === communityId
      );

      if (!row) {
        return null;
      }

      return {
        userId: row.userId,
        communityId: row.communityId,
        role: row.role,
        permissions: row.permissions ?? {},
      };
    },
  };

  mockPrisma.clubPermission = {
    findUnique: async () => null,
    findFirst: async () => null,
  };
}

function registerSession(userId: number, label: string): string {
  const token = `qa_${label}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  sessions.set(token, {
    id: token,
    sessionToken: token,
    userId,
    sessionVersion: 1,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
  return token;
}

function setupFixture(): Fixture {
  const ids = {
    ownerA: 1001,
    ownerB: 1002,
    adminA: 1003,
    generalUser: 1004,
    targetMember: 1005,
    clubA: 2001,
    clubB: 2002,
  };

  for (const id of Object.values(ids).filter((value) => value < 2000)) {
    users.set(id, {
      id,
      platformRole: PlatformRole.GENERAL_USER,
      sessionVersion: 1,
    });
  }

  clubOwners.push(
    { userId: ids.ownerA, communityId: ids.clubA },
    { userId: ids.ownerB, communityId: ids.clubB }
  );

  memberships.push(
    {
      userId: ids.adminA,
      communityId: ids.clubA,
      role: "club_admin",
      permissions: {
        canManageEvents: true,
        canManageRoster: false,
      },
    },
    {
      userId: ids.generalUser,
      communityId: ids.clubA,
      role: "member",
    },
    {
      userId: ids.targetMember,
      communityId: ids.clubA,
      role: "member",
    }
  );

  return {
    ids,
    tokens: {
      ownerA: registerSession(ids.ownerA, "ownerA"),
      ownerB: registerSession(ids.ownerB, "ownerB"),
      adminA: registerSession(ids.adminA, "adminA"),
      generalUser: registerSession(ids.generalUser, "general"),
    },
  };
}

function resetMockState() {
  users.clear();
  sessions.clear();
  clubOwners.splice(0, clubOwners.length);
  memberships.splice(0, memberships.length);
}

function jsonRequest(url: string, token: string, payload: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

describe("Phase 5 security integration tests", () => {
  before(() => {
    installPrismaDelegates();
    fixture = setupFixture();
  });

  after(() => {
    resetMockState();
    restoreDelegates();
  });

  it("IDOR prevention: club-admin of Club A cannot modify Club B", async () => {
    const req = jsonRequest(
      `http://localhost/api/clubs/${fixture.ids.clubB}/manage-roles`,
      fixture.tokens.adminA,
      {
        action: "update_permissions",
        adminUserId: fixture.ids.adminA,
        permissions: {
          canManageSettings: false,
          canManageRoles: false,
          canManageEvents: true,
          canManageGallery: false,
          canManageAnnouncements: false,
          canManageRoster: false,
          canBlacklistUsers: false,
        },
      }
    );

    const res = await postManageRoles(req, {
      params: { clubId: String(fixture.ids.clubB) },
    });

    assert.equal(res.status, 403);
  });

  it("Privilege escalation: general_user cannot assign themselves club-admin", async () => {
    const req = jsonRequest(
      `http://localhost/api/clubs/${fixture.ids.clubA}/manage-roles`,
      fixture.tokens.generalUser,
      {
        action: "update_permissions",
        adminUserId: fixture.ids.generalUser,
        permissions: {
          canManageSettings: true,
          canManageRoles: true,
          canManageEvents: true,
          canManageGallery: true,
          canManageAnnouncements: true,
          canManageRoster: true,
          canBlacklistUsers: true,
        },
      }
    );

    const res = await postManageRoles(req, {
      params: { clubId: String(fixture.ids.clubA) },
    });

    assert.equal(res.status, 403);

    const selfMembership = memberships.find(
      (membership) =>
        membership.userId === fixture.ids.generalUser &&
        membership.communityId === fixture.ids.clubA
    );
    assert.equal(selfMembership?.role, "member");
  });

  it("Privilege escalation: club-admin cannot assign themselves super_admin", async () => {
    const req = jsonRequest(
      "http://localhost/api/admin/requests/999999/approve",
      fixture.tokens.adminA,
      {
        permissions: {
          canManageSettings: true,
          canManageRoles: true,
          canManageEvents: true,
          canManageGallery: true,
          canManageAnnouncements: true,
          canManageRoster: true,
          canBlacklistUsers: true,
        },
        platformRole: PlatformRole.SUPER_ADMIN,
      }
    );

    const res = await postApproveRequest(req, {
      params: { requestId: "999999" },
    });

    assert.equal(res.status, 403);
    assert.equal(users.get(fixture.ids.adminA)?.platformRole, PlatformRole.GENERAL_USER);
  });

  it("ABAC enforcement: canManageEvents without canManageRoster cannot kick member", async () => {
    const req = jsonRequest(
      `http://localhost/api/clubs/${fixture.ids.clubA}/members/${fixture.ids.targetMember}/kick`,
      fixture.tokens.adminA,
      {}
    );

    const res = await postKickMember(req, {
      params: {
        clubId: String(fixture.ids.clubA),
        memberId: String(fixture.ids.targetMember),
      },
    });

    assert.equal(res.status, 403);

    const targetMembership = memberships.find(
      (membership) =>
        membership.userId === fixture.ids.targetMember &&
        membership.communityId === fixture.ids.clubA
    );
    assert.equal(targetMembership?.role, "member");
  });
});
