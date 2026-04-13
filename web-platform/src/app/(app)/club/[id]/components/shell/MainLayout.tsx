import React from "react";
import PageHeader from "./PageHeader";
import ClubSidebar from "./ClubSidebar";
import { type MeetingItem, type SocialLink } from "./types";
import { clubTheme } from "./clubTheme";

type MainLayoutProps = {
  clubName: string;
  bannerSrc?: string;
  headerGradient?: string;
  headerOverlayAction?: React.ReactNode;
  logoSrc: string;
  clubDesc: string;
  clubTags: Array<string | { name?: string }>;
  joined: boolean;
  joining: boolean;
  leaving: boolean;
  onJoin: () => void;
  onLeave: () => void;
  socialLinks: SocialLink[];
  upcomingMeetings?: MeetingItem[];
  children: React.ReactNode;
};

export default function MainLayout({
  clubName,
  bannerSrc,
  headerGradient,
  headerOverlayAction,
  logoSrc,
  clubDesc,
  clubTags,
  joined,
  joining,
  leaving,
  onJoin,
  onLeave,
  socialLinks,
  upcomingMeetings,
  children,
}: MainLayoutProps) {
  return (
    <div
      className="min-h-screen bg-[var(--club-page-bg)] lg:h-full lg:min-h-0 lg:overflow-hidden"
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
      <div className="bg-[var(--club-page-bg)] lg:flex lg:h-full lg:min-h-0 lg:flex-col">
        <div className="relative">
          <PageHeader
            clubName={clubName}
            bannerSrc={bannerSrc}
            gradient={headerGradient || clubTheme.headerGradient}
          />

          {headerOverlayAction ? (
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 sm:bottom-4 sm:right-4 lg:bottom-5 lg:right-5">
              <div className="pointer-events-auto">{headerOverlayAction}</div>
            </div>
          ) : null}
        </div>

        <div className="grid min-h-[calc(100dvh-140px)] grid-cols-1 items-stretch lg:h-full lg:min-h-0 lg:flex-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="relative z-20 h-full lg:min-h-0 lg:border-r lg:border-gray-200">
            <ClubSidebar
              logoSrc={logoSrc}
              clubName={clubName}
              clubDesc={clubDesc}
              clubTags={clubTags}
              joined={joined}
              joining={joining}
              leaving={leaving}
              onJoin={onJoin}
              onLeave={onLeave}
              socialLinks={socialLinks}
              upcomingMeetings={upcomingMeetings}
            />
          </div>

          <section className="min-w-0 bg-[var(--club-page-bg)] p-3 sm:p-4 lg:flex lg:h-full lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
