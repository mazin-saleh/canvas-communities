"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AnnouncementDraft,
  announcementDraftsToPublic,
} from "./types";

const CATEGORIES: Array<AnnouncementDraft["category"]> = ["news", "events"];

const initialAnnouncements: AnnouncementDraft[] = [
  {
    id: "ann-admin-001",
    title: "Welcome Night Agenda Posted",
    description: "The full run-of-show for this week is now live.",
    category: "events",
    date: "2026-04-10",
    time: "10:00",
    status: "published",
  },
  {
    id: "ann-admin-002",
    title: "Mentorship Matches Ready",
    description: "Check your inbox for your mentorship pairing details.",
    category: "news",
    date: "2026-04-11",
    time: "14:30",
    status: "draft",
  },
];

export default function AnnouncementsEditor() {
  const [items, setItems] = useState<AnnouncementDraft[]>(initialAnnouncements);

  const publicPayload = useMemo(() => announcementDraftsToPublic(items), [items]);

  const addAnnouncement = () => {
    setItems((current) => [
      ...current,
      {
        id: `ann-admin-${Date.now()}`,
        title: "",
        description: "",
        category: "news",
        date: "",
        time: "",
        status: "draft",
      },
    ]);
  };

  const update = (id: string, patch: Partial<AnnouncementDraft>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const remove = (id: string) => {
    const approved = window.confirm("Delete this announcement?");
    if (!approved) return;
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Manage announcement entries with draft and publish workflow.
        </p>
        <Button
          type="button"
          onClick={addAnnouncement}
          className="h-[40px] rounded-[5px] bg-[#354a9c] text-white hover:bg-[#2e448b]"
        >
          Add Announcement
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="space-y-3 rounded-lg border border-[var(--admin-border)] bg-white p-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={item.title}
                onChange={(event) => update(item.id, { title: event.target.value })}
                placeholder="Announcement title"
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Select
                value={item.status}
                onValueChange={(value: AnnouncementDraft["status"]) =>
                  update(item.id, { status: value })
                }
              >
                <SelectTrigger className="h-[42px] rounded-[5px] border-[#c8c8c8]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={item.description}
              onChange={(event) => update(item.id, { description: event.target.value })}
              placeholder="Announcement text"
              rows={3}
              className="rounded-[5px] border-[#c8c8c8] bg-white"
            />

            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                type="date"
                value={item.date}
                onChange={(event) => update(item.id, { date: event.target.value })}
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Input
                type="time"
                value={item.time}
                onChange={(event) => update(item.id, { time: event.target.value })}
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Select
                value={item.category}
                onValueChange={(value: AnnouncementDraft["category"]) =>
                  update(item.id, { category: value })
                }
              >
                <SelectTrigger className="h-[42px] rounded-[5px] border-[#c8c8c8]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => remove(item.id)}
                className="h-[42px] rounded-[5px] border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-lg border border-[var(--admin-border)] bg-slate-50 p-3">
        <h4 className="text-sm font-semibold text-slate-900">Published JSON Output</h4>
        <pre className="mt-2 overflow-x-auto rounded bg-white p-2 text-xs text-slate-700">
          {JSON.stringify(publicPayload, null, 2)}
        </pre>
      </section>
    </div>
  );
}
