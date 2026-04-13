"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { DiscoveryClub } from "@/mocks/discovery";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";

export default function DiscoveryClubCard({ club }: { club: DiscoveryClub }) {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useRole();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const hasNextMeeting =
    club.nextMeeting &&
    (club.nextMeeting.title || club.nextMeeting.datetime || club.nextMeeting.location);

  // Fire-and-forget interaction logger — feeds the ML collaborative filter
  function track(type: "view" | "click" | "join") {
    if (!user) return;
    api.user.track(Number(user.id), Number(club.id), type).catch(() => {});
  }

  async function handleJoin(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user || joined || joining) return;
    setJoining(true);
    try {
      await api.user.joinCommunity(Number(user.id), Number(club.id));
      track("join");
      setJoined(true);
      refresh();
    } catch (err) {
      console.error("Failed to join:", err);
    } finally {
      setJoining(false);
    }
  }

  function handleView() {
    track("click");
    router.push(`/club/${club.id}`);
  }

  function handleViewClubPage(e: React.MouseEvent) {
    e.stopPropagation();
    track("click");
    router.push(`/club/${club.id}`);
  }

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleView}
      className="flex h-full cursor-pointer flex-col rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Banner with overlapping logo */}
      <div className="relative h-28 w-full flex-shrink-0">
        <div className="absolute inset-0 bg-orange-400">
          {club.bannerSrc && (
            <Image
              src={club.bannerSrc}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Logo — overlaps the banner/content boundary */}
        <div className="absolute -bottom-5 left-4 z-10 h-11 w-11 rounded-full border-2 border-white bg-white shadow-sm overflow-hidden">
          <Image
            src={club.logoSrc || "/gator-hero.png"}
            alt=""
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col px-4 pt-7 pb-3 gap-2">
        {/* Two-column: club info + next meeting */}
        <div className="flex gap-3">
          {/* Left — club info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">
              {club.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-3">
              {club.description}
            </p>
          </div>

          {/* Right — next meeting */}
          {hasNextMeeting && (
            <div className="shrink-0 w-[130px]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Next Meeting
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-900 line-clamp-1">
                {club.nextMeeting!.title}
              </p>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CalendarDays className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{club.nextMeeting!.datetime}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{club.nextMeeting!.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="line-clamp-1">TBD</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar — tags + buttons */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-2">
          {/* Tags — inline scrollable with edge fades */}
          <div className="relative min-w-0">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-1">
              {club.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                  >
                    {tag}
                  </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] text-white border-slate-300 hover:text-accent-foreground"
              onClick={handleViewClubPage}
            >
              View Club Page
            </Button>
            <Button
              size="sm"
              className={`h-7 px-2.5 text-[11px] ${
                joined
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
              onClick={handleJoin}
              disabled={joined || joining}
            >
              {joined ? "Joined" : joining ? "Joining..." : "Join Club"}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
