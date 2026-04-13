"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type EventsYouMightLikeProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

export default function EventsYouMightLike({
  collapsed,
  onCollapsedChange,
}: EventsYouMightLikeProps) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);

  useEffect(() => {
    if (!hydrated || !user) return;
    api.community
      .getRecommended(Number(user.id))
      .then((data) => setClubs(data.slice(0, 5)))
      .catch(() => {});
  }, [hydrated, user]);

  return (
    <div
      className={`flex h-screen flex-col rounded-l-2xl border border-r-0 border-slate-200 bg-white shadow-sm transition-all duration-200 ${
        collapsed ? "w-14" : "w-72 xl:w-80"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-slate-900">
              Top picks for you
            </h3>
          </div>
        ) : (
          <Sparkles className="mx-auto h-4 w-4 text-orange-500" />
        )}

        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={collapsed ? "Expand top picks" : "Collapse top picks"}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {clubs.length === 0 ? (
            <p className="text-xs text-slate-400">No recommendations yet</p>
          ) : (
            clubs.map((c: any) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/club/${c.id}`)}
                className="w-full rounded-xl border border-slate-100 p-3 text-left text-xs transition hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-900">{c.name}</p>
                <p className="mt-0.5 line-clamp-1 text-slate-500">
                  {c.description || "No description"}
                </p>
                {c.tags && (
                  <p className="mt-1.5 font-medium text-orange-500">
                    {c.tags
                      .slice(0, 3)
                      .map((t: any) => t.name || t)
                      .join(" · ")}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
