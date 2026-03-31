"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { mockClubs } from "@/mocks/clubs";
import AnnouncementsPanel from "./components/AnnouncementsPanel";
import { announcementsData } from "./components/announcementsData";
import EventsContainer from "./components/events/EventsContainer";
import {
  fallbackEvents,
  type EventData,
  type EventCoordinates,
} from "./components/events/eventsData";
import GalleryGrid from "./components/gallery/GalleryGrid";
import { galleryData } from "./components/gallery/galleryData";
import BoardMembersPanel from "./components/board/BoardMembersPanel";
import { boardSectionsData } from "./components/board/boardData";
import MainLayout from "./components/shell/MainLayout";
import { type SocialLink } from "./components/shell/types";
import { Circle, Facebook, Linkedin, MessageCircle } from "lucide-react";
import ClubAdminPanelButton from "@/components/ClubAdminPanelButton";

type ClubMember = {
  id: string | number;
  userId: number;
};

type ClubTag = string | { name?: string };

type ClubEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  type?: string;
  coordinates?: EventCoordinates;
};

type ClubData = {
  id: string | number;
  name: string;
  description: string;
  tags: ClubTag[];
  avatarUrl?: string;
  logoSrc?: string;
  logo?: string;
  bannerUrl?: string;
  bannerSrc?: string;
  nextMeeting?: string;
  members: ClubMember[];
  events: ClubEvent[];
  joined?: boolean;
  blurb?: string;
};

type ClubPageProps = {
  club?: Partial<ClubData> | null;
  events?: ClubEvent[];
};

/**
 * Robust Club page client:
 * - uses `club` prop if passed (server can pass it)
 * - otherwise tries to resolve from mocks using the route id param (dev-friendly)
 * - if you later implement GET /api/community/[id] it will try to fetch from API as a fallback
 *
 * Note: the mock ids are strings like "gator-grilling". If your route uses numeric DB ids,
 * you can create a server API that returns community by numeric id (see notes below).
 */

