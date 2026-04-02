"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type AnnouncementFormData = {
  title: string;
  description: string;
  category: string;
  status: string;
};

type AnnouncementFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<AnnouncementFormData>;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  title?: string;
};

export default function AnnouncementFormModal({ open, onOpenChange, initialData, onSubmit, title }: AnnouncementFormModalProps) {
  const [form, setForm] = useState<AnnouncementFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "news",
    status: initialData?.status ?? "published",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to save announcement", e);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "h-9 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-xl border-stone-200 p-0 shadow-xl">
        <DialogHeader className="border-b border-stone-100 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-stone-900">{title ?? "New Announcement"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div>
            <Label className={labelClass}>Title <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Announcement title"
              className={fieldClass}
            />
          </div>

          <div>
            <Label className={labelClass}>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Details..."
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div>
            <Label className={labelClass}>Category</Label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, category: "news" }))}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${form.category === "news" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                News
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, category: "events" }))}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${form.category === "events" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                Events
              </button>
            </div>
          </div>

          <div>
            <Label className={labelClass}>Status</Label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, status: "draft" }))}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${form.status === "draft" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, status: "published" }))}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${form.status === "published" ? "bg-orange-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                Published
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-stone-100 px-5 py-3 bg-stone-50/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border-stone-300 text-sm text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="h-9 rounded-md bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:text-stone-500"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
