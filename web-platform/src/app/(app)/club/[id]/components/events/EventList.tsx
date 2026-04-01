import EventCard from "./EventCard";
import { type EventData } from "./eventsData";

type EventListProps = {
  events: EventData[];
  canEdit?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function EventList({ events, canEdit, onEdit, onDelete }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-500">
        No upcoming events.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          canEdit={canEdit}
          onEdit={onEdit ? () => onEdit(event.id) : undefined}
          onDelete={onDelete ? () => onDelete(event.id) : undefined}
        />
      ))}
    </div>
  );
}
