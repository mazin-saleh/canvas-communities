import EventCard from "./EventCard";
import { type EventData } from "./eventsData";

type EventListProps = {
  events: EventData[];
};

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-500">
        No upcoming events.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
