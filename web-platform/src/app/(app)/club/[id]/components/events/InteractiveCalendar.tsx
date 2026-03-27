"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { type EventData } from "./eventsData";

type InteractiveCalendarProps = {
  events: EventData[];
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
};

export default function InteractiveCalendar({
  events,
  selectedDate,
  onDateSelect,
}: InteractiveCalendarProps) {
  const initialMonth = selectedDate ?? new Date("2021-09-01T00:00:00");

  const eventDates = useMemo(
    () =>
      events
        .map((event) => new Date(`${event.date}T00:00:00`))
        .filter((date) => !Number.isNaN(date.getTime())),
    [events],
  );

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        defaultMonth={initialMonth}
        modifiers={{ hasEvent: eventDates }}
        modifiersClassNames={{
          hasEvent:
            "relative after:absolute after:bottom-1 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-orange-500",
        }}
        className="mx-auto w-full max-w-[232px] p-0"
        classNames={{
          month_caption:
            "flex h-8 w-full items-center justify-center rounded-md bg-gray-100 px-8",
          caption_label:
            "select-none text-sm font-semibold tracking-wide text-gray-900",
          weekday:
            "flex-1 select-none rounded-md text-[11px] font-semibold uppercase tracking-wide text-gray-500",
          day_button:
            "h-8 w-8 rounded-md text-xs font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-300",
          selected:
            "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:hover:bg-orange-500",
          today: "[&>button]:border [&>button]:border-orange-400 [&>button]:bg-orange-50 [&>button]:text-orange-600",
        }}
      />
    </div>
  );
}
