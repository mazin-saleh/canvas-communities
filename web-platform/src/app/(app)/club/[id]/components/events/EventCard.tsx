"use client";

import { Button } from "@/components/ui/button";
import { type EventData, eventTypeColor } from "./eventsData";
import VenueMapEmbed from "../shared/VenueMapEmbed";
import {
  buildGoogleCalendarLink,
  buildGoogleMapsLink,
  resolveEventCoordinates,
} from "./eventUtils";

type EventCardProps = {
  event: EventData;
};

export default function EventCard({ event }: EventCardProps) {
  const coordinates = resolveEventCoordinates(event.locationName, event.coordinates);

  const openMap = () => {
    window.open(buildGoogleMapsLink(event), "_blank", "noopener,noreferrer");
  };

  const addToCalendar = () => {
    window.open(
      buildGoogleCalendarLink(event),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <article className="rounded-md border border-gray-300 bg-white p-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{event.title}</p>
          <p className="text-xs text-gray-500">{event.description}</p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold text-white ${eventTypeColor[event.eventType] || "bg-gray-500"}`}
        >
          {event.eventType}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={openMap}
          className="group -m-1 flex cursor-pointer items-center gap-2 rounded-md p-1 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
        >
          <VenueMapEmbed
            locationName={event.locationName}
            coordinates={coordinates}
            className="h-10 w-16"
          />
          <p className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700 underline-offset-2 transition-colors group-hover:bg-gray-200 group-hover:underline">
            {event.locationName}
          </p>
        </button>

        <Button
          type="button"
          onClick={addToCalendar}
          className="h-7 cursor-pointer rounded px-2 py-0 text-[10px] font-semibold"
        >
          Add to Calendar
        </Button>
      </div>

      <p className="mt-1 text-[11px] text-gray-500">
        {event.date} • {event.time || "TBD"}
      </p>
    </article>
  );
}
