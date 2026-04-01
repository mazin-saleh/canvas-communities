"use client";

import { Calendar, MapPin, Pencil, Trash2, Users } from "lucide-react";
import { type EventData, eventTypeColor } from "./eventsData";
import VenueMapEmbed from "../shared/VenueMapEmbed";
import {
  buildGoogleCalendarLink,
  buildGoogleMapsLink,
  resolveEventCoordinates,
} from "./eventUtils";

type EventCardProps = {
  event: EventData;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function EventCard({ event, canEdit, onEdit, onDelete }: EventCardProps) {
  const coordinates = resolveEventCoordinates(
    event.locationName,
    event.coordinates,
  );

  const openMap = () => {
    window.open(buildGoogleMapsLink(event), "_blank", "noopener,noreferrer");
  };

  return (
    <article className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">

      <div className="flex flex-col sm:flex-row">
        {/* Map thumbnail */}
        <button
          type="button"
          onClick={openMap}
          className="relative h-[160px] w-full shrink-0 cursor-pointer overflow-hidden border-b border-gray-100 sm:h-auto sm:w-[200px] sm:border-b-0 sm:border-r lg:w-[240px]"
        >
          <VenueMapEmbed
            locationName={event.locationName}
            coordinates={coordinates}
            className="h-full w-full rounded-none border-0 shadow-none"
          />
        </button>

        {/* Content area */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {event.description}
              </p>
            </div>

            {/* Metadata column */}
            <div className="hidden shrink-0 space-y-1.5 text-xs text-gray-500 sm:block">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-orange-500">{event.locationName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span>200-250p</span>
              </div>
            </div>
          </div>

          {/* Mobile metadata */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 sm:hidden">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {event.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-orange-500">{event.locationName}</span>
            </span>
          </div>

          {/* Footer: type badge + admin actions + RSVP */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white ${eventTypeColor[event.eventType] || "bg-gray-500"}`}
              >
                {event.eventType}
              </span>

              {canEdit && onEdit && (
                <button type="button" onClick={onEdit} className="rounded-full border border-gray-200 bg-gray-50 p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700" title="Edit event">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canEdit && onDelete && (
                <button type="button" onClick={onDelete} className="rounded-full border border-gray-200 bg-gray-50 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600" title="Delete event">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <span className="inline-flex items-center gap-1 rounded bg-red-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              RSVP&apos;d
              <svg
                className="h-3.5 w-3.5"
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
    </article>
  );
}
