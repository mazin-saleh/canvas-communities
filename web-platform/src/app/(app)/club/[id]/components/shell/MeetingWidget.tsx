"use client";

import { Calendar, MapPin, Users } from "lucide-react";
import { type MeetingItem } from "./types";
import VenueMapEmbed from "../shared/VenueMapEmbed";
import { resolveEventCoordinates } from "../events/eventUtils";

type MeetingWidgetProps = {
  heading?: string;
  meetings?: MeetingItem[];
};

export default function MeetingWidget({
  heading = "Upcoming General Body Meeting",
  meetings,
}: MeetingWidgetProps) {
  if (!meetings || meetings.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <p className="text-base font-bold text-gray-900">{heading}</p>
      <div className="mt-3 space-y-3">
        {meetings.map((meeting, idx) => {
          const coordinates = resolveEventCoordinates(
            meeting.locationName || "",
            meeting.coordinates,
          );

          return (
            <div
              key={meeting.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex gap-0">
                {/* Map thumbnail */}
                <button
                  type="button"
                  className="relative h-auto w-[120px] shrink-0 cursor-pointer overflow-hidden border-r border-gray-100"
                  onClick={() => {
                    const query = coordinates
                      ? `${coordinates.lat},${coordinates.lng}`
                      : meeting.locationName;
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "")}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  <VenueMapEmbed
                    locationName={meeting.locationName || ""}
                    coordinates={coordinates}
                    className="h-full w-full rounded-none border-0 shadow-none"
                  />
                </button>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      GBM #{idx + 1}
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-xs leading-snug text-gray-500">
                      {meeting.title}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="space-y-0.5 text-[11px] text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{meeting.date}</span>
                      </div>
                      {meeting.locationName && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-orange-400" />
                          <span className="text-orange-500">
                            {meeting.locationName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span>200-250p</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      RSVP&apos;d
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
