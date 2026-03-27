import { type AnnouncementCategory, type AnnouncementItemData } from "@/app/(app)/club/[id]/components/announcementsData";
import { type EventData } from "@/app/(app)/club/[id]/components/events/eventsData";
import { type GalleryMedia } from "@/app/(app)/club/[id]/components/gallery/galleryData";

export type PublishState = "draft" | "published";

export type AnnouncementDraft = {
  id: string;
  title: string;
  description: string;
  category: AnnouncementCategory;
  date: string;
  time: string;
  status: PublishState;
};

export type EventDraft = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  eventType: string;
  status: PublishState;
  lat?: string;
  lng?: string;
};

export type GalleryDraft = GalleryMedia;

export function announcementDraftsToPublic(
  drafts: AnnouncementDraft[],
): AnnouncementItemData[] {
  return drafts
    .filter((draft) => draft.status === "published")
    .map((draft) => ({
      id: draft.id,
      dayLabel: draft.date || "TBD",
      timeLabel: draft.time || "TBD",
      title: draft.title,
      description: draft.description,
      category: draft.category,
    }));
}

export function eventDraftsToPublic(drafts: EventDraft[]): EventData[] {
  return drafts
    .filter((draft) => draft.status === "published")
    .map((draft) => {
      const lat = Number(draft.lat);
      const lng = Number(draft.lng);
      const hasCoordinates =
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        draft.lat?.trim() !== "" &&
        draft.lng?.trim() !== "";

      return {
        id: draft.id,
        title: draft.title,
        description: draft.description,
        date: draft.date,
        time: draft.time,
        locationName: draft.locationName,
        eventType: draft.eventType,
        coordinates: hasCoordinates ? { lat, lng } : undefined,
      };
    });
}
