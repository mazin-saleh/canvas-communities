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
import { type EventDraft, eventDraftsToPublic } from "./types";

const EVENT_TYPES = ["General", "Social", "Athletic", "Academic", "Casual Coding"];

const initialEvents: EventDraft[] = [
  {
    id: "evt-admin-001",
    title: "Spring Welcome Mixer",
    description: "Meet current members and mentors.",
    date: "2026-04-10",
    time: "18:00",
    locationName: "Reitz Union Ballroom",
    eventType: "Social",
    status: "published",
    lat: "29.6466",
    lng: "-82.3471",
  },
  {
    id: "evt-admin-002",
    title: "Build Night",
    description: "Rapid prototyping workshop.",
    date: "2026-04-14",
    time: "19:00",
    locationName: "CSE Building E119",
    eventType: "Academic",
    status: "draft",
    lat: "",
    lng: "",
  },
];

export default function EventsEditor() {
  const [items, setItems] = useState<EventDraft[]>(initialEvents);

  const publicPayload = useMemo(() => eventDraftsToPublic(items), [items]);

  const addEvent = () => {
    setItems((current) => [
      ...current,
      {
        id: `evt-admin-${Date.now()}`,
        title: "",
        description: "",
        date: "",
        time: "",
        locationName: "",
        eventType: "General",
        status: "draft",
        lat: "",
        lng: "",
      },
    ]);
  };

  const update = (id: string, patch: Partial<EventDraft>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const remove = (id: string) => {
    const approved = window.confirm("Delete this event?");
    if (!approved) return;
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Create event entries with scheduling, location, and publish controls.
        </p>
        <Button
          type="button"
          onClick={addEvent}
          className="h-[40px] rounded-[5px] bg-[#354a9c] text-white hover:bg-[#2e448b]"
        >
          Add Event
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
                placeholder="Event title"
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Select
                value={item.status}
                onValueChange={(value: EventDraft["status"]) =>
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
              placeholder="Event description"
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
              <Input
                value={item.locationName}
                onChange={(event) =>
                  update(item.id, { locationName: event.target.value })
                }
                placeholder="Location"
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Select
                value={item.eventType}
                onValueChange={(value) => update(item.id, { eventType: value })}
              >
                <SelectTrigger className="h-[42px] rounded-[5px] border-[#c8c8c8]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {EVENT_TYPES.map((eventType) => (
                    <SelectItem key={eventType} value={eventType}>
                      {eventType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                value={item.lat}
                onChange={(event) => update(item.id, { lat: event.target.value })}
                placeholder="Latitude (optional)"
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <Input
                value={item.lng}
                onChange={(event) => update(item.id, { lng: event.target.value })}
                placeholder="Longitude (optional)"
                className="h-[42px] rounded-[5px] border-[#c8c8c8]"
              />
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(item.id)}
                  className="h-[42px] w-full rounded-[5px] border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
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
