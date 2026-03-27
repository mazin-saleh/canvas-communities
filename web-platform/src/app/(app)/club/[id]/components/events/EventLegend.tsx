import { eventTypeColor } from "./eventsData";

type EventLegendProps = {
  activeType: string;
  onChange: (eventType: string) => void;
  eventTypes: string[];
  eventCountByType: Record<string, number>;
};

export default function EventLegend({
  activeType,
  onChange,
  eventTypes,
  eventCountByType,
}: EventLegendProps) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3 text-xs shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        Event Types
      </p>

      <button
        type="button"
        onClick={() => onChange("All")}
        className={`mb-1.5 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${activeType === "All" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
      >
        <span>All</span>
        <span>{Object.values(eventCountByType).reduce((sum, count) => sum + count, 0)}</span>
      </button>

      {eventTypes.map((eventType) => (
        <button
          key={eventType}
          type="button"
          onClick={() => onChange(eventType)}
          className={`mb-1.5 flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${activeType === eventType ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
        >
          <span className="flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${eventTypeColor[eventType] || "bg-gray-400"}`}
            />
            <span>{eventType}</span>
          </span>
          <span>{eventCountByType[eventType] || 0}</span>
        </button>
      ))}
    </div>
  );
}
