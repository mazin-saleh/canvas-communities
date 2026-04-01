"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ── Types ──

type MemberRole = {
  clubRole: { id: number; name: string; color: string; permissions?: { permission: string }[] };
};

type MemberWithRoles = {
  id: number;
  userId: number;
  user: { id: number; username: string };
  assignedRoles: MemberRole[];
};

type RolePermission = { id: number; permission: string };
type RoleWithPermissions = {
  id: number;
  name: string;
  color: string;
  communityId: number;
  permissions: RolePermission[];
  _count: { members: number };
};

type ClubData = {
  id: number;
  name: string;
  description: string;
  avatarUrl: string | null;
  tags: { id: number; name: string }[];
  members: MemberWithRoles[];
  owner: { userId: number } | null;
};

type LazyData<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
};

type ClubAdminContextValue = {
  clubId: number;
  club: ClubData | null;
  userPermissions: string[];
  isOwner: boolean;
  loading: boolean;
  members: LazyData<MemberWithRoles[]>;
  roles: LazyData<RoleWithPermissions[]>;
  actions: {
    createRole: (data: { name: string; color?: string; permissions: string[] }) => Promise<RoleWithPermissions>;
    updateRole: (id: number, data: { name?: string; color?: string; permissions?: string[] }) => Promise<RoleWithPermissions>;
    deleteRole: (id: number) => Promise<void>;
    assignRole: (roleId: number, membershipId: number) => Promise<void>;
    unassignRole: (roleId: number, membershipId: number) => Promise<void>;
    kickMember: (membershipId: number) => Promise<void>;
    updateClub: (data: { name?: string; description?: string; avatarUrl?: string | null }) => Promise<ClubData>;
    reloadClub: () => Promise<void>;
  };
};

const ClubAdminContext = createContext<ClubAdminContextValue | null>(null);

// ── Provider ──

export function ClubAdminProvider({ clubId, children }: { clubId: number; children: React.ReactNode }) {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : null;

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);

  // Lazy data stores
  const [membersData, setMembersData] = useState<MemberWithRoles[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [rolesData, setRolesData] = useState<RoleWithPermissions[] | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Load club on mount
  const loadClub = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.community.getById(clubId) as unknown as ClubData;
      setClub(data);
    } catch (e) {
      console.error("[ClubAdminContext] Failed to load club", e);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => { loadClub(); }, [loadClub]);

  // Compute permissions
  const isSuperAdmin = user?.platformRole === "SUPER_ADMIN";
  const isOwner = isSuperAdmin || Boolean(club?.owner && currentUserId && club.owner.userId === currentUserId);
  const userPermissions = React.useMemo(() => {
    if (!club || !currentUserId) return [];
    if (isOwner) return ["canManageEvents", "canManageAnnouncements", "canManageGallery", "canManageRoster", "canManageRoles", "canManageSettings"];
    const membership = club.members.find(m => m.userId === currentUserId);
    if (!membership) return [];
    const perms = new Set<string>();
    for (const ar of membership.assignedRoles) {
      if (ar.clubRole.permissions) {
        for (const p of ar.clubRole.permissions) {
          perms.add(p.permission);
        }
      }
    }
    return Array.from(perms);
  }, [club, currentUserId, isOwner]);

  // Lazy loaders
  const fetchMembers = useCallback(async () => {
    if (membersData !== null) return;
    setMembersLoading(true);
    try {
      const data = await api.community.getMembers(clubId) as unknown as MemberWithRoles[];
      setMembersData(data);
    } catch (e) {
      setMembersError((e as Error).message);
    } finally {
      setMembersLoading(false);
    }
  }, [clubId, membersData]);

  const fetchRoles = useCallback(async () => {
    if (rolesData !== null) return;
    setRolesLoading(true);
    try {
      const data = await api.community.getRoles(clubId) as unknown as RoleWithPermissions[];
      setRolesData(data);
    } catch (e) {
      setRolesError((e as Error).message);
    } finally {
      setRolesLoading(false);
    }
  }, [clubId, rolesData]);

  // Actions
  const actions: ClubAdminContextValue["actions"] = {
    createRole: async (data) => {
      const role = await api.community.createRole(clubId, data) as unknown as RoleWithPermissions;
      setRolesData(prev => prev ? [...prev, role] : [role]);
      return role;
    },
    updateRole: async (id, data) => {
      const role = await api.community.updateRole(clubId, id, data) as unknown as RoleWithPermissions;
      setRolesData(prev => prev ? prev.map(r => r.id === id ? role : r) : [role]);
      return role;
    },
    deleteRole: async (id) => {
      await api.community.deleteRole(clubId, id);
      setRolesData(prev => prev ? prev.filter(r => r.id !== id) : null);
    },
    assignRole: async (roleId, membershipId) => {
      await api.community.assignRole(clubId, roleId, membershipId);
      // Reload members to get updated role assignments
      setMembersData(null);
    },
    unassignRole: async (roleId, membershipId) => {
      await api.community.unassignRole(clubId, roleId, membershipId);
      setMembersData(null);
    },
    kickMember: async (membershipId) => {
      await api.community.kickMember(clubId, membershipId);
      setMembersData(prev => prev ? prev.filter(m => m.id !== membershipId) : null);
    },
    updateClub: async (data) => {
      const updated = await api.community.update(clubId, data) as unknown as ClubData;
      setClub(updated);
      return updated;
    },
    reloadClub: loadClub,
  };

  const value: ClubAdminContextValue = {
    clubId,
    club,
    userPermissions,
    isOwner,
    loading,
    members: { data: membersData, loading: membersLoading, error: membersError, fetch: fetchMembers },
    roles: { data: rolesData, loading: rolesLoading, error: rolesError, fetch: fetchRoles },
    actions,
  };

  return <ClubAdminContext.Provider value={value}>{children}</ClubAdminContext.Provider>;
}

export function useClubAdmin() {
  const ctx = useContext(ClubAdminContext);
  if (!ctx) throw new Error("useClubAdmin must be used within ClubAdminProvider");
  return ctx;
}
