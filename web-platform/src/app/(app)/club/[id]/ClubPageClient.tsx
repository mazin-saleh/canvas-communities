"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import AnnouncementsPanel from "./components/AnnouncementsPanel";
import EventsContainer from "./components/events/EventsContainer";
import { type EventData, type EventCoordinates } from "./components/events/eventsData";
import GalleryGrid from "./components/gallery/GalleryGrid";
import { type GalleryMedia } from "./components/gallery/galleryData";
import BoardMembersPanel from "./components/board/BoardMembersPanel";
import MainLayout from "./components/shell/MainLayout";
import { type SocialLink } from "./components/shell/types";
import { Circle, Facebook, Linkedin, MessageCircle } from "lucide-react";
import ClubAdminPanelButton from "@/components/ClubAdminPanelButton";
import EventFormModal from "./components/events/EventFormModal";
import AnnouncementFormModal from "./components/AnnouncementFormModal";

type ClubMember = {
  id: string | number;
  userId: number;
  user?: { id: number; username: string };
  assignedRoles?: {
    clubRole: {
      id: number;
      name: string;
      color: string;
      permissions?: { permission: string }[];
    };
  }[];
};

type ClubTag = string | { name?: string };

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
  joined?: boolean;
  blurb?: string;
  owner?: { userId: number } | null;
};

// API response types
type ApiEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  eventType: string;
  capacity: number | null;
  status: string;
  _count: { rsvps: number };
};

type ApiAnnouncement = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  pinned: boolean;
  createdAt: string;
};

type ApiGalleryImage = {
  id: number;
  url: string;
  caption: string;
  category: string;
};

