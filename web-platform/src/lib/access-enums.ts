export const AdminRequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  DENIED: "DENIED",
} as const;

export type AdminRequestStatus =
  (typeof AdminRequestStatus)[keyof typeof AdminRequestStatus];

export const PlatformRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  GENERAL_USER: "GENERAL_USER",
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];
