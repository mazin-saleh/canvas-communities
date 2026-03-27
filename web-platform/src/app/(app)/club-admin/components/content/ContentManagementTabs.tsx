"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnnouncementsEditor from "./AnnouncementsEditor";
import EventsEditor from "./EventsEditor";
import GalleryManager from "./GalleryManager";

export default function ContentManagementTabs() {
  return (
    <Tabs defaultValue="announcements" className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Content Management</h2>
        <p className="text-sm text-slate-600">
          Switch between Announcements, Events, and Gallery workflows.
        </p>
      </div>

      <TabsList className="h-auto rounded-lg bg-[var(--admin-brand-teal-soft)] p-1">
        <TabsTrigger
          value="announcements"
          className="rounded-md px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[var(--admin-brand-orange)]"
        >
          Announcements
        </TabsTrigger>
        <TabsTrigger
          value="events"
          className="rounded-md px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[var(--admin-brand-orange)]"
        >
          Events
        </TabsTrigger>
        <TabsTrigger
          value="gallery"
          className="rounded-md px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-[var(--admin-brand-orange)]"
        >
          Gallery
        </TabsTrigger>
      </TabsList>

      <TabsContent value="announcements" className="mt-0">
        <AnnouncementsEditor />
      </TabsContent>

      <TabsContent value="events" className="mt-0">
        <EventsEditor />
      </TabsContent>

      <TabsContent value="gallery" className="mt-0">
        <GalleryManager />
      </TabsContent>
    </Tabs>
  );
}
