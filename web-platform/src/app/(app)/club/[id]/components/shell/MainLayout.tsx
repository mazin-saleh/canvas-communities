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

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)]">
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

          <section className="min-w-0 bg-[var(--club-page-bg)] p-3 sm:p-4">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
