"use client";

import { useMemo, useState } from "react";
import EventList from "./EventList";
import EventsSidebar from "./EventsSidebar";
import { type EventData } from "./eventsData";
import { dateKey } from "./eventUtils";

type EventsContainerProps = {
  events: EventData[];
  canEdit?: boolean;
  onEditEvent?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
};

export default function EventsContainer({ events, canEdit, onEditEvent, onDeleteEvent }: EventsContainerProps) {
  const [activeType, setActiveType] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.eventType))),
    [events],
  );

  const eventCountByType = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = activeType === "All" || event.eventType === activeType;
      const matchesDate =
        !selectedDate || event.date === dateKey(selectedDate);

      return matchesType && matchesDate;
    });
  }, [activeType, events, selectedDate]);

  return (
    <section className="mt-2 rounded-xl border border-gray-300 bg-[#f7f7f7] p-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
        <EventsSidebar
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          activeType={activeType}
          onTypeChange={setActiveType}
          eventTypes={eventTypes}
          eventCountByType={eventCountByType}
        />

        <EventList events={filteredEvents} canEdit={canEdit} onEdit={onEditEvent} onDelete={onDeleteEvent} />
      </div>
    </section>
  );
}
