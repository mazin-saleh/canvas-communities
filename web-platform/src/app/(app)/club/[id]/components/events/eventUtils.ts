import { type EventData } from "./eventsData";

const knownVenueCoordinates: Record<string, { lat: number; lng: number }> = {
  "matherly hall 112": { lat: 29.651389, lng: -82.344026 },
  "reitz union ballroom": { lat: 29.6466, lng: -82.3471 },
  "cse building e119": { lat: 29.6485, lng: -82.3468 },
  "flavet field": { lat: 29.646, lng: -82.3516 },
  "nzh 0112": { lat: 29.651389, lng: -82.344026 },
  "student union": { lat: 29.6466, lng: -82.3471 },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toCalendarStamp(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function buildGoogleMapsLink(event: EventData) {
  const coordinates = resolveEventCoordinates(event.locationName, event.coordinates);

  if (coordinates) {
    const { lat, lng } = coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationName)}`;
}

export function resolveEventCoordinates(
  locationName: string,
  coordinates?: { lat: number; lng: number },
) {
  if (coordinates) {
    return coordinates;
  }

  const knownCoordinates = knownVenueCoordinates[normalizeVenueName(locationName)];
  return knownCoordinates;
}

export function buildGoogleCalendarLink(event: EventData) {
  const start = new Date(`${event.date}T${event.time || "00:00"}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    details: event.description,
    location: event.locationName,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeVenueName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
