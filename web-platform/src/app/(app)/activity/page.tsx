"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
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
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days}d ago`;
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
    case "club": return Users;
    case "event": return CalendarDays;
    case "update": return Bell;
    case "recommendation": return Sparkles;
    default: return MessageSquare;
  }
}

function activityAccent(type: ActivityType) {
  switch (type) {
    case "club": return { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" };
    case "event": return { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" };
    case "update": return { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" };
    case "recommendation": return { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-500" };
    default: return { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-500" };
  }
}

function formatTypeLabel(type: string) {
  if (type === "all") return "All";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(raw?: string): string {
  if (!raw || raw === "00:00") return "TBD";
  const [h, m] = raw.split(":").map(Number);
  if (isNaN(h)) return raw;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

// ---------------- PAGE ----------------

export default function ActivityPage() {
  const { user, hydrated } = useAuth();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { setLoading(false); return; }

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

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Activity
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Club posts, upcoming events, and recommendations — all in one place.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-5 flex items-center gap-1.5 border-b border-gray-200 pb-px">
          {FILTERS.map((item) => {
            const active = filter === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {formatTypeLabel(item)}
              </button>
            );
          })}
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">

          {/* Feed */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {loading ? (
              <p className="p-5 text-sm text-gray-400">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No activity to show.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const Icon = activityIcon(item.type);
                  const accent = activityAccent(item.type);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group flex gap-3.5 px-4 py-3.5 transition-colors hover:bg-gray-50"
                    >
                      {/* Icon */}
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent.bg}`}>
                        <Icon className={`h-4 w-4 ${accent.text}`} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.title}
                          </h3>
                          {item.unread && (
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
                          )}
                        </div>

                        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
                          {item.description}
                        </p>

                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3" />
                            {item.time}
                          </span>
                          {item.clubName && (
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.clubName}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Upcoming events */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Upcoming events
                </h2>
              </div>
              <div className="divide-y divide-gray-50 p-2">
                {events.length === 0 ? (
                  <p className="px-2 py-3 text-xs text-gray-400">No upcoming events.</p>
                ) : events.map((e) => (
                  <Link
                    key={e.id}
                    href={`/club/${e.community.id}`}
                    className="block rounded-lg px-2.5 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{e.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-orange-500">{e.community.name}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatEventDate(e.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatTime(e.time)}
                      </span>
                    </div>
                    {e.locationName && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin className="h-3 w-3 shrink-0 text-orange-400" />
                        <span className="line-clamp-1">{e.locationName}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Quick links
                </h2>
              </div>
              <div className="flex flex-col gap-1 p-2">
                <Link
                  href="/discovery"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Browse clubs
                </Link>
                <Link
                  href="/recommended"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View recommendations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
