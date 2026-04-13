"use client";

import React, { useState } from "react";
import { Club } from "@/mocks/clubs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { Users, Check } from "lucide-react";

export default function RecommendedClubCard({ club }: { club: Club }) {
  const router = useRouter();
  const { user, onboarded, completeOnboarding } = useAuth();
  const { refresh } = useRole();
  const [joined, setJoined] = useState(Boolean(club.joined));
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!user || joined) return;
    setLoading(true);
    try {
      await api.user.joinCommunity(Number(user.id), Number(club.id));
      setJoined(true);
      refresh();
    } catch (err) {
      console.error("Failed to join community:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookAtSocial = async () => {
    if (!onboarded) {
      await completeOnboarding();
    }
    router.push(`/club/${club.id}`);
  };

  return (
    <div className="w-full bg-white rounded-xl flex flex-col shadow-[0px_2.5px_5px_0px_rgba(53,74,156,0.15)] outline outline-[0.63px] outline-stone-300 overflow-hidden">
      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 px-4 pt-5 pb-4">
        {/* Avatar + Name row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 shrink-0 rounded-xl">
            <AvatarImage
              src={club.avatarUrl || "/avatars/placeholder.png"}
              alt={club.name}
              className="rounded-xl"
            />
            <AvatarFallback className="rounded-xl text-sm font-medium bg-blue-100 text-blue-900">
              {club.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
            <span className="font-[family-name:var(--font-ibm)] text-sm font-semibold text-black leading-snug line-clamp-2">
              {club.name}
            </span>
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
              <Users className="w-3 h-3 text-stone-400" strokeWidth={1.5} />
              <span className="font-[family-name:var(--font-ibm)] text-[10px] text-zinc-500">
                200-250
              </span>
            </div>
          </div>
        </div>
        {/* Description */}
        <p className="font-[family-name:var(--font-ibm)] text-xs text-zinc-600 leading-relaxed line-clamp-4 flex-1">
          {club.description}
        </p>

        {/* Footer: Look at Social + Join Button */}
        <div className="flex justify-between items-center pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={handleLookAtSocial}
            className="font-[family-name:var(--font-ibm)] text-xs text-blue-900 underline underline-offset-2 hover:text-blue-700 transition-colors"
          >
            View club page
          </button>

          {joined ? (
            <button
              disabled
              className="w-24 h-8 bg-orange-600 rounded-md flex justify-center items-center gap-1.5 cursor-default"
            >
              <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
              <span className="font-[family-name:var(--font-ibm)] text-xs text-white">
                Joined
              </span>
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-24 h-8 bg-blue-900 rounded-md flex justify-center items-center hover:bg-blue-800 active:bg-blue-950 transition-colors disabled:opacity-60"
            >
              <span className="font-[family-name:var(--font-ibm)] text-xs text-white">
                {loading ? "Joining…" : "Join Club"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
