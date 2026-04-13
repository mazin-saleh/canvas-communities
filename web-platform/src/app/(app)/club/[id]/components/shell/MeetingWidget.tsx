"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";
import { type MeetingItem } from "./types";

type MeetingWidgetProps = {
  heading?: string;
  meetings?: MeetingItem[];
};

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(raw?: string): string | null {
  if (!raw || raw === "00:00") return null;
  // raw may be "HH:MM" or already formatted
  const [h, m] = raw.split(":").map(Number);
  if (isNaN(h)) return raw;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function MeetingWidget({
  heading = "Upcoming Meeting",
  meetings,
}: MeetingWidgetProps) {
  if (!meetings || meetings.length === 0) return null;

  return (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {heading}
      </p>

      <div className="space-y-2.5">
        {meetings.map((meeting, idx) => {
          const dateStr = formatDate(meeting.date);
          const timeStr = formatTime(meeting.time);

          return (
            <div
              key={meeting.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {/* Orange accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-400" />

              <div className="p-3">
                {/* GBM label + index chip */}
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-500">
                    GBM #{idx + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    RSVP&apos;d
                  </span>
                </div>

                {/* Meeting title */}
                <p className="text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
                  {meeting.title}
                </p>

                {/* Meta row */}
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span>{dateStr}</span>
                    {timeStr && (
                      <>
                        <span className="text-gray-300">·</span>
                        <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span>{timeStr}</span>
                      </>
                    )}
                  </div>

                  {meeting.locationName && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                      <span className="font-medium text-orange-500 line-clamp-1">
                        {meeting.locationName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
