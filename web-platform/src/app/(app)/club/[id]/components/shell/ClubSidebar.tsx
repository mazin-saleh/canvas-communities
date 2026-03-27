import ClubIdentity from "./ClubIdentity";
import SocialLinks from "./SocialLinks";
import MeetingWidget from "./MeetingWidget";
import { type MeetingItem, type SocialLink } from "./types";

type ClubSidebarProps = {
  logoSrc: string;
  clubName: string;
  clubDesc: string;
  clubTags: Array<string | { name?: string }>;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
  socialLinks: SocialLink[];
  upcomingMeetings?: MeetingItem[];
};

export default function ClubSidebar({
  logoSrc,
  clubName,
  clubDesc,
  clubTags,
  joined,
  joining,
  onJoin,
  socialLinks,
  upcomingMeetings,
}: ClubSidebarProps) {
  return (
    <aside className="border-b border-r-0 border-gray-200 bg-[var(--club-sidebar-bg)] p-3 sm:p-4 lg:border-b-0 lg:border-r">
      <ClubIdentity
        logoSrc={logoSrc}
        clubName={clubName}
        clubDesc={clubDesc}
        clubTags={clubTags}
        joined={joined}
        joining={joining}
        onJoin={onJoin}
      />

      <SocialLinks links={socialLinks} />
      <MeetingWidget meetings={upcomingMeetings} />
    </aside>
  );
}
