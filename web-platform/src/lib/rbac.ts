export const RBAC_ROLES = ["Owner", "Admin", "Editor", "Member"] as const;

export type UserRole = (typeof RBAC_ROLES)[number];

export const ROLE_WEIGHT: Record<UserRole, number> = {
  Owner: 4,
  Admin: 3,
  Editor: 2,
  Member: 1,
};

export function isRoleAllowed(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function parseClubId(clubId: string | number): number {
  const parsed = Number(clubId);
  return Number.isFinite(parsed) ? parsed : 0;
}

