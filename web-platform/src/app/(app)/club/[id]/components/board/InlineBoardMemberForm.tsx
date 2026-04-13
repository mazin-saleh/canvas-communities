"use client";

import { useEffect, useState } from "react";
import { Plus, X, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

type ClubRole = {
  id: number;
  name: string;
  color: string;
};

type ClubMemberOption = {
  membershipId: number;
  username: string;
  hasRole: boolean;
};

type InlineBoardMemberFormProps = {
  communityId: number;
  members: Array<{
    id: string | number;
    userId: number;
    user?: { id: number; username: string };
    assignedRoles?: { clubRole: { id: number; name: string; color: string } }[];
  }>;
  onAssigned: () => void;
};

export default function InlineBoardMemberForm({
  communityId,
  members,
  onAssigned,
}: InlineBoardMemberFormProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<ClubRole[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  // Load available roles when form opens
  useEffect(() => {
    if (!open) return;
    api.community.getRoles(communityId).then((data: unknown) => {
      setRoles(data as ClubRole[]);
    }).catch(() => {});
  }, [open, communityId]);

  // Build member options — show all members, indicate which already have roles
  const memberOptions: ClubMemberOption[] = members
    .filter((m) => m.user)
    .map((m) => ({
      membershipId: Number(m.id),
      username: m.user!.username,
      hasRole: Boolean(m.assignedRoles && m.assignedRoles.length > 0),
    }))
    .sort((a, b) => {
      // Members without roles first
      if (a.hasRole !== b.hasRole) return a.hasRole ? 1 : -1;
      return a.username.localeCompare(b.username);
    });

  const reset = () => {
    setSelectedMemberId("");
    setSelectedRoleId("");
  };

  const handleSubmit = async () => {
    if (!selectedMemberId || !selectedRoleId) return;
    setSaving(true);
    try {
      await api.community.assignRole(communityId, Number(selectedRoleId), Number(selectedMemberId));
      reset();
      setOpen(false);
      onAssigned();
    } catch (err) {
      console.error("Failed to assign role", err);
    } finally {
      setSaving(false);
    }
  };

  // Ghost state
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-white py-8 text-gray-400 transition-colors hover:border-orange-300 hover:text-orange-400"
      >
        <UserPlus className="h-6 w-6" />
        <span className="text-xs font-medium">Add board member</span>
      </button>
    );
  }

  // Expanded form — matches BoardMemberCard structure
  return (
    <article className="overflow-hidden rounded-lg border-2 border-orange-200 bg-white">
      {/* Header area matching the orange gradient of BoardMemberCard */}
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 sm:h-28 lg:h-32">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-200/60 ring-2 ring-orange-300/40 sm:h-20 sm:w-20">
          <UserPlus className="h-6 w-6 text-orange-500 sm:h-7 sm:w-7" />
        </div>
      </div>

      {/* Form area */}
      <div className="space-y-2.5 px-3 py-3">
        {/* Member select */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-500">Member</label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-200"
          >
            <option value="">Select member...</option>
            {memberOptions.map((m) => (
              <option key={m.membershipId} value={m.membershipId}>
                {m.username}{m.hasRole ? " (has role)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Role select */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-gray-500">Role</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:border-orange-300 focus:outline-none focus:ring-1 focus:ring-orange-200"
          >
            <option value="">Select role...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            disabled={!selectedMemberId || !selectedRoleId || saving}
            onClick={handleSubmit}
            className="flex-1 rounded-md bg-orange-500 px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-40"
          >
            {saving ? "Assigning..." : "Assign"}
          </button>
          <button
            type="button"
            onClick={() => { reset(); setOpen(false); }}
            className="rounded-md border border-gray-200 p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
