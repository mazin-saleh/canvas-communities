"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

type AnnouncementDraft = {
  title: string;
  description: string;
  category: string;
  status: string;
};

type InlineAnnouncementFormProps = {
  onSubmit: (form: AnnouncementDraft) => Promise<void>;
};

export default function InlineAnnouncementForm({ onSubmit }: InlineAnnouncementFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"news" | "events">("news");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const timeLabel = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("news");
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), category, status: "published" });
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
        className="mb-4 w-full rounded-lg border-2 border-dashed border-gray-200 bg-white py-3 text-sm text-gray-400 transition-colors hover:border-orange-300 hover:text-orange-400 flex items-center justify-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        New announcement
      </button>
    );
  }

  return (
    <article className="mb-4 rounded-lg border border-orange-200 bg-orange-50/40 p-3 grid grid-cols-[56px_1fr] gap-3 sm:grid-cols-[64px_1fr] sm:gap-4">
      {/* Left col — mirrors AnnouncementItem date/time display */}
      <div className="text-sm font-semibold leading-5 text-gray-600 pt-1">
        <p>Today</p>
        <p>{timeLabel}</p>
      </div>

      {/* Right col — form fields */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title…"
            className="flex-1 bg-transparent text-lg font-semibold text-gray-900 placeholder:text-gray-300 outline-none border-b border-gray-200 focus:border-orange-400 pb-0.5 sm:text-xl"
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") reset(); }}
          />
          <button type="button" onClick={reset} className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description… (optional)"
          rows={2}
          className="resize-none rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-300 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30"
        />

        <div className="flex items-center justify-between gap-3">
          {/* Category toggles */}
          <div className="flex gap-1">
            {(["news", "events"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="rounded-md bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            {saving ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </article>
  );
}
