"use client";

import React, { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import type { ClubPermissionSet } from "@/context/RoleContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireClubOwnerOrAdmin?: boolean;
  requiredClubPermission?: keyof ClubPermissionSet;
  clubId?: string | number;
  unauthenticatedRedirect?: string;
  unauthorizedRedirect?: string;
  fallback?: React.ReactNode;
};

export default function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  requireClubOwnerOrAdmin = false,
  requiredClubPermission,
  clubId,
  unauthenticatedRedirect = "/login",
  unauthorizedRedirect = "/discovery",
  fallback = null,
}: ProtectedRouteProps) {
  const { user, hydrated } = useAuth();
  const { isSuperAdmin, isClubOwnerOrAdmin, hasClubPermission } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (!user) return false;

    if (requireSuperAdmin && !isSuperAdmin) {
      return false;
    }

    if (requireClubOwnerOrAdmin) {
      if (clubId === undefined) {
        return false;
      }

      if (!isClubOwnerOrAdmin(clubId)) {
        return false;
      }
    }

    if (requiredClubPermission) {
      if (clubId === undefined) {
        return false;
      }

      return hasClubPermission(clubId, requiredClubPermission);
    }

    return true;
  }, [
    clubId,
    hasClubPermission,
    isClubOwnerOrAdmin,
    isSuperAdmin,
    requireClubOwnerOrAdmin,
    requireSuperAdmin,
    requiredClubPermission,
    user,
  ]);

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