export default function ClubPageClient({
  club: clubProp,
  events: eventsProp,
}: ClubPageProps) {
  const params = useParams<{ id: string }>(); // route params object in app router
  const routeId = params?.id ?? null; // e.g. "gator-grilling" or "1"
  const { user, hydrated } = useAuth();
  const currentUserId = hydrated && user ? Number(user.id) : null;

  const [club, setClub] = useState<ClubData | null | undefined>(() => {
    // prefer prop if provided
    if (clubProp) return mapSidebarMockToClub(clubProp);
    return undefined;
  });

  const [events, setEvents] = useState<ClubEvent[] | undefined>(
    () => eventsProp ?? undefined,
  );
  const [joined, setJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState(false);

  function mapSidebarMockToClub(c: Partial<ClubData>) {
    return {
      id: c.id ?? "unknown",
      name: c.name ?? "Untitled Club",
      description: c.description ?? c.blurb ?? "Club description coming soon.",
      tags: c.tags ?? [],
      avatarUrl:
        c.avatarUrl ?? c.logoSrc ?? c.logo ?? "/avatars/placeholder.png",
      bannerUrl: c.bannerUrl ?? c.bannerSrc,
      nextMeeting: c.nextMeeting,
      members: c.members ?? ([] as ClubMember[]),
      events: c.events ?? ([] as ClubEvent[]),
      joined: c.joined,
      blurb: c.blurb,
    };
  }

  // load club on mount if prop wasn't provided
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        console.log("[ClubPage] routeId:", routeId, "clubProp:", !!clubProp);

        if (clubProp) {
          console.log("[ClubPage] using passed club prop");
          setClub(clubProp);
          // compute joined from members if possible
          setJoined(
            Boolean(
              clubProp?.members?.some(
                (m) => Number(m.userId) === Number(currentUserId),
              ),
            ),
          );
          return;
        }

        // 1) Try to find mock by id (string slug)
        if (routeId) {
          const bySidebarId = mockClubs.find((d) => d.id === String(routeId));
          if (bySidebarId) {
            console.log(
              "[ClubPage] found sidebar mock club by id:",
              bySidebarId.name,
            );
            const mapped = mapSidebarMockToClub(bySidebarId);
            if (!mounted) return;
            setClub(mapped);
            setEvents(mapped.events || []);
            setJoined(
              Boolean(
                mapped.members?.some(
                  (m) => Number(m.userId) === Number(currentUserId),
                ),
              ),
            );
            return;
          }

          // 2) If routeId is numeric, try to hit API (if backend route exists)
          const maybeNum = Number(routeId);
          if (!Number.isNaN(maybeNum)) {
            try {
              console.log(
                "[ClubPage] routeId looks numeric, attempting API fetch /api/community/get?id=",
                maybeNum,
              );
              const res = await fetch(`/api/community/get?id=${maybeNum}`);
              if (!res.ok)
                throw new Error("no api route /api/community/get or not found");
              const data = (await res.json()) as Partial<ClubData>;
              if (!mounted) return;
              console.log("[ClubPage] fetched community from API:", data);
              const normalized = mapSidebarMockToClub(data);
              setClub(normalized);
              setEvents(normalized.events || []);
              setJoined(
                Boolean(
                  normalized.members?.some(
                    (m) => Number(m.userId) === Number(currentUserId),
                  ),
                ),
              );
              return;
            } catch (e) {
              console.warn(
                "[ClubPage] API fetch for numeric id failed (this is optional)",
                e,
              );
            }
          }
        }

        // 3) fallback: if nothing found, set club to null to show not found
        if (mounted) {
          console.warn("[ClubPage] club not found for routeId:", routeId);
          setClub(null); // explicit not found
        }
      } catch (err) {
        console.error("[ClubPage] load error", err);
        if (mounted) setClub(null);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [routeId, clubProp, currentUserId]);

  // keep joined in sync when club or currentUserId changes
  useEffect(() => {
    try {
      if (!club) {
        setJoined(false);
        return;
      }
      setJoined(
        Boolean(
          club?.members?.some(
            (m) => Number(m.userId) === Number(currentUserId),
          ),
        ),
      );
    } catch {
      setJoined(Boolean(club?.joined));
    }
  }, [club, currentUserId]);

  const handleJoin = async () => {
    if (!currentUserId) return;
    if (joined) return;
    setJoining(true);

    // If this is a mock (no numeric DB id), just simulate join in UI
    const isMock =
      club && typeof club.id === "string" && isNaN(Number(club.id));

    try {
      if (isMock) {
        console.log("[ClubPage] mock join simulated for club:", club.name);
        // update local state: append a fake member
        const fakeMember = {
          id: `m-${Date.now()}`,
          userId: Number(currentUserId),
        };
        const newClub = {
          ...club,
          members: [...(club.members || []), fakeMember],
        };
        setClub(newClub);
        setJoined(true);
        // optionally persist to some mock store or show toast
      } else {
        // assume numeric DB id -> call backend
        console.log("[ClubPage] calling api.user.joinCommunity", {
          userId: currentUserId,
          communityId: club.id,
        });
        await api.user.joinCommunity(Number(currentUserId), Number(club.id));
        // optimistic update
        const newClub = {
          ...club,
          members: [
            ...(club.members || []),
            { id: `m-${Date.now()}`, userId: Number(currentUserId) },
          ],
        };
        setClub(newClub);
        setJoined(true);
      }
    } catch (err) {
      console.error("Failed to join", err);
    } finally {
      setJoining(false);
    }
  };
  // Render states:
  if (club === undefined) {
    // still loading
    return <div>Loading club…</div>;
  }

  if (club === null) {
    // not found
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Club not found</h2>
        <p className="text-sm text-muted-foreground">
          We could not find that club. Try browsing the Discovery page.
        </p>
      </div>
    );
  }

  // safe reads using optional chaining
  const logoSrc = club.avatarUrl ?? club.logoSrc ?? "/avatars/placeholder.png";
  const clubName = club.name ?? "Untitled Club";
  const clubDesc = club.description ?? "Club description coming soon.";
  const clubTags = club.tags ?? [];

  const activeEvents = (events || club.events || []).slice(0, 6);
  const normalizedEvents: EventData[] =
    activeEvents.length > 0
      ? activeEvents.map((event) => ({
          id: String(event.id),
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time || "00:00",
          locationName: event.location || "TBD",
          coordinates: event.coordinates,
          eventType: event.type || "General",
        }))
      : fallbackEvents;

  const socialLinks: SocialLink[] = [
    { id: "social-linkedin", name: "LinkedIn", href: "#", icon: Linkedin },
    { id: "social-facebook", name: "Facebook", href: "#", icon: Facebook },
    { id: "social-circle", name: "Circle", href: "#", icon: Circle },
    { id: "social-discord", name: "Discord", href: "#", icon: MessageCircle },
  ];

  const upcomingMeetings = activeEvents.slice(0, 2).map((event) => ({
    id: String(event.id),
    title: event.title,
    date: event.date,
    time: event.time,
    locationName: event.location || "TBD",
    coordinates: event.coordinates,
  }));

  return (
    <MainLayout
      bannerSrc={club.bannerUrl || "/background.png"}
      logoSrc={logoSrc}
      clubName={clubName}
      clubDesc={clubDesc}
      clubTags={clubTags}
      joined={joined}
      joining={joining}
      onJoin={handleJoin}
      socialLinks={socialLinks}
      upcomingMeetings={upcomingMeetings}
      headerOverlayAction={<ClubAdminPanelButton clubId={club.id} />}
    >
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-gray-300 bg-transparent p-0">
          <TabsTrigger
            value="announcements"
            className="rounded-none border-b-2 border-transparent px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-500 shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none"
          >
            Announcements
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-none border-b-2 border-transparent px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-500 shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="rounded-none border-b-2 border-transparent px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-500 shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none"
          >
            Gallery
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-none border-b-2 border-transparent px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-500 shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none"
          >
            Board Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementsPanel announcements={announcementsData} />
        </TabsContent>

        <TabsContent value="events">
          <EventsContainer events={normalizedEvents} />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryGrid items={galleryData} />
        </TabsContent>

        <TabsContent value="members">
          <BoardMembersPanel sections={boardSectionsData} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
