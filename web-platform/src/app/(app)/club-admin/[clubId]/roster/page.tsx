"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { useClubAdmin } from "../ClubAdminContext";

export default function ClubRosterPage() {
  const { members, actions, isOwner, userPermissions } = useClubAdmin();
  const [kickingId, setKickingId] = useState<number | null>(null);

  useEffect(() => {
    members.fetch();
  }, [members]);

  const canKick = isOwner || userPermissions.includes("canManageRoster");

  const handleKick = async (membershipId: number, username: string) => {
    if (!confirm(`Remove ${username} from this club?`)) return;
    setKickingId(membershipId);
    try {
      await actions.kickMember(membershipId);
    } catch (e) {
      console.error("Failed to kick member", e);
    } finally {
      setKickingId(null);
    }
  };

  if (members.loading) {
    return <p className="py-8 text-center text-sm text-stone-400">Loading roster...</p>;
  }

  if (members.error) {
    return <p className="py-8 text-center text-sm text-red-600">Failed to load roster: {members.error}</p>;
  }

  const memberList = members.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900">Members</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
          <Users className="h-3.5 w-3.5" />
          {memberList.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50/60 text-left text-xs text-stone-500">
              <th className="px-4 py-2.5 font-medium">User</th>
              <th className="px-4 py-2.5 font-medium">Roles</th>
              {canKick && <th className="w-20 px-4 py-2.5 text-right font-medium" />}
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => (
              <tr key={member.id} className="border-b border-stone-100 last:border-b-0">
                <td className="px-4 py-3 font-medium text-stone-900">{member.user.username}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {member.assignedRoles.length > 0
                      ? member.assignedRoles.map((ar) => (
                          <span
                            key={ar.clubRole.id}
                            className="inline-block rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
                            style={{ backgroundColor: ar.clubRole.color }}
                          >
                            {ar.clubRole.name}
                          </span>
                        ))
                      : <span className="text-xs text-stone-400">--</span>
                    }
                  </div>
                </td>
                {canKick && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleKick(member.id, member.user.username)}
                      disabled={kickingId === member.id}
                      className="rounded p-1 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Remove member"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {memberList.length === 0 && (
              <tr>
                <td colSpan={canKick ? 3 : 2} className="px-4 py-10 text-center text-sm text-stone-400">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
