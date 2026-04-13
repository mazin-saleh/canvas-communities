import EventCard from "./EventCard";
import InlineEventForm from "./InlineEventForm";
import { type EventData } from "./eventsData";

type EventDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  eventType: string;
  capacity: string;
  status: string;
};

type EventListProps = {
  events: EventData[];
  canEdit?: boolean;
  onCreate?: (form: EventDraft) => Promise<void>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function EventList({ events, canEdit, onCreate, onEdit, onDelete }: EventListProps) {
  return (
    <div className="space-y-3">
      {canEdit && onCreate && (
        <InlineEventForm onSubmit={onCreate} />
      )}
      {events.length === 0 && !canEdit && (
        <p className="rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-500">
          No upcoming events.
        </p>
      )}
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
