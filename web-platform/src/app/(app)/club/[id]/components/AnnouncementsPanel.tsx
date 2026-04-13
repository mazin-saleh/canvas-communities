"use client";

import { useMemo, useState } from "react";
import AnnouncementItem from "./AnnouncementItem";
import InlineAnnouncementForm from "./InlineAnnouncementForm";
import {
  type AnnouncementCategory,
  type AnnouncementItemData,
} from "./announcementsData";

type AnnouncementFilter = "all" | AnnouncementCategory;

type AnnouncementDraft = {
  title: string;
  description: string;
  category: string;
  status: string;
};

type AnnouncementsPanelProps = {
  announcements: (AnnouncementItemData & { pinned?: boolean })[];
  canEdit?: boolean;
  onCreate?: (form: AnnouncementDraft) => Promise<void>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, currentPinned: boolean) => void;
};

export default function AnnouncementsPanel({ announcements, canEdit, onCreate, onEdit, onDelete, onTogglePin }: AnnouncementsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<AnnouncementFilter>("all");

  const visibleAnnouncements = useMemo(() => {
    if (activeFilter === "all") {
      return announcements;
    }

    return announcements.filter(
      (announcement) => announcement.category === activeFilter,
    );
  }, [activeFilter, announcements]);

  return (
    <div className="mt-2 rounded-lg border border-gray-300 bg-[#f7f7f7] p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-semibold text-gray-500 sm:gap-4 sm:text-sm">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={activeFilter === "all" ? "text-orange-500" : "text-gray-500"}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("news")}
          className={activeFilter === "news" ? "text-orange-500" : "text-gray-500"}
        >
          News
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("events")}
          className={activeFilter === "events" ? "text-orange-500" : "text-gray-500"}
        >
          Events
        </button>
      </div>

      <div className="space-y-4">
        {canEdit && onCreate && (
          <InlineAnnouncementForm onSubmit={onCreate} />
        )}
        {visibleAnnouncements.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            canEdit={canEdit}
            onEdit={onEdit ? () => onEdit(announcement.id) : undefined}
            onDelete={onDelete ? () => onDelete(announcement.id) : undefined}
            onTogglePin={onTogglePin ? () => onTogglePin(announcement.id, announcement.pinned ?? false) : undefined}
            pinned={announcement.pinned}
          />
        ))}

        {visibleAnnouncements.length === 0 && (
          <p className="text-sm text-gray-500">No announcements in this category yet.</p>
        )}
      </div>
    </div>
  );
}
