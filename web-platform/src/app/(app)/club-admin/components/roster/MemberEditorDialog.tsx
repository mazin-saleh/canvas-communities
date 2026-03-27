"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BoardMemberCard from "@/app/(app)/club/[id]/components/board/BoardMemberCard";
import { type BoardMember } from "@/app/(app)/club/[id]/components/board/boardData";

type MemberEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  editingMember: BoardMember | null;
  availableRoles: string[];
  canAssignAdmin: boolean;
  onSave: (member: BoardMember, sectionId: string) => void;
  onRemove: (memberId: string, sectionId: string) => void;
};

type MemberDraft = {
  name: string;
  role: string;
  imageURL: string;
};

function toDraft(member: BoardMember | null, availableRoles: string[]): MemberDraft {
  return {
    name: member?.name || "",
    role: member?.role || availableRoles[0] || "Member",
    imageURL: member?.imageURL || "",
  };
}

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const withProtocol = /^https?:\/\//i.test(value.trim())
      ? value.trim()
      : `https://${value.trim()}`;
    new URL(withProtocol);
    return true;
  } catch {
    return false;
  }
}

function normalizeImageUrl(value: string) {
  if (!value.trim()) return "";
  return /^https?:\/\//i.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;
}

export default function MemberEditorDialog({
  open,
  onOpenChange,
  sectionId,
  editingMember,
  availableRoles,
  canAssignAdmin,
  onSave,
  onRemove,
}: MemberEditorDialogProps) {
  const isEditing = Boolean(editingMember);
  const [draft, setDraft] = useState<MemberDraft>(() =>
    toDraft(editingMember, availableRoles),
  );
  const [nameError, setNameError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [imageUrlError, setImageUrlError] = useState("");

  const preview = useMemo(() => {
    return {
      id: editingMember?.id || "preview",
      name: draft.name.trim() || "New Member",
      role: draft.role || "Member",
      imageURL: draft.imageURL.trim() || undefined,
    };
  }, [draft.imageURL, draft.name, draft.role, editingMember?.id]);

  const disableRoleSelect = !canAssignAdmin && draft.role === "Admin";

  const validate = () => {
    let valid = true;

    if (!draft.name.trim()) {
      valid = false;
      setNameError("Name is required.");
    } else {
      setNameError("");
    }

    if (!draft.role.trim()) {
      valid = false;
      setRoleError("Role is required.");
    } else if (!canAssignAdmin && draft.role === "Admin") {
      valid = false;
      setRoleError("Only Owner/Admin can assign the Admin role.");
    } else {
      setRoleError("");
    }

    if (!isValidUrl(draft.imageURL)) {
      valid = false;
      setImageUrlError("Enter a valid image URL.");
    } else {
      setImageUrlError("");
    }

    return valid;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const member: BoardMember = {
      id: editingMember?.id || `member-${Date.now()}`,
      name: draft.name.trim(),
      role: draft.role.trim(),
      imageURL: normalizeImageUrl(draft.imageURL) || undefined,
    };

    onSave(member, sectionId);
    onOpenChange(false);
  };

  const handleRemove = () => {
    if (!editingMember) return;
    const approved = window.confirm("Remove this member from the roster?");
    if (!approved) return;

    onRemove(editingMember.id, sectionId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[var(--admin-border)] bg-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Member" : "Add Member"}</DialogTitle>
          <DialogDescription>
            Update board member details and preview the public-facing card in real time.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2 sm:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="member-name" className="text-xs font-semibold text-slate-700">
                Name
              </Label>
              <Input
                id="member-name"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Full name"
                className={[
                  "h-[44px] rounded-[5px] border bg-white px-3 text-sm text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]",
                  nameError ? "border-rose-300" : "border-[#c8c8c8]",
                ].join(" ")}
              />
              {nameError ? <p className="text-xs text-rose-600">{nameError}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-role" className="text-xs font-semibold text-slate-700">
                Role
              </Label>
              <Select
                value={draft.role}
                onValueChange={(value) => setDraft((current) => ({ ...current, role: value }))}
                disabled={disableRoleSelect}
              >
                <SelectTrigger
                  id="member-role"
                  className={[
                    "h-[44px] rounded-[5px] border bg-white px-3 text-sm focus:ring-2 focus:ring-[var(--admin-brand-teal)]",
                    roleError ? "border-rose-300" : "border-[#c8c8c8]",
                  ].join(" ")}
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableRoles.map((roleOption) => {
                    const cannotSetAdmin = !canAssignAdmin && roleOption === "Admin";
                    return (
                      <SelectItem
                        key={roleOption}
                        value={roleOption}
                        disabled={cannotSetAdmin}
                      >
                        {roleOption}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {roleError ? <p className="text-xs text-rose-600">{roleError}</p> : null}
              {!canAssignAdmin ? (
                <p className="text-xs text-slate-500">
                  Only Owner/Admin can assign the Admin role.
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-image" className="text-xs font-semibold text-slate-700">
                Image URL
              </Label>
              <Input
                id="member-image"
                value={draft.imageURL}
                onChange={(event) => setDraft((current) => ({ ...current, imageURL: event.target.value }))}
                placeholder="https://example.com/profile.jpg"
                className={[
                  "h-[44px] rounded-[5px] border bg-white px-3 text-sm text-slate-900 placeholder:text-[#636363] focus-visible:ring-2 focus-visible:ring-[var(--admin-brand-teal)]",
                  imageUrlError ? "border-rose-300" : "border-[#c8c8c8]",
                ].join(" ")}
              />
              {imageUrlError ? <p className="text-xs text-rose-600">{imageUrlError}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Card Preview
            </p>
            <BoardMemberCard
              name={preview.name}
              role={preview.role}
              imageURL={preview.imageURL}
            />
          </div>
        </div>

        <DialogFooter className="flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between sm:space-x-0">
          <div>
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                className="h-[40px] rounded-[5px] border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                Remove Member
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-[40px] rounded-[5px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="h-[40px] rounded-[5px] bg-[#354a9c] text-white hover:bg-[#2e448b]"
            >
              {isEditing ? "Save Changes" : "Add Member"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
