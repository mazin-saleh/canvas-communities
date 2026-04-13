import InteractiveCalendar from "./InteractiveCalendar";
import EventLegend from "./EventLegend";
import { type EventData } from "./eventsData";

type EventsSidebarProps = {
  events: EventData[];
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  activeType: string;
  onTypeChange: (eventType: string) => void;
  eventTypes: string[];
  eventCountByType: Record<string, number>;
};

export default function EventsSidebar({
  events,
  selectedDate,
  onDateSelect,
  activeType,
  onTypeChange,
  eventTypes,
  eventCountByType,
}: EventsSidebarProps) {
  return (
    <aside className="space-y-3">
      <InteractiveCalendar
        events={events}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
      />
      <EventLegend
        activeType={activeType}
        onChange={onTypeChange}
        eventTypes={eventTypes}
        eventCountByType={eventCountByType}
      />
    </aside>
  );
}
