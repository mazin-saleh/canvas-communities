"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Input from "@/components/ui/input";
import PublicHeader from "@/components/public/PublicHeader";
import { api } from "@/lib/api";

type BrowseClub = {
  id: number;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  tags: { id: number; name: string }[];
};

export default function BrowsePage() {
  const [clubs, setClubs] = useState<BrowseClub[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.community
      .list()
      .then((data) => {
        if (mounted) setClubs(data as unknown as BrowseClub[]);
      })
      .catch((err) => console.error("Failed to load clubs:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = clubs.filter((club) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      club.name.toLowerCase().includes(q) ||
      club.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-background text-slate-50">
      <PublicHeader />

      <div className="bg-white min-h-[80vh]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Browse Clubs
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Explore student organizations at UF. Sign up to join and get
            personalized recommendations.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search clubs or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm shadow-sm border-slate-200 text-slate-900"
            />
          </div>

          {/* Club grid */}
          <div className="mt-8">
            {loading ? (
              <p className="text-sm text-slate-500 py-8">Loading clubs...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-500 py-8">
                {query ? "No clubs match your search." : "No clubs found."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((club) => (
                  <article
                    key={club.id}
                    className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="h-11 w-11 flex-shrink-0 rounded-full overflow-hidden border border-slate-200 bg-white">
                      <Image
                        src={club.avatarUrl || "/avatars/placeholder.png"}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">
                        {club.name}
                      </h3>
                      {club.description && (
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {club.description}
                        </p>
                      )}
                      {club.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {club.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
