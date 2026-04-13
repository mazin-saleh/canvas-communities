"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Shield,
  MoonStar,
  Palette,
  UserRound,
  LogOut,
  ChevronRight,
  Sparkles,
  Settings2,
  Mail,
  Smartphone,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockInterests, type Interest } from "@/mocks/interests";

type NotificationToggle = "email" | "push" | "events" | "clubUpdates";

const PROFILE_PRESET = {
  name: "Gator Student",
  email: "student@ufl.edu",
  role: "Student",
  campus: "University of Florida",
  bio: "Discover clubs, keep up with campus activity, and personalize your feed.",
};

const APPEARANCE_OPTIONS = [
  { id: "light", label: "Light", icon: "☀️" },
  { id: "dark", label: "Dark", icon: "🌙" },
  { id: "system", label: "System", icon: "🖥️" },
];

const NOTIFICATION_OPTIONS: Array<{
  id: NotificationToggle;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "email",
    label: "Email notifications",
    description: "Get important updates in your inbox.",
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: "push",
    label: "Push notifications",
    description: "Receive browser alerts for new activity.",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: "events",
    label: "Event reminders",
    description: "Be reminded before club events start.",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "clubUpdates",
    label: "Club updates",
    description: "Hear when clubs you follow post something new.",
    icon: <Globe className="h-4 w-4" />,
  },
];

export default function SettingsPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState(PROFILE_PRESET.name);
  const [bio, setBio] = useState(PROFILE_PRESET.bio);
  const [selectedAppearance, setSelectedAppearance] = useState("system");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    mockInterests.filter((i) => i.selected).map((i) => i.label)
  );
  const [notificationPrefs, setNotificationPrefs] = useState<Record<NotificationToggle, boolean>>({
    email: true,
    push: true,
    events: true,
    clubUpdates: true,
  });

  const [search, setSearch] = useState("");

  const interestOptions = mockInterests.map((i) => i.label);

  const filteredInterests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return interestOptions;
    return interestOptions.filter((label) => label.toLowerCase().includes(q));
  }, [interestOptions, search]);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };

  const toggleNotification = (key: NotificationToggle) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-full bg-[url('/background.png')] bg-cover bg-center">
      <div className="min-h-full bg-white/90">
        <div className="px-6 py-6 lg:px-10">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Settings2 className="h-4 w-4" />
                <span>Account and personalization</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Update your profile, interests, appearance, and notification preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                onClick={() => router.push("/discovery")}
              >
                Back to Discovery
              </Button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <UserRound className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="flex flex-col items-center justify-start gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-blue-500 text-2xl font-semibold text-white shadow-sm">
                        GS
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500">{PROFILE_PRESET.role}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-white px-3 py-1 text-xs"
                      >
                        {PROFILE_PRESET.campus}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Display name
                        </label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-11 rounded-2xl bg-white"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-300"
                          placeholder="Tell people a little about yourself"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                          Save profile
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Sparkles className="h-4 w-4" />
                    <span>Interests</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="relative max-w-2xl">
                    <Input
                      type="search"
                      placeholder="Search interests..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-11 rounded-full bg-white pl-4 pr-4 text-sm shadow-sm placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filteredInterests.map((label) => {
                      const active = selectedInterests.includes(label);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggleInterest(label)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            active
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button className="rounded-2xl bg-orange-500 text-white hover:bg-orange-600">
                      Save interests
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Clear changes
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Selected interests
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedInterests.length ? (
                        selectedInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="rounded-full px-3 py-1"
                          >
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No interests selected yet.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {NOTIFICATION_OPTIONS.map((option) => {
                    const active = notificationPrefs[option.id];
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleNotification(option.id)}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            {option.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {option.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-5 w-10 rounded-full p-0.5 transition ${
                            active ? "bg-orange-500" : "bg-slate-200"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Palette className="h-4 w-4" />
                    <span>Appearance</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {APPEARANCE_OPTIONS.map((option) => {
                      const active = selectedAppearance === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSelectedAppearance(option.id)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-lg">{option.icon}</div>
                          <p className="mt-2 text-sm font-medium">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500">
                    Appearance will be wired to the app theme later.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Shield className="h-4 w-4" />
                    <span>Account summary</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Name:</span>{" "}
                    {displayName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Email:</span>{" "}
                    {PROFILE_PRESET.email}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Role:</span>{" "}
                    {PROFILE_PRESET.role}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Campus:</span>{" "}
                    {PROFILE_PRESET.campus}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ChevronRight className="h-4 w-4" />
                    <span>Quick links</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/discovery">Discovery</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/activity">Activity</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <Link href="/club/22">Open featured club</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <LogOut className="h-4 w-4" />
                    <span>Danger zone</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                  >
                    Log out
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