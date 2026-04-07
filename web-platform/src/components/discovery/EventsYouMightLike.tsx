"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function EventsYouMightLike() {
  const { user, hydrated } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);

  useEffect(() => {
    if (!hydrated || !user) return;
    api.community
      .getRecommended(Number(user.id))
      .then((data) => setClubs(data.slice(0, 5)))
      .catch(() => {});
  }, [hydrated, user]);

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-8rem)] space-y-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-900">Top picks for you</h3>

      {clubs.length === 0 ? (
        <p className="text-xs text-slate-400">No recommendations yet</p>
      ) : (
        clubs.map((c: any) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-100 p-3 text-xs hover:bg-slate-50 transition"
          >
            <p className="font-semibold text-slate-900">{c.name}</p>
            <p className="text-slate-500 line-clamp-1 mt-0.5">
              {c.description || "No description"}
            </p>
            {c.tags && (
              <p className="mt-1.5 text-orange-500 font-medium">
                {c.tags
                  .slice(0, 3)
                  .map((t: any) => t.name || t)
                  .join(" · ")}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
