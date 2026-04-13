import { type LucideIcon } from "lucide-react";

export type SocialLink = {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
};

export type MeetingItem = {
  id: string;
  title: string;
  date: string;
  time?: string;
  locationName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};
