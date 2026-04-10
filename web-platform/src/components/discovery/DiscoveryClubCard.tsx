"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { DiscoveryClub } from "@/mocks/discovery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DiscoveryClubCard({ club }: { club: DiscoveryClub }) {
  const router = useRouter();
  const { user } = useAuth();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  // Fire-and-forget interaction logger — feeds the ML collaborative filter
  function track(type: "view" | "click" | "join") {
    if (!user) return;
    api.user.track(Number(user.id), Number(club.id), type).catch(() => {});
  }

  async function handleJoin() {
    if (!user || joined || joining) return;
    setJoining(true);
    try {
      await api.user.joinCommunity(Number(user.id), Number(club.id));
      track("join");
      setJoined(true);
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

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="flex h-full flex-col rounded-2xl bg-white shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Banner area */}
      <div className="relative w-full flex-shrink-0" style={{ height: "32%" }}>
        <div className="absolute inset-0 bg-orange-400">
          {club.bannerSrc && (
            <Image src={club.bannerSrc} alt="" fill className="object-cover opacity-80" />
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden border bg-white">
            <Image
              src={club.logoSrc || "/gator-hero.png"}
              alt=""
              width={48}
              height={48}
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{club.name}</h3>
            <p className="mt-1 text-xs text-slate-600 line-clamp-3">{club.description}</p>
          </div>
        </div>

        {/* Tags */}
        {club.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {club.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Score with optional "why" info popover */}
        {club.score != null && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`text-[11px] font-semibold ${
                club.reasonType === "content"
                  ? "text-emerald-600"
                  : club.reasonType === "collab"
                  ? "text-blue-600"
                  : club.reasonType === "popularity"
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
            >
              {Math.round(club.score * 100)}% match
            </span>
            {(club.reason || club.reasonDetail) && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Why is this recommended?"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="top"
                  className="w-64 p-3 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        club.reasonType === "content"
                          ? "bg-emerald-500"
                          : club.reasonType === "collab"
                          ? "bg-blue-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span className="font-semibold text-slate-900">
                      {club.reasonType === "content"
                        ? "Interest match"
                        : club.reasonType === "collab"
                        ? "Peer discovery"
                        : "Trending pick"}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-snug">
                    {club.reasonDetail || club.reason}
                  </p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" onClick={handleView}>
            View
          </Button>
          <Button
            size="sm"
            className={joined ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}
            onClick={handleJoin}
            disabled={joined || joining}
          >
            {joined ? "Joined" : joining ? "Joining..." : "Join"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
