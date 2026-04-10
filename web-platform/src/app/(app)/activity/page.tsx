"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  CalendarDays,
  MessageSquare,
  Sparkles,
  Users,
  ArrowRight,
  Clock3,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ActivityType = "club" | "event" | "update" | "recommendation";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
  href: string;
  clubName?: string;
  clubId?: string;
};

type UpcomingEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  locationName: string;
  community: {
    id: number;
    name: string;
  };
};

const FILTERS: Array<"all" | ActivityType> = ["all", "club", "event", "update", "recommendation"];

// ---------------- UTIL ----------------

function formatTimeAgo(dateString: string | Date) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}

function mapToActivityItem(item: any): ActivityItem {
  return {
    id: item.id,
    type: item.type === "announcement" ? "club" : item.type,
    title: item.title,
    description: item.description,
    time: formatTimeAgo(item.timestamp),
    unread: true,
    href: item.community ? `/club/${item.community.id}` : "/discovery",
    clubName: item.community?.name,
    clubId: item.community?.id.toString(),
  };
}

function activityIcon(type: ActivityType) {
  switch (type) {
    case "club":
      return Users;
    case "event":
      return CalendarDays;
    case "update":
      return Bell;
    case "recommendation":
      return Sparkles;
    default:
      return MessageSquare;
  }
}

function activityColor(type: ActivityType) {
  switch (type) {
    case "club":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "event":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "update":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "recommendation":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function formatTypeLabel(type: ActivityType) {
  switch (type) {
    case "club":
      return "Club";
    case "event":
      return "Event";
    case "update":
      return "Update";
    case "recommendation":
      return "Recommendation";
  }
}

function formatEventDayTime(dateString: string, time?: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return time || "TBD";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const dayStr = date.toLocaleDateString(undefined, options);
  const formattedTime = time || date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return `${dayStr} · ${formattedTime}`;
}
// ---------------- PAGE ----------------

export default function ActivityPage() {
  const { user, hydrated } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to hydrate so we have a real user ID
    if (!hydrated) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [feedData, upcomingData] = await Promise.all([
          api.activity.getFeed(Number(user!.id)),
          api.activity.getUpcoming(),
        ]);

        setActivity(feedData.map(mapToActivityItem));
        setEvents(upcomingData);
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [hydrated, user]);

  const filtered = useMemo(() => {
    if (filter === "all") return activity;
    return activity.filter((item) => item.type === filter);
  }, [filter, activity]);

  const unreadCount = activity.filter((a) => a.unread).length;

  return (
    <div className="min-h-full bg-[url('/background.png')] bg-cover bg-center">
      <div className="min-h-full bg-white/90">
        <div className="px-6 py-6 lg:px-10">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Activity className="h-4 w-4" />
                <span>Campus activity feed</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Activity
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Keep up with club posts, upcoming events, membership updates, and new recommendations in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {unreadCount} new
              </Badge>
              <Button asChild className="rounded-full">
                <Link href="/discovery">Go to Discovery</Link>
              </Button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item;
              return (
                <motion.button
                  key={item}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(item)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item === "all" ? "All" : formatTypeLabel(item)}
                </motion.button>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Filter className="h-4 w-4" />
                  <span>Recent activity</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <p className="p-5 text-sm text-slate-500">Loading...</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filtered.map((item) => {
                      const Icon = activityIcon(item.type);
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="block p-5 transition hover:bg-slate-50"
                        >
                          <div className="flex gap-4">
                            <div
                              className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${activityColor(
                                item.type
                              )}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {item.title}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full border px-2 py-0.5 text-[11px] ${activityColor(
                                    item.type
                                  )}`}
                                >
                                  {formatTypeLabel(item.type)}
                                </Badge>
                                {item.unread && (
                                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                                )}
                              </div>

                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>

                              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {item.time}
                                </span>
                                {item.clubName && (
                                  <span className="inline-flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {item.clubName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="hidden items-center text-slate-400 md:flex">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Upcoming events
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {events.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      {/* Event Title */}
                      <p className="text-sm font-medium text-slate-900">{e.title}</p>
                      {/* Club / Community Name */}
                      <p className="mt-1 text-sm text-slate-900">{e.community.name}</p>
                      {/* Day · Time · Location */}
                      <p className="mt-1 text-xs text-slate-500">
                        {formatEventDayTime(e.date, e.time)} · {e.locationName}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Quick actions
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full rounded-2xl bg-sky-500 text-white hover:bg-sky-600 border-0">
                    <Link href="/discovery">Browse clubs</Link>
                  </Button>

                  <Button asChild className="w-full rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 border-0">
                    <Link href="/settings">Update interests</Link>
                  </Button>

                  <Button asChild className="w-full rounded-2xl bg-orange-500 text-white hover:bg-orange-600 border-0">
                    <Link href="/club/22">Request an existing community</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}