"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";
import {
  type BoardMember,
  type BoardSectionData,
  boardSectionsData,
} from "@/app/(app)/club/[id]/components/board/boardData";
import MemberEditorDialog from "../../components/roster/MemberEditorDialog";

type EditingContext = {
  open: boolean;
  sectionId: string;
  member: BoardMember | null;
};

const AVAILABLE_ROLES = [
  "Admin",
  "President",
  "Vice President",
  "Finances",
  "Treasury",
  "Outreach",
  "Member",
];

export default function ClubRosterPage() {
  const params = useParams<{ clubId: string }>();
  const clubId = params?.clubId || "0";
  const { getRoleForClub } = useRole();

  const [sections, setSections] = useState<BoardSectionData[]>(() => boardSectionsData);
  const [editingContext, setEditingContext] = useState<EditingContext>({
    open: false,
    sectionId: sections[0]?.id || "main-board",
    member: null,
  });

  const userRole = getRoleForClub(clubId);
  const canAssignAdmin = userRole === "Owner" || userRole === "Admin";

  const totalMembers = useMemo(() => {
    return sections.reduce((sum, section) => sum + section.members.length, 0);
  }, [sections]);

  const openAddModal = (sectionId: string) => {
    setEditingContext({
      open: true,
      sectionId,
      member: null,
    });
  };

  const openEditModal = (member: BoardMember, sectionId: string) => {
    setEditingContext({
      open: true,
      sectionId,
      member,
    });
  };

  const handleSaveMember = (member: BoardMember, sectionId: string) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const existingIndex = section.members.findIndex(
          (existingMember) => existingMember.id === member.id,
        );

        if (existingIndex === -1) {
          return { ...section, members: [...section.members, member] };
        }

        return {
          ...section,
          members: section.members.map((existingMember) =>
            existingMember.id === member.id ? member : existingMember,
          ),
        };
      }),
    );
  };

  const handleRemoveMember = (memberId: string, sectionId: string) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        return {
          ...section,
          members: section.members.filter((member) => member.id !== memberId),
        };
      }),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Roster Management</h2>
          <p className="text-sm text-slate-600">
            Add, edit, and remove board members while previewing public card output.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--admin-brand-teal-soft)] px-3 py-1 text-xs font-semibold text-[var(--admin-brand-teal)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-brand-teal)]" />
          {totalMembers} total members
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section
            key={section.id}
            className="rounded-xl border border-[var(--admin-border)] bg-white p-4"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.members.length} members</p>
              </div>
              <Button
                type="button"
                onClick={() => openAddModal(section.id)}
                className="h-[40px] rounded-[5px] bg-[#354a9c] text-white hover:bg-[#2e448b]"
              >
                Add Member
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 font-semibold">Name</th>
                    <th className="py-2 font-semibold">Role</th>
                    <th className="py-2 font-semibold">Image URL</th>
                    <th className="py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-[var(--admin-border)] text-slate-700 last:border-b-0"
                    >
                      <td className="py-2.5 font-medium text-slate-900">{member.name}</td>
                      <td className="py-2.5">{member.role}</td>
                      <td className="max-w-[280px] truncate py-2.5 text-xs text-slate-500">
                        {member.imageURL || "No image URL"}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openEditModal(member, section.id)}
                          className="h-[34px] rounded-[5px] border-[#c8c8c8] px-3"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <MemberEditorDialog
        key={`${editingContext.sectionId}-${editingContext.member?.id ?? "new"}-${editingContext.open ? "open" : "closed"}`}
        open={editingContext.open}
        onOpenChange={(open) => setEditingContext((current) => ({ ...current, open }))}
        sectionId={editingContext.sectionId}
        editingMember={editingContext.member}
        availableRoles={AVAILABLE_ROLES}
        canAssignAdmin={canAssignAdmin}
        onSave={handleSaveMember}
        onRemove={handleRemoveMember}
      />
    </div>
  );
}
