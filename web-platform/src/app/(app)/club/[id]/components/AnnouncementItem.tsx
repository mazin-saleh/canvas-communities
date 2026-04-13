"use client";

import { Pencil, Pin, Trash2 } from "lucide-react";
import { type AnnouncementItemData } from "./announcementsData";

type AnnouncementItemProps = {
  announcement: AnnouncementItemData;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePin?: () => void;
  pinned?: boolean;
};

export default function AnnouncementItem({ announcement, canEdit, onEdit, onDelete, onTogglePin, pinned }: AnnouncementItemProps) {
  return (
    <article className="grid grid-cols-[56px_1fr] gap-3 border-b border-gray-200 pb-3 last:border-b-0 sm:grid-cols-[64px_1fr] sm:gap-4">
      <div className="text-xs font-medium leading-5 text-gray-400">
        <p>{announcement.dayLabel}</p>
        <p>{announcement.timeLabel}</p>
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">
              {pinned && <Pin className="mr-1 inline h-3.5 w-3.5 text-orange-500" />}
              {announcement.title}
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{announcement.description}</p>
          </div>

          {canEdit && (
            <div className="flex shrink-0 items-center gap-1">
              {onTogglePin && (
                <button type="button" onClick={onTogglePin} className={`rounded p-1 hover:bg-gray-200 ${pinned ? "text-orange-500" : "text-gray-400"}`} title={pinned ? "Unpin" : "Pin"}>
                  <Pin className="h-3.5 w-3.5" />
                </button>
              )}
              {onEdit && (
                <button type="button" onClick={onEdit} className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={onDelete} className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
