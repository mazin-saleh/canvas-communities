"use client";

import { useState } from "react";
import { MapPin, Plus, X } from "lucide-react";

type EventDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  eventType: string;
  capacity: string;
  status: string;
};

type InlineEventFormProps = {
  onSubmit: (form: EventDraft) => Promise<void>;
};

const EVENT_TYPES = ["General", "Workshop", "Social", "Meeting", "Competition"];

export default function InlineEventForm({ onSubmit }: InlineEventFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [eventType, setEventType] = useState("General");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocationName("");
    setEventType("General");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !date || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        date,
        time: time || "00:00",
        locationName: locationName.trim() || "TBD",
        eventType,
        capacity: "",
        status: "published",
      });
      reset();
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-white py-4 text-sm text-gray-400 transition-colors hover:border-orange-300 hover:text-orange-400 flex items-center justify-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        Add event
      </button>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-xl border border-orange-200 bg-white">
      <div className="flex flex-col sm:flex-row">
        {/* Left — map placeholder */}
        <div className="flex h-[120px] w-full shrink-0 items-center justify-center bg-gray-100 sm:h-auto sm:w-[200px] lg:w-[240px] border-b border-gray-100 sm:border-b-0 sm:border-r">
          <MapPin className="h-8 w-8 text-gray-300" />
        </div>

        {/* Right — form fields */}
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex items-start gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title…"
              className="flex-1 text-lg font-bold text-gray-900 placeholder:text-gray-300 outline-none border-b border-gray-200 focus:border-orange-400 pb-0.5 bg-transparent"
              onKeyDown={(e) => { if (e.key === "Escape") reset(); }}
            />
            <button type="button" onClick={reset} className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description… (optional)"
            rows={2}
            className="resize-none rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-600 placeholder:text-gray-300 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Location</label>
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. MAE-A Room 303"
              className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 outline-none focus:border-orange-400"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || !date || saving}
              className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              {saving ? "Adding…" : "Add Event"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
