"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { DiscoveryClub } from "@/mocks/discovery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";

export default function DiscoveryClubCard({ club }: { club: DiscoveryClub }) {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useRole();
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    if (!user || joined || joining) return;
    setJoining(true);
    try {
      await api.user.joinCommunity(Number(user.id), Number(club.id));
      setJoined(true);
      refresh();
    } catch (err) {
      console.error("Failed to join:", err);
    } finally {
      setJoining(false);
    }
  }

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex h-full flex-col rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Banner — fixed height, not percentage */}
      <div className="relative h-24 w-full flex-shrink-0">
        <div className="absolute inset-0 bg-orange-400">
          {club.bannerSrc && (
            <Image src={club.bannerSrc} alt="" fill className="object-cover opacity-80" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border bg-white">
            <Image
              src={club.logoSrc || "/gator-hero.png"}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">
              {club.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
              {club.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        {club.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {club.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Score */}
        {club.score != null && (
          <div className="text-[10px] text-slate-400">
            {Math.round(club.score * 100)}% match
          </div>
        )}

        {/* Actions — pinned to bottom */}
        <div className="mt-auto flex justify-between items-center pt-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 text-slate-700 border-slate-300 hover:bg-slate-50"
            onClick={() => router.push(`/club/${club.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            className={`text-xs h-8 ${
              joined
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
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
