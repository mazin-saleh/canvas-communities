import "@/lib/server-only";

import { prisma } from "./prisma";

export class AuthGuardError extends Error {
  readonly status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = "AuthGuardError";
    this.status = status;
  }
}

export class UnauthorizedError extends AuthGuardError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthGuardError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export interface SessionValidationResult {
  userId: number;
  sessionToken: string;
  sessionId: number | string | null;
  expiresAt: Date | null;
}

export interface ValidateDbSessionOptions {
  sessionToken: string | null | undefined;
  expectedUserId?: number;
}

type QueryWhere = Record<string, unknown>;
type DelegateMethod = (args: { where: QueryWhere }) => Promise<unknown>;

interface PrismaDelegateLike {
  findUnique?: DelegateMethod;
  findFirst?: DelegateMethod;
}

const PRISMA_DYNAMIC = prisma as unknown as Record<string, unknown>;

export function readBearerTokenFromHeaders(headers: Headers): string | null {
  const authorizationHeader = headers.get("authorization");
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

export async function validateDbSession(
  options: ValidateDbSessionOptions
): Promise<SessionValidationResult> {
  const sessionToken = normalizeNonEmptyString(options.sessionToken);
  if (!sessionToken) {
    throw new UnauthorizedError("Missing session token");
  }

  const sessionDelegate = getDelegate(["session", "userSession", "authSession", "sessions"]);
  if (!sessionDelegate) {
    throw new UnauthorizedError("Session store is unavailable");
  }

  const sessionRecord = await findRecord(sessionDelegate, [
    { token: sessionToken },
    { sessionToken },
    { id: sessionToken },
    { hashedToken: sessionToken },
  ]);

  if (!sessionRecord) {
    throw new UnauthorizedError("Invalid session");
  }

  const session = toRecord(sessionRecord);
  if (!session) {
    throw new UnauthorizedError("Malformed session record");
  }

  const resolvedUserId = pickNumber(session, ["userId", "accountId", "ownerId"]);
  if (resolvedUserId === null || !Number.isInteger(resolvedUserId) || resolvedUserId < 1) {
    throw new UnauthorizedError("Session has no valid user mapping");
  }

  if (
    options.expectedUserId !== undefined &&
    options.expectedUserId !== resolvedUserId
  ) {
    throw new UnauthorizedError("Session user mismatch");
  }

  ensureSessionIsActive(session);

  const user = await findUserById(resolvedUserId);
  ensureUserSessionIsCurrent(user, session);

  return {
    userId: resolvedUserId,
    sessionToken,
    sessionId: pickSessionId(session),
    expiresAt: pickDate(session, ["expiresAt", "expireAt", "validUntil"]),
  };
}

export async function isSuperAdmin(userId: number): Promise<true> {
  assertPositiveInteger(userId, "Invalid user id");
  const user = await findUserById(userId);

  const flag = pickBoolean(user, ["isSuperAdmin", "superAdmin", "isPlatformOwner"]);
  if (flag === true) {
    return true;
  }

  const role = normalizeRole(
    pickString(user, ["platformRole", "globalRole", "role", "userRole"])
  );

  if (role && ["super_admin", "superadmin", "platform_owner", "owner"].includes(role)) {
    return true;
  }

  throw new ForbiddenError("Super admin role required");
}

export async function hasClubPermission(
  userId: number,
  clubId: number,
  requiredPermission: string
): Promise<true> {
  assertPositiveInteger(userId, "Invalid user id");
  assertPositiveInteger(clubId, "Invalid club id");

  const permission = normalizePermission(requiredPermission);
  if (!permission) {
    throw new ForbiddenError("Permission is required");
  }

  await findUserById(userId);

  const membershipDelegate = getDelegate([
    "clubMembership",
    "clubMember",
    "membership",
    "communityMembership",
    "communityMember",
  ]);

  if (!membershipDelegate) {
    throw new ForbiddenError("Membership store is unavailable");
  }

  const membership = await findRecord(membershipDelegate, [
    { userId, clubId },
    { userId, communityId: clubId },
    { userId_clubId: { userId, clubId } },
    { userId_communityId: { userId, communityId: clubId } },
  ]);

  const membershipRecord = toRecord(membership);
  if (!membershipRecord) {
    throw new ForbiddenError("No club membership found");
  }

  const role = normalizeRole(
    pickString(membershipRecord, ["role", "clubRole", "membershipRole", "adminRole"])
  );

  if (!role || !["club_owner", "owner", "club_admin", "admin"].includes(role)) {
    throw new ForbiddenError("Club admin or owner role required");
  }

  const hasPermissionInMembership = permissionExistsInMembershipRecord(
    membershipRecord,
    permission
  );
  if (hasPermissionInMembership) {
    return true;
  }

  const permissionDelegate = getDelegate([
    "clubPermission",
    "clubPermissions",
    "membershipPermission",
    "rolePermission",
    "clubAdminPermission",
  ]);

  if (!permissionDelegate) {
    throw new ForbiddenError("Permission grant store is unavailable");
  }

  const grant = await findRecord(permissionDelegate, [
    { userId, clubId, permission },
    { userId, communityId: clubId, permission },
    { userId, clubId, code: permission },
    { userId, communityId: clubId, code: permission },
  ]);

  const grantRecord = toRecord(grant);
  if (!grantRecord) {
    throw new ForbiddenError(`Missing permission: ${requiredPermission}`);
  }

  const explicitDenied = pickBoolean(grantRecord, ["granted", "allowed", "isGranted"]);
  if (explicitDenied === false) {
    throw new ForbiddenError(`Missing permission: ${requiredPermission}`);
  }

  return true;
}

export async function isClubOwner(userId: number, clubId: number): Promise<true> {
  assertPositiveInteger(userId, "Invalid user id");
  assertPositiveInteger(clubId, "Invalid club id");

  await findUserById(userId);

  const ownerDelegate = getDelegate(["clubOwner", "communityOwner", "owner"]);
  if (!ownerDelegate) {
    throw new ForbiddenError("Club owner store is unavailable");
  }

  const ownership = await findRecord(ownerDelegate, [
    { communityId: clubId },
    { clubId },
    { communityId_userId: { communityId: clubId, userId } },
    { clubId_userId: { clubId, userId } },
  ]);

  const ownershipRecord = toRecord(ownership);
  if (!ownershipRecord) {
    throw new ForbiddenError("Club owner role required");
  }

  const ownerUserId = pickNumber(ownershipRecord, ["userId", "ownerId"]);
  if (ownerUserId !== null && ownerUserId === userId) {
    return true;
  }

  throw new ForbiddenError("Club owner role required");
}

function ensureSessionIsActive(session: Record<string, unknown>): void {
  const now = Date.now();

  const revoked = pickBoolean(session, ["revoked", "isRevoked", "invalidated"]);
  if (revoked === true) {
    throw new UnauthorizedError("Session revoked");
  }

  const revokedAt = pickDate(session, ["revokedAt", "invalidatedAt"]);
  if (revokedAt && revokedAt.getTime() <= now) {
    throw new UnauthorizedError("Session revoked");
  }

  const expiresAt = pickDate(session, ["expiresAt", "expireAt", "validUntil"]);
  if (expiresAt && expiresAt.getTime() <= now) {
    throw new UnauthorizedError("Session expired");
  }
}

function ensureUserSessionIsCurrent(
  user: Record<string, unknown>,
  session: Record<string, unknown>
): void {
  const disabled = pickBoolean(user, ["disabled", "isDisabled", "isSuspended", "isDeleted"]);
  if (disabled === true) {
    throw new UnauthorizedError("User is inactive");
  }

  const userVersion = pickNumber(user, ["sessionVersion", "tokenVersion", "authVersion"]);
  const sessionVersion = pickNumber(session, ["sessionVersion", "tokenVersion", "authVersion"]);

  if (userVersion !== null && sessionVersion !== null && userVersion !== sessionVersion) {
    throw new UnauthorizedError("Session invalidated");
  }

  const invalidatedAt = pickDate(user, [
    "sessionInvalidatedAt",
    "tokensInvalidatedAt",
    "authInvalidatedAt",
    "passwordChangedAt",
  ]);
  if (!invalidatedAt) {
    return;
  }

  const issuedAt = pickDate(session, ["issuedAt", "createdAt", "authenticatedAt"]);
  if (!issuedAt || issuedAt.getTime() <= invalidatedAt.getTime()) {
    throw new UnauthorizedError("Session invalidated");
  }
}

async function findUserById(userId: number): Promise<Record<string, unknown>> {
  const userDelegate = getDelegate(["user", "users"]);
  if (!userDelegate) {
    throw new UnauthorizedError("User store is unavailable");
  }

  const user = await findRecord(userDelegate, [{ id: userId }]);
  const userRecord = toRecord(user);

  if (!userRecord) {
    throw new UnauthorizedError("User not found");
  }

  // Generated Prisma client can omit newly added columns when not regenerated.
  // Merge DB-authoritative auth columns so guards remain reliable.
  const [rawUser] = await prisma.$queryRaw<
    Array<{
      id: number;
      platformRole: string | null;
      sessionVersion: number | null;
    }>
  >`
    SELECT
      id,
      "platformRole"::text AS "platformRole",
      "sessionVersion"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  if (rawUser) {
    return {
      ...userRecord,
      platformRole: rawUser.platformRole,
      sessionVersion: rawUser.sessionVersion,
    };
  }

  return userRecord;
}

async function findRecord(
  delegate: PrismaDelegateLike,
  whereCandidates: QueryWhere[]
): Promise<unknown | null> {
  for (const where of whereCandidates) {
    if (delegate.findUnique) {
      try {
        const record = await delegate.findUnique({ where });
        if (record) {
          return record;
        }
      } catch {
        // Try next candidate if schema does not support this where shape.
      }
    }

    if (delegate.findFirst) {
      try {
        const record = await delegate.findFirst({ where });
        if (record) {
          return record;
        }
      } catch {
        // Try next candidate if schema does not support this where shape.
      }
    }
  }

  return null;
}

function getDelegate(candidateNames: string[]): PrismaDelegateLike | null {
  for (const candidateName of candidateNames) {
    const value = PRISMA_DYNAMIC[candidateName];
    if (!value || typeof value !== "object") {
      continue;
    }

    const delegate = value as Record<string, unknown>;
    const hasFindUnique = typeof delegate.findUnique === "function";
    const hasFindFirst = typeof delegate.findFirst === "function";

    if (!hasFindUnique && !hasFindFirst) {
      continue;
    }

    return {
      findUnique: hasFindUnique ? (delegate.findUnique as DelegateMethod) : undefined,
      findFirst: hasFindFirst ? (delegate.findFirst as DelegateMethod) : undefined,
    };
  }

  return null;
}

function permissionExistsInMembershipRecord(
  membership: Record<string, unknown>,
  requiredPermission: string
): boolean {
  const keys = ["permissions", "grantedPermissions", "permissionSet", "allowedPermissions"];

  for (const key of keys) {
    const value = membership[key];

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string" && normalizePermission(entry) === requiredPermission) {
          return true;
        }

        const entryRecord = toRecord(entry);
        if (entryRecord) {
          const name = normalizePermission(
            pickString(entryRecord, ["permission", "code", "name", "key"]) ?? ""
          );
          const granted = pickBoolean(entryRecord, ["granted", "allowed", "isGranted"]);
          if (name === requiredPermission && granted !== false) {
            return true;
          }
        }
      }
    }

    const valueRecord = toRecord(value);
    if (valueRecord) {
      const grantedValue = valueRecord[requiredPermission];
      if (grantedValue === true) {
        return true;
      }
    }
  }

  return false;
}

function assertPositiveInteger(value: number, message: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new UnauthorizedError(message);
  }
}

function normalizePermission(permission: string): string {
  return normalizeNonEmptyString(permission)?.toLowerCase() ?? "";
}

function normalizeRole(role: string | null): string {
  return role?.trim().toLowerCase().replace(/\s+/g, "_") ?? "";
}

function normalizeNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return null;
}

function pickString(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") {
      const normalized = normalizeNonEmptyString(value);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function pickBoolean(source: Record<string, unknown>, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function pickDate(source: Record<string, unknown>, keys: string[]): Date | null {
  for (const key of keys) {
    const value = source[key];

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return null;
}

function pickSessionId(source: Record<string, unknown>): number | string | null {
  const sessionId = source.id;
  if (typeof sessionId === "number" || typeof sessionId === "string") {
    return sessionId;
  }

  return null;
}
