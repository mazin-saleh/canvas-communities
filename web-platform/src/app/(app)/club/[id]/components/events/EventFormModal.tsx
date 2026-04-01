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

const EVENT_TYPES = ["General", "Social", "Academic", "Athletic", "Casual Coding"];

type EventFormData = {
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  eventType: string;
  capacity: string;
  status: string;
};

type EventFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  title?: string;
};

export default function EventFormModal({ open, onOpenChange, initialData, onSubmit, title }: EventFormModalProps) {
  const [form, setForm] = useState<EventFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    date: initialData?.date ?? "",
    time: initialData?.time ?? "18:00",
    locationName: initialData?.locationName ?? "",
    eventType: initialData?.eventType ?? "General",
    capacity: initialData?.capacity ?? "",
    status: initialData?.status ?? "published",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date) return;
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to save event", e);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "h-9 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors";
  const labelClass = "block text-xs font-medium text-stone-600 mb-1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-xl border-stone-200 p-0 shadow-xl">
        <DialogHeader className="border-b border-stone-100 px-5 py-4">
          <DialogTitle className="text-base font-semibold text-stone-900">{title ?? "Add Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div>
            <Label className={labelClass}>Title <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Event title"
              className={fieldClass}
            />
          </div>

          <div>
            <Label className={labelClass}>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="What's this event about?"
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                className={fieldClass}
              />
            </div>
            <div>
              <Label className={labelClass}>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm(p => ({ ...p, time: e.target.value }))}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <Label className={labelClass}>Location</Label>
            <Input
              value={form.locationName}
              onChange={(e) => setForm(p => ({ ...p, locationName: e.target.value }))}
              placeholder="e.g. Reitz Union Ballroom"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Type</Label>
              <div className="relative">
                <select
                  value={form.eventType}
                  onChange={(e) => setForm(p => ({ ...p, eventType: e.target.value }))}
                  className={`${fieldClass} w-full appearance-none pr-8 cursor-pointer`}
                >
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <Label className={labelClass}>Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm(p => ({ ...p, capacity: e.target.value }))}
                placeholder="Optional"
                className={fieldClass}
              />
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
            disabled={saving || !form.title.trim() || !form.date}
            className="h-9 rounded-md bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-stone-300 disabled:text-stone-500"
          >
            {saving ? "Saving..." : "Save Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
