"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export type ClubPermissionSet = {
  canManageSettings: boolean;
  canManageRoles: boolean;
  canManageEvents: boolean;
  canManageGallery: boolean;
  canManageAnnouncements: boolean;
  canManageRoster: boolean;
  canBlacklistUsers: boolean;
};

export type ClubAccess = {
  clubId: number;
  clubName: string;
  avatarUrl: string | null;
  isMember: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  permissions: ClubPermissionSet;
};

type ClubRole = "club_owner" | "club_admin" | "member";

type RoleContextValue = {
  hydrated: boolean;
  loading: boolean;
  platformRole: string | null;
  clubs: ClubAccess[];
  isSuperAdmin: boolean;
  getRoleForClub: (clubId: string | number) => ClubRole | null;
  isClubOwnerOrAdmin: (clubId: string | number) => boolean;
  hasClubPermission: (
    clubId: string | number,
    permission: keyof ClubPermissionSet
  ) => boolean;
  refresh: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue | null>(null);

function parseClubId(clubId: string | number): number {
  const parsed = Number(clubId);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [platformRole, setPlatformRole] = useState<string | null>(null);
  const [clubs, setClubs] = useState<ClubAccess[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setPlatformRole(null);
      setClubs([]);
      return;
    }

    setLoading(true);
    try {
      const access = await api.user.getAccess(Number(user.id));
      setPlatformRole(access.user.platformRole ?? null);
      setClubs(access.clubs);
    } catch (error) {
      console.error("[RoleContext] failed to hydrate access", error);
      setPlatformRole(null);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void refresh();
  }, [hydrated, refresh, user?.id]);

  const value = useMemo<RoleContextValue>(() => {
    const isSuperAdmin = platformRole === "SUPER_ADMIN";

    function getRoleForClub(clubId: string | number): ClubRole | null {
      const normalizedClubId = parseClubId(clubId);
      const club = clubs.find((entry) => entry.clubId === normalizedClubId);
      if (!club) {
        return null;
      }

      if (club.isOwner) {
        return "club_owner";
      }

      if (club.isAdmin) {
        return "club_admin";
      }

      return club.isMember ? "member" : null;
    }

    return {
      hydrated,
      loading,
      platformRole,
      clubs,
      isSuperAdmin,
      getRoleForClub,
      isClubOwnerOrAdmin: (clubId: string | number) => {
        if (isSuperAdmin) {
          return true;
        }
        const role = getRoleForClub(clubId);
        return role === "club_owner" || role === "club_admin";
      },
      hasClubPermission: (
        clubId: string | number,
        permission: keyof ClubPermissionSet
      ) => {
        if (isSuperAdmin) {
          return true;
        }
        const normalizedClubId = parseClubId(clubId);
        const club = clubs.find((entry) => entry.clubId === normalizedClubId);
        if (!club) {
          return false;
        }

        if (club.isOwner) {
          return true;
        }

        return club.permissions[permission] ?? false;
      },
      refresh,
    };
  }, [clubs, hydrated, loading, platformRole, refresh]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
