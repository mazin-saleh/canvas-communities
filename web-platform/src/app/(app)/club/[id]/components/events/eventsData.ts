export const eventTypeColor: Record<string, string> = {
  General: "bg-orange-500",
  Social: "bg-green-500",
  Athletic: "bg-red-500",
  Academic: "bg-blue-500",
  "Casual Coding": "bg-purple-500",
};

export type EventCoordinates = {
  lat: number;
  lng: number;
};

export type EventData = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  coordinates?: EventCoordinates;
  eventType: string;
};

export const fallbackEvents: EventData[] = [
  {
    id: "evt-001",
    title: "Spring Welcome Mixer",
    description: "Meet current members and learn about this semester\'s projects.",
    date: "2026-04-10",
    time: "18:00",
    locationName: "Reitz Union Ballroom",
    coordinates: { lat: 29.6466, lng: -82.3471 },
    eventType: "Social",
  },
  {
    id: "evt-002",
    title: "Build Night",
    description: "Hands-on workshop for rapid prototyping and collaboration.",
    date: "2026-04-14",
    time: "19:00",
    locationName: "CSE Building E119",
    coordinates: { lat: 29.6485, lng: -82.3468 },
    eventType: "Academic",
  },
  {
    id: "evt-003",
    title: "Saturday Field Day",
    description: "Friendly tournaments and activity stations for all members.",
    date: "2026-04-19",
    time: "10:30",
    locationName: "Flavet Field",
    coordinates: { lat: 29.646, lng: -82.3516 },
    eventType: "Athletic",
  },
];
