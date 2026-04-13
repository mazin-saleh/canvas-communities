"use client";

import { useMemo, useState } from "react";
import EventList from "./EventList";
import EventsSidebar from "./EventsSidebar";
import { type EventData } from "./eventsData";
import { dateKey } from "./eventUtils";

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

type EventsContainerProps = {
  events: EventData[];
  canEdit?: boolean;
  onCreate?: (form: EventDraft) => Promise<void>;
  onEditEvent?: (id: string) => void;
  onDeleteEvent?: (id: string) => void;
};

export default function EventsContainer({ events, canEdit, onCreate, onEditEvent, onDeleteEvent }: EventsContainerProps) {
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
    <section className="flex h-full min-h-0 flex-col gap-3">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
        <EventsSidebar
          events={events}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          activeType={activeType}
          onTypeChange={setActiveType}
          eventTypes={eventTypes}
          eventCountByType={eventCountByType}
        />

        <EventList events={filteredEvents} canEdit={canEdit} onCreate={onCreate} onEdit={onEditEvent} onDelete={onDeleteEvent} />
      </div>
    </section>
  );
}
