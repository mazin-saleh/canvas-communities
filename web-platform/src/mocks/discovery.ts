export type DiscoveryClub = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  logoSrc: string;
  bannerSrc?: string;
  score?: number;
  contentScore?: number;
  collabScore?: number;
  reason?: string;
  reasonDetail?: string;
  reasonType?: "content" | "collab" | "popularity";
  matchedTags?: string[];
  nextMeeting?: {
    title: string;
    datetime: string;
    location: string;
  };
};
