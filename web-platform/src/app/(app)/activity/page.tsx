"use client";

import React, { useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";

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

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "club",
    title: "Gator Grilling Club posted a new announcement",
    description: "Join us this Thursday for our weekly cookout at the Reitz Union Patio.",
    time: "10 min ago",
    unread: true,
    href: "/club/53",
    clubName: "Gator Grilling Club",
    clubId: "gator-grilling",
  },
  {
    id: "2",
    type: "event",
    title: "UF ACM added a hack night event",
    description: "Hack Night starts Wednesday at 7:00 PM in the CSE Atrium.",
    time: "1 hour ago",
    unread: true,
    href: "/club/5",
    clubName: "UF ACM",
    clubId: "acm",
  },
  {
    id: "3",
    type: "recommendation",
    title: "We found 4 new clubs for you",
    description: "Your interests match clubs in computer science, community, and volunteering.",
    time: "Today",
    unread: false,
    href: "/discovery",
  },
  {
    id: "4",
    type: "update",
    title: "You joined Gator Surf Club",
    description: "Your membership has been added successfully.",
    time: "Yesterday",
    unread: false,
    href: "/club/39",
    clubName: "Gator Surf Club",
    clubId: "gator-surf",
  },
  {
    id: "5",
    type: "club",
    title: "Pre-Dental Society shared DAT prep resources",
    description: "Slides and study guides are now available for members.",
    time: "2 days ago",
    unread: false,
    href: "/club/18",
    clubName: "Pre-Dental Society",
    clubId: "pre-dent",
  },
  {
    id: "6",
    type: "event",
    title: "UF Tennis Club opened signups",
    description: "Open court night is now live for Friday at 6:00 PM.",
    time: "2 days ago",
    unread: false,
    href: "/club/34",
    clubName: "UF Tennis Club",
    clubId: "tennis",
  },
];

const FILTERS: Array<"all" | ActivityType> = ["all", "club", "event", "update", "recommendation"];

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

export default function ActivityPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return MOCK_ACTIVITY;
    return MOCK_ACTIVITY.filter((item) => item.type === filter);
  }, [filter]);

  const unreadCount = MOCK_ACTIVITY.filter((a) => a.unread).length;

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
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Gator Grilling Club
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Thu · 7:00 PM · Reitz Union Patio
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">
                      UF ACM Hack Night
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Wed · 7:00 PM · CSE Atrium
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Campus Volleyball Crew
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Fri · 6:00 PM · Southwest Courts
                    </p>
                  </div>
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