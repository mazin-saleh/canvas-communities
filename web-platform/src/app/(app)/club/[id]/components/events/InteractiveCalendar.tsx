"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { type EventData } from "./eventsData";
import { dateKey } from "./eventUtils";

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

  const nativeValue = selectedDate ? dateKey(selectedDate) : "";

  return (
    <>
      {/* Native date picker for small screens */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:hidden">
        <label className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">
            Filter by date
          </span>
          <input
            type="date"
            value={nativeValue}
            onChange={(e) => {
              const val = e.target.value;
              onDateSelect(val ? new Date(`${val}T00:00:00`) : undefined);
            }}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {selectedDate && (
            <button
              type="button"
              onClick={() => onDateSelect(undefined)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </label>
      </div>

      {/* Full calendar for md+ screens */}
      <div className="hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:block">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          defaultMonth={initialMonth}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-orange-500",
          }}
          formatters={{
            formatWeekdayName: (date) =>
              date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
          }}
          className="mx-auto w-full bg-white p-0 [--cell-size:2rem]"
          classNames={{
            root: "w-full",
            months: "relative flex flex-col gap-2",
            month: "flex w-full flex-col gap-2",
            nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
            button_previous:
              "inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:bg-gray-100 p-0 cursor-pointer",
            button_next:
              "inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-500 hover:bg-gray-100 p-0 cursor-pointer",
            month_caption:
              "flex h-7 w-full items-center justify-center px-8",
            caption_label:
              "select-none text-sm font-semibold tracking-wide text-gray-900",
            dropdowns: "flex items-center gap-1.5 text-sm font-medium",
            dropdown_root: "",
            dropdown: "",
            weekdays: "flex",
            weekday:
              "flex-1 select-none text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 pb-1",
            week: "mt-1 flex w-full",
            week_number_header: "",
            week_number: "",
            day: "relative flex-1 p-0 text-center",
            day_button:
              "inline-flex h-[var(--cell-size)] w-[var(--cell-size)] items-center justify-center rounded-full text-xs font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-300",
            selected:
              "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:hover:bg-orange-500 [&>button]:rounded-full",
            today:
              "[&>button]:bg-orange-500 [&>button]:text-white [&>button]:rounded-full [&>button]:shadow-md",
            outside: "[&>button]:text-gray-300",
            disabled: "opacity-50",
            hidden: "invisible",
            range_start: "",
            range_middle: "",
            range_end: "",
          }}
        />
      </div>
    </>
  );
}
