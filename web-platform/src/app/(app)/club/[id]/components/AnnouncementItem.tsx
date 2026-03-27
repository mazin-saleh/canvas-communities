import { type AnnouncementItemData } from "./announcementsData";

type AnnouncementItemProps = {
  announcement: AnnouncementItemData;
};

export default function AnnouncementItem({ announcement }: AnnouncementItemProps) {
  return (
    <article className="grid grid-cols-[56px_1fr] gap-3 border-b border-gray-200 pb-3 last:border-b-0 sm:grid-cols-[64px_1fr] sm:gap-4">
      <div className="text-sm font-semibold leading-5 text-gray-600">
        <p>{announcement.dayLabel}</p>
        <p>{announcement.timeLabel}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 sm:text-xl lg:text-2xl">
          {announcement.title}
        </h3>
        <p className="text-xs text-gray-500">{announcement.description}</p>
      </div>
    </article>
  );
}
