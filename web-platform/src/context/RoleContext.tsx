"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { deriveMockRole, parseClubId, type UserRole } from "@/lib/rbac";

type ClubRoleMap = Record<string, UserRole>;

type RoleContextValue = {
  rolesByClub: ClubRoleMap;
  getRoleForClub: (clubId: string | number) => UserRole | null;
  hasAnyAllowedRole: (allowedRoles: UserRole[]) => boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const DEFAULT_CLUB_IDS = [1, 2, 3, 4, 5];

function createMockRolesForUser(userId: string): ClubRoleMap {
  return DEFAULT_CLUB_IDS.reduce<ClubRoleMap>((acc, clubId) => {
    acc[String(clubId)] = deriveMockRole(userId, clubId);
    return acc;
  }, {});
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const rolesByClub = useMemo<ClubRoleMap>(() => {
    if (!user) return {};
    return createMockRolesForUser(user.id);
  }, [user]);

  const value = useMemo<RoleContextValue>(() => {
    return {
      rolesByClub,
      getRoleForClub: (clubId: string | number) => {
        const key = String(parseClubId(clubId));
        return rolesByClub[key] ?? null;
      },
      hasAnyAllowedRole: (allowedRoles: UserRole[]) => {
        const currentRoles = Object.values(rolesByClub);
        return currentRoles.some((role) => allowedRoles.includes(role));
      },
    };
  }, [rolesByClub]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
