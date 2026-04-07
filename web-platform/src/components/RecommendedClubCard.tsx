"use client";

import React, { useState } from "react";
import { Club } from "@/mocks/clubs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import { Users, Check } from "lucide-react";

export default function RecommendedClubCard({ club }: { club: Club }) {
  const { user } = useAuth();
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

  return (
    <div className="w-full bg-white rounded-xl p-3 flex flex-col gap-4 shadow-[0px_2.5px_5px_0px_rgba(53,74,156,0.15)] outline outline-[0.63px] outline-stone-300">
      {/* Header: Avatar + Name + Member Count */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-start">
          <div className="flex items-end gap-2 min-w-0 flex-1">
            <Avatar className="h-12 w-12 shrink-0 rounded-xl">
              <AvatarImage
                src={club.avatarUrl || "/avatars/placeholder.png"}
                alt={club.name}
                className="rounded-xl"
              />
              <AvatarFallback className="rounded-xl text-sm font-medium">
                {club.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-[family-name:var(--font-ibm)] text-base font-medium text-black truncate">
              {club.name}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Users className="w-3 h-3 text-stone-300" strokeWidth={1.5} />
            <span className="font-[family-name:var(--font-ibm)] text-[10px] text-zinc-600">
              200-250p
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="font-[family-name:var(--font-ibm)] text-xs text-black leading-relaxed line-clamp-4">
          {club.description}
        </p>
      </div>

      {/* Footer: Look at Social + Join Button */}
      <div className="flex justify-between items-center">
        <Link
          href={`/club/${club.id}`}
          className="px-1.5 py-3 font-[family-name:var(--font-ibm)] text-xs text-blue-900 underline hover:text-blue-700 transition-colors"
        >
          Look at Social
        </Link>

        {joined ? (
          <button
            disabled
            className="w-28 px-1.5 py-2 bg-orange-600 rounded-md flex justify-center items-center gap-2 cursor-default"
          >
            <Check className="w-3 h-3 text-stone-50" strokeWidth={2.5} />
            <span className="font-[family-name:var(--font-ibm)] text-xs text-white">
              Joined
            </span>
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-24 px-1.5 py-2 bg-blue-900 rounded-md flex justify-center items-center gap-3 hover:bg-blue-800 transition-colors disabled:opacity-60"
          >
            <span className="font-[family-name:var(--font-ibm)] text-xs text-white">
              {loading ? "Joining..." : "Join Club"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
