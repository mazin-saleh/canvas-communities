"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { isRoleAllowed, parseClubId, type UserRole } from "@/lib/rbac";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  clubId?: string | number;
  unauthenticatedRedirect?: string;
  unauthorizedRedirect?: string;
  fallback?: React.ReactNode;
};

export default function ProtectedRoute({
  children,
  allowedRoles,
  clubId,
  unauthenticatedRedirect = "/login",
  unauthorizedRedirect = "/discovery",
  fallback = null,
}: ProtectedRouteProps) {
  const { user, hydrated } = useAuth();
  const { getRoleForClub, hasAnyAllowedRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    if (clubId !== undefined) {
      const role = getRoleForClub(parseClubId(clubId));
      return role ? isRoleAllowed(role, allowedRoles) : false;
    }
    return hasAnyAllowedRole(allowedRoles);
  }, [allowedRoles, clubId, getRoleForClub, hasAnyAllowedRole, user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(unauthenticatedRedirect);
      return;
    }
    if (!isAuthorized) {
      router.replace(unauthorizedRedirect);
    }
  }, [hydrated, isAuthorized, router, unauthenticatedRedirect, unauthorizedRedirect, user, pathname]);

  if (!hydrated) return null;
  if (!user || !isAuthorized) return <>{fallback}</>;

  return <>{children}</>;
}
