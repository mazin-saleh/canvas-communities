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
  const { isSuperAdmin, isClubOwnerOrAdmin, hasClubPermission, roleReady } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  // Wait for both auth and role contexts to be ready before checking authorization
  const ready = hydrated && roleReady;

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    // Don't evaluate until role data is loaded
    if (!ready) return true; // optimistic — don't redirect while loading

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
    ready,
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
    // Only redirect when role data is fully loaded
    if (ready && !isAuthorized) {
      router.replace(unauthorizedRedirect);
    }
  }, [hydrated, ready, isAuthorized, router, unauthenticatedRedirect, unauthorizedRedirect, user, pathname]);

  if (!hydrated) return null;
  if (!user) return <>{fallback}</>;
  if (!ready) return <>{fallback}</>;
  if (!isAuthorized) return <>{fallback}</>;

  return <>{children}</>;
}
