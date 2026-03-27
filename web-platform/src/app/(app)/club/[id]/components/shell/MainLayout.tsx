import React from "react";
import PageHeader from "./PageHeader";
import ClubSidebar from "./ClubSidebar";
import { type MeetingItem, type SocialLink } from "./types";
import { clubTheme } from "./clubTheme";

type MainLayoutProps = {
  clubName: string;
  bannerSrc?: string;
  headerGradient?: string;
  logoSrc: string;
  clubDesc: string;
  clubTags: Array<string | { name?: string }>;
  joined: boolean;
  joining: boolean;
  onJoin: () => void;
  socialLinks: SocialLink[];
  upcomingMeetings?: MeetingItem[];
  children: React.ReactNode;
};

export default function MainLayout({
  clubName,
  bannerSrc,
  headerGradient,
  logoSrc,
  clubDesc,
  clubTags,
  joined,
  joining,
  onJoin,
  socialLinks,
  upcomingMeetings,
  children,
}: MainLayoutProps) {
  return (
    <div
      className="min-h-full bg-[var(--club-page-bg)]"
      style={
        {
          "--club-brand-orange": clubTheme.colors.brandOrange,
          "--club-brand-orange-hover": clubTheme.colors.brandOrangeHover,
          "--club-brand-teal": clubTheme.colors.brandTeal,
          "--club-page-bg": clubTheme.colors.pageBg,
          "--club-sidebar-bg": clubTheme.colors.sidebarBg,
        } as React.CSSProperties
      }
    >
      <div className="overflow-hidden bg-[var(--club-page-bg)]">
        <PageHeader
          clubName={clubName}
          bannerSrc={bannerSrc}
          gradient={headerGradient || clubTheme.headerGradient}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
          <ClubSidebar
            logoSrc={logoSrc}
            clubName={clubName}
            clubDesc={clubDesc}
            clubTags={clubTags}
            joined={joined}
            joining={joining}
            onJoin={onJoin}
            socialLinks={socialLinks}
            upcomingMeetings={upcomingMeetings}
          />

          <section className="min-w-0 bg-[var(--club-page-bg)] p-3 sm:p-4">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
