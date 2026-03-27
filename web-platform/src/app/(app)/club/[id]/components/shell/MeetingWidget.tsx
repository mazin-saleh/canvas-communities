"use client";

import { type MeetingItem } from "./types";
import VenueMapEmbed from "../shared/VenueMapEmbed";
import { resolveEventCoordinates } from "../events/eventUtils";

type MeetingWidgetProps = {
  heading?: string;
  meetings?: MeetingItem[];
};

export default function MeetingWidget({
  heading = "Upcoming General Body Meetings",
  meetings,
}: MeetingWidgetProps) {
  if (!meetings || meetings.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-300 pt-3">
      <p className="text-sm font-semibold text-gray-800">{heading}</p>
      <div className="mt-2 space-y-2">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="rounded-md border border-gray-200 bg-white p-2"
          >
            <p className="text-xs font-semibold text-gray-900">{meeting.title}</p>
            <p className="text-[11px] text-gray-500">
              {meeting.date} • {meeting.time || "TBD"}
            </p>

            {meeting.locationName && (
              <button
                type="button"
                className="group mt-2 flex w-full cursor-pointer items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                onClick={() => {
                  const coordinates = resolveEventCoordinates(
                    meeting.locationName || "",
                    meeting.coordinates,
                  );
                  const query = coordinates
                    ? `${coordinates.lat},${coordinates.lng}`
                    : meeting.locationName;

                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                <VenueMapEmbed
                  locationName={meeting.locationName}
                  coordinates={resolveEventCoordinates(
                    meeting.locationName,
                    meeting.coordinates,
                  )}
                  className="h-10 w-14"
                />
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700 transition-colors group-hover:bg-gray-200">
                  {meeting.locationName}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
