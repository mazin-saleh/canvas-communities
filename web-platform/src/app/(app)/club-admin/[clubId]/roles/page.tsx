"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useClubAdmin } from "../ClubAdminContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const ALL_PERMISSIONS = [
  { key: "canManageEvents", label: "Events" },
  { key: "canManageAnnouncements", label: "Announcements" },
  { key: "canManageGallery", label: "Gallery" },
  { key: "canManageRoster", label: "Roster" },
  { key: "canManageRoles", label: "Role Assignments" },
  { key: "canManageSettings", label: "Settings" },
];

const COLOR_PRESETS = [
  "#ea580c", "#2563eb", "#059669", "#7c3aed", "#dc2626", "#0891b2", "#d97706", "#57534e",
];

type RoleFormData = {
  name: string;
  color: string;
  permissions: string[];
};

export default function ClubRolesPage() {
  const { roles, actions, isOwner } = useClubAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({ name: "", color: COLOR_PRESETS[0], permissions: [] });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    roles.fetch();
  }, [roles]);

  if (!isOwner) {
    return <p className="py-8 text-center text-sm text-stone-400">Only the club owner can manage roles.</p>;
  }

  const openCreateModal = () => {
    setEditingRoleId(null);
    setFormData({ name: "", color: COLOR_PRESETS[0], permissions: [] });
    setModalOpen(true);
  };

  const openEditModal = (role: { id: number; name: string; color: string; permissions: { permission: string }[] }) => {
    setEditingRoleId(role.id);
    setFormData({
      name: role.name,
      color: role.color,
      permissions: role.permissions.map(p => p.permission),
    });
    setModalOpen(true);
  };

  const togglePermission = (key: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      if (editingRoleId) {
        await actions.updateRole(editingRoleId, formData);
      } else {
        await actions.createRole(formData);
      }
      setModalOpen(false);
    } catch (e) {
      console.error("Failed to save role", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId: number) => {
    try {
      await actions.deleteRole(roleId);
      setDeleteConfirmId(null);
    } catch (e) {
      console.error("Failed to delete role", e);
    }
  };

  const roleList = roles.data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900">Roles</h2>
        <Button
          type="button"
          onClick={openCreateModal}
          className="h-8 gap-1.5 rounded-md bg-orange-600 px-3 text-xs font-medium text-white hover:bg-orange-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New Role
        </Button>
      </div>

      {roles.loading && <p className="py-8 text-center text-sm text-stone-400">Loading roles...</p>}

      {!roles.loading && roleList.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
          <p className="text-sm text-stone-500">No custom roles yet.</p>
          <p className="mt-1 text-xs text-stone-400">Create a role to assign specific permissions to members.</p>
        </div>
      )}

      {roleList.length > 0 && (
        <div className="space-y-2">
          {roleList.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                <div>
                  <p className="text-sm font-medium text-stone-900">{role.name}</p>
                  <p className="text-xs text-stone-500">
                    {role._count.members} member{role._count.members !== 1 ? "s" : ""}
                    {" · "}
                    {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(role)}
                  className="rounded p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  title="Edit role"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(role.id)}
                  className="rounded p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Delete role"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-xl border-stone-200 p-0 shadow-xl">
          <DialogHeader className="border-b border-stone-100 px-5 py-4">
            <DialogTitle className="text-base font-semibold text-stone-900">{editingRoleId ? "Edit Role" : "New Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 px-5 py-4">
            <div>
              <Label className="block text-xs font-medium text-stone-600 mb-1">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Officer"
                className="h-9 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <Label className="block text-xs font-medium text-stone-600 mb-1.5">Color</Label>
              <div className="flex gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={[
                      "h-7 w-7 rounded-full transition-all",
                      formData.color === color ? "ring-2 ring-stone-900 ring-offset-2" : "",
                    ].join(" ")}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="block text-xs font-medium text-stone-600 mb-1.5">Permissions</Label>
              <div className="space-y-1.5 rounded-md border border-stone-200 bg-stone-50 p-3">
                {ALL_PERMISSIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(key)}
                      onChange={() => togglePermission(key)}
                      className="h-3.5 w-3.5 rounded border-stone-300 text-orange-600 accent-orange-600 focus:ring-orange-500/40"
                    />
                    <span className="text-sm text-stone-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-stone-100 px-5 py-3 bg-stone-50/50 gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="h-9 rounded-md border-stone-300 text-sm text-stone-600 hover:bg-stone-100">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="h-9 rounded-md bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:text-stone-500"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-xs gap-0 overflow-hidden rounded-xl border-stone-200 p-0 shadow-xl">
          <DialogHeader className="border-b border-stone-100 px-5 py-4">
            <DialogTitle className="text-base font-semibold text-stone-900">Delete Role</DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4">
            <p className="text-sm text-stone-600">
              This will remove the role from all members and revoke its permissions.
            </p>
          </div>
          <DialogFooter className="border-t border-stone-100 px-5 py-3 bg-stone-50/50 gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="h-9 rounded-md border-stone-300 text-sm text-stone-600 hover:bg-stone-100">
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="h-9 rounded-md bg-red-600 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