export default function ClubPageClient() {
  const params = useParams<{ id: string }>();
  const routeId = params?.id ?? null;
  const { user, hydrated } = useAuth();
  const { refresh } = useRole();
  const currentUserId = hydrated && user ? Number(user.id) : null;

  const [club, setClub] = useState<ClubData | null | undefined>(undefined);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Real data from API
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [gallery, setGallery] = useState<ApiGalleryImage[]>([]);

  // Modal states
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ApiAnnouncement | null>(null);

  const communityId = routeId ? Number(routeId) : 0;
  const isNumericId = !isNaN(communityId) && communityId > 0;

  // Permission resolution
  const isSuperAdmin = user?.platformRole === "SUPER_ADMIN";
  const isOwner = isSuperAdmin || Boolean(club?.owner && currentUserId && club.owner.userId === currentUserId);
  const userPermissions = React.useMemo(() => {
    if (!club || !currentUserId) return [] as string[];
    if (isOwner) return ["canManageEvents", "canManageAnnouncements", "canManageGallery", "canManageRoster", "canManageRoles", "canManageSettings"];
    const membership = club.members.find(m => Number(m.userId) === currentUserId);
    if (!membership?.assignedRoles) return [] as string[];
    const perms = new Set<string>();
    for (const ar of membership.assignedRoles) {
      if (ar.clubRole.permissions) {
        for (const p of ar.clubRole.permissions) {
          perms.add(p.permission);
        }
      }
    }
    return Array.from(perms);
  }, [club, currentUserId, isOwner]);

  const canManageEvents = isOwner || userPermissions.includes("canManageEvents");
  const canManageAnnouncements = isOwner || userPermissions.includes("canManageAnnouncements");
  const canManageGallery = isOwner || userPermissions.includes("canManageGallery");
  const canManageRoster = isOwner || userPermissions.includes("canManageRoster");

  // Load club data
  const reloadClub = useCallback(async () => {
    if (!isNumericId) return;
    try {
      const res = await fetch(`/api/community/get?id=${communityId}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setClub({
        id: data.id,
        name: data.name ?? "Untitled Club",
        description: data.description ?? "",
        tags: data.tags ?? [],
        avatarUrl: data.avatarUrl,
        members: data.members ?? [],
        owner: data.owner ?? null,
      });
      setJoined(Boolean(data.members?.some((m: ClubMember) => Number(m.userId) === Number(currentUserId))));
    } catch {
      setClub(null);
    }
  }, [communityId, isNumericId, currentUserId]);

  useEffect(() => {
    if (!routeId) return;
    reloadClub();
  }, [routeId, reloadClub]);

  // Load content data
  const loadEvents = useCallback(async () => {
    if (!isNumericId) return;
    try {
      const data = await api.community.getEvents(communityId) as unknown as ApiEvent[];
      setEvents(data);
    } catch (e) { console.warn("Failed to load events", e); }
  }, [communityId, isNumericId]);

  const loadAnnouncements = useCallback(async () => {
    if (!isNumericId) return;
    try {
      const data = await api.community.getAnnouncements(communityId) as unknown as ApiAnnouncement[];
      setAnnouncements(data);
    } catch (e) { console.warn("Failed to load announcements", e); }
  }, [communityId, isNumericId]);

  const loadGallery = useCallback(async () => {
    if (!isNumericId) return;
    try {
      const data = await api.community.getGallery(communityId) as unknown as ApiGalleryImage[];
      setGallery(data);
    } catch (e) { console.warn("Failed to load gallery", e); }
  }, [communityId, isNumericId]);

  useEffect(() => {
    loadEvents();
    loadAnnouncements();
    loadGallery();
  }, [loadEvents, loadAnnouncements, loadGallery]);

  // Event handlers
  const handleCreateEvent = async (form: { title: string; description: string; date: string; time: string; locationName: string; eventType: string; capacity: string; status: string }) => {
    await api.community.createEvent(communityId, {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      locationName: form.locationName,
      eventType: form.eventType,
      capacity: form.capacity ? Number(form.capacity) : null,
      status: form.status,
    });
    await loadEvents();
  };

  const handleUpdateEvent = async (form: { title: string; description: string; date: string; time: string; locationName: string; eventType: string; capacity: string; status: string }) => {
    if (!editingEvent) return;
    await api.community.updateEvent(communityId, editingEvent.id, {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      locationName: form.locationName,
      eventType: form.eventType,
      capacity: form.capacity ? Number(form.capacity) : null,
      status: form.status,
    });
    setEditingEvent(null);
    await loadEvents();
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("Delete this event?")) return;
    await api.community.deleteEvent(communityId, eventId);
    await loadEvents();
  };

  const handleCreateAnnouncement = async (form: { title: string; description: string; category: string; status: string }) => {
    await api.community.createAnnouncement(communityId, form);
    await loadAnnouncements();
  };

  const handleUpdateAnnouncement = async (form: { title: string; description: string; category: string; status: string }) => {
    if (!editingAnnouncement) return;
    await api.community.updateAnnouncement(communityId, editingAnnouncement.id, form);
    setEditingAnnouncement(null);
    await loadAnnouncements();
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    await api.community.deleteAnnouncement(communityId, id);
    await loadAnnouncements();
  };

  const handleTogglePin = async (id: number, currentPinned: boolean) => {
    await api.community.updateAnnouncement(communityId, id, { pinned: !currentPinned });
    await loadAnnouncements();
  };

  const handleAddGalleryImage = async (draft: { url: string; caption: string; category: string }) => {
    await api.community.addGalleryImage(communityId, { url: draft.url, caption: draft.caption });
    await loadGallery();
  };

  const handleDeleteGalleryImage = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await api.community.deleteGalleryImage(communityId, id);
    await loadGallery();
  };

  const handleJoin = async () => {
    if (!currentUserId || joined) return;
    setJoining(true);
    try {
      await api.user.joinCommunity(Number(currentUserId), communityId);
      setJoined(true);
      setClub(prev => prev ? {
        ...prev,
        members: [...(prev.members || []), { id: `m-${Date.now()}`, userId: currentUserId }],
      } : prev);
      refresh();
    } catch (err) { console.error("Failed to join", err); }
    finally { setJoining(false); }
  };

  const handleLeave = async () => {
    if (!currentUserId || !joined) return;
    setLeaving(true);
    try {
      await api.user.leaveCommunity(Number(currentUserId), communityId);
      setJoined(false);
      setClub(prev => prev ? {
        ...prev,
        members: (prev.members || []).filter((m: ClubMember) => Number(m.userId) !== Number(currentUserId)),
      } : prev);
      refresh();
    } catch (err) { console.error("Failed to leave", err); }
    finally { setLeaving(false); }
  };

  // Render
  if (club === undefined) return <div>Loading club...</div>;
  if (club === null) return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Club not found</h2>
      <p className="text-sm text-muted-foreground">We could not find that club.</p>
    </div>
  );

  const logoSrc = club.avatarUrl ?? club.logoSrc ?? "/avatars/placeholder.png";
  const clubName = club.name;
  const clubDesc = club.description;
  const clubTags = club.tags;

  // Normalize events for EventsContainer
  const normalizedEvents: EventData[] = events.map((e) => ({
    id: String(e.id),
    title: e.title,
    description: e.description,
    date: typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0],
    time: e.time || "00:00",
    locationName: e.locationName || "TBD",
    coordinates: (e.latitude && e.longitude) ? { lat: e.latitude, lng: e.longitude } as EventCoordinates : undefined,
    eventType: e.eventType || "General",
  }));

  // Normalize announcements for AnnouncementsPanel
  const normalizedAnnouncements = announcements.map((a) => {
    const d = new Date(a.createdAt);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return {
      id: String(a.id),
      dayLabel: isToday ? "Today" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timeLabel: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      title: a.title,
      description: a.description,
      category: a.category as "news" | "events",
      pinned: a.pinned,
    };
  });

  // Normalize gallery for GalleryGrid
  const normalizedGallery: GalleryMedia[] = gallery.map((g) => ({
    id: String(g.id),
    src: g.url,
    type: "image" as const,
    category: g.category,
    alt: g.caption || "Gallery image",
    caption: g.caption,
  }));

  // Board members from club.members with roles
  const boardSections = [{
    id: "members",
    title: "Club Members",
    members: club.members
      .filter(m => m.assignedRoles && m.assignedRoles.length > 0)
      .map(m => ({
        id: String(m.id),
        name: m.user?.username ?? "Unknown",
        role: m.assignedRoles?.map(ar => ar.clubRole.name).join(", ") ?? "Member",
      })),
  }];

  const socialLinks: SocialLink[] = [
    { id: "social-linkedin", name: "LinkedIn", href: "#", icon: Linkedin },
    { id: "social-facebook", name: "Facebook", href: "#", icon: Facebook },
    { id: "social-circle", name: "Circle", href: "#", icon: Circle },
    { id: "social-discord", name: "Discord", href: "#", icon: MessageCircle },
  ];

  const upcomingMeetings = normalizedEvents.slice(0, 2).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    locationName: e.locationName,
    coordinates: e.coordinates,
  }));

  const tabStyle = "rounded-none border-b-2 border-transparent px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-base sm:text-lg lg:text-xl font-semibold text-gray-500 shadow-none data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-500 data-[state=active]:shadow-none";

  return (
    <MainLayout
      bannerSrc={club.bannerUrl || "/background.png"}
      logoSrc={logoSrc}
      clubName={clubName}
      clubDesc={clubDesc}
      clubTags={clubTags}
      joined={joined}
      joining={joining}
      leaving={leaving}
      onJoin={handleJoin}
      onLeave={handleLeave}
      socialLinks={socialLinks}
      upcomingMeetings={upcomingMeetings}
      headerOverlayAction={<ClubAdminPanelButton clubId={club.id} />}
    >
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-gray-300 bg-transparent p-0">
          <TabsTrigger value="announcements" className={tabStyle}>Announcements</TabsTrigger>
          <TabsTrigger value="events" className={tabStyle}>Events</TabsTrigger>
          <TabsTrigger value="gallery" className={tabStyle}>Gallery</TabsTrigger>
          <TabsTrigger value="members" className={tabStyle}>Board Members</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementsPanel
            announcements={normalizedAnnouncements}
            canEdit={canManageAnnouncements}
            onCreate={canManageAnnouncements ? handleCreateAnnouncement : undefined}
            onEdit={(id) => {
              const a = announcements.find(x => x.id === Number(id));
              if (a) { setEditingAnnouncement(a); setAnnouncementModalOpen(true); }
            }}
            onDelete={(id) => handleDeleteAnnouncement(Number(id))}
            onTogglePin={(id, pinned) => handleTogglePin(Number(id), pinned)}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsContainer
            events={normalizedEvents}
            canEdit={canManageEvents}
            onCreate={canManageEvents ? handleCreateEvent : undefined}
            onEditEvent={(id) => {
              const e = events.find(x => x.id === Number(id));
              if (e) { setEditingEvent(e); setEventModalOpen(true); }
            }}
            onDeleteEvent={(id) => handleDeleteEvent(Number(id))}
          />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryGrid
            items={normalizedGallery}
            canDelete={canManageGallery}
            onCreate={canManageGallery ? handleAddGalleryImage : undefined}
            onDelete={(id) => handleDeleteGalleryImage(Number(id))}
          />
        </TabsContent>

        <TabsContent value="members">
          <BoardMembersPanel
            sections={boardSections}
            canEdit={canManageRoster}
            communityId={communityId}
            rawMembers={club.members}
            onAssigned={reloadClub}
          />
        </TabsContent>
      </Tabs>

      {/* Event Form Modal */}
      <EventFormModal
        key={editingEvent ? `edit-${editingEvent.id}` : "create"}
        open={eventModalOpen}
        onOpenChange={(open) => { setEventModalOpen(open); if (!open) setEditingEvent(null); }}
        title={editingEvent ? "Edit Event" : "Add Event"}
        initialData={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description,
          date: typeof editingEvent.date === 'string' ? editingEvent.date.split('T')[0] : new Date(editingEvent.date).toISOString().split('T')[0],
          time: editingEvent.time,
          locationName: editingEvent.locationName,
          eventType: editingEvent.eventType,
          capacity: editingEvent.capacity?.toString() ?? "",
          status: editingEvent.status,
        } : undefined}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
      />

      {/* Announcement Form Modal */}
      <AnnouncementFormModal
        key={editingAnnouncement ? `edit-${editingAnnouncement.id}` : "create-ann"}
        open={announcementModalOpen}
        onOpenChange={(open) => { setAnnouncementModalOpen(open); if (!open) setEditingAnnouncement(null); }}
        title={editingAnnouncement ? "Edit Announcement" : "New Announcement"}
        initialData={editingAnnouncement ? {
          title: editingAnnouncement.title,
          description: editingAnnouncement.description,
          category: editingAnnouncement.category,
          status: editingAnnouncement.status,
        } : undefined}
        onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
      />

    </MainLayout>
  );
}
