"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import DiscoveryCarouselRow from "@/components/discovery/DiscoveryCarouselRow";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function extractChips(clubs: any[], interests: string[]): string[] {
  const tagCounts = new Map<string, number>();
  for (const c of clubs) {
    for (const t of c.tags || []) {
      const name = typeof t === "string" ? t : t;
      tagCounts.set(name, (tagCounts.get(name) || 0) + 1);
    }
  }
  const interestSet = new Set(interests);
  const sorted = [...tagCounts.entries()]
    .sort((a, b) => {
      const aIsInterest = interestSet.has(a[0]) ? 1 : 0;
      const bIsInterest = interestSet.has(b[0]) ? 1 : 0;
      if (bIsInterest !== aIsInterest) return bIsInterest - aIsInterest;
      return b[1] - a[1];
    })
    .map(([name]) => name);
  return sorted.slice(0, 10);
}

export default function DiscoveryPage() {
  const { user, hydrated } = useAuth();
  const currentUserId = hydrated && user ? Number(user.id) : null;
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [exploreClubs, setExploreClubs] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label],
    );
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      if (!currentUserId) {
        setError("No current user");
        setLoading(false);
        return;
      }
      try {
        // Fetch recs, interests, and serendipity picks in parallel
        // Serendipity is optional — if it fails, the page still works
        const [data, interests, explore] = await Promise.all([
          api.community.getRecommended(currentUserId),
          api.user.getInterests(currentUserId),
          api.community.getExplore(currentUserId).catch(() => []),
        ]);
        if (!mounted) return;
        setUserInterests(interests.map((t: any) => t.name));
        const mapped = (Array.isArray(data) ? data : []).map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description || "Club description coming soon.",
          tags: (c.tags || []).map((t: any) =>
            t && t.name ? t.name : String(t || ""),
          ),
          nextMeeting: {
            title: (c.nextMeeting && c.nextMeeting.title) || "General Meeting",
            datetime: (c.nextMeeting && c.nextMeeting.datetime) || "TBD",
            location: (c.nextMeeting && c.nextMeeting.location) || "Campus",
          },
          logoSrc: c.avatarUrl || "/avatars/placeholder.png",
          bannerSrc: c.bannerUrl || c.banner || undefined,
          score: c.score,
          contentScore: c.contentScore,
          collabScore: c.collabScore,
          reason: c.reason,
          reasonDetail: c.reasonDetail,
          reasonType: c.reasonType,
          matchedTags: c.matchedTags,
        }));
        setClubs(mapped);

        // Same shape transform for serendipity picks so DiscoveryClubCard can render them
        const mappedExplore = (Array.isArray(explore) ? explore : []).map(
          (c: any) => ({
            id: String(c.id),
            name: c.name,
            description: c.description || "Club description coming soon.",
            tags: (c.tags || []).map((t: any) =>
              t && t.name ? t.name : String(t || ""),
            ),
            nextMeeting: {
              title: "General Meeting",
              datetime: "TBD",
              location: "Campus",
            },
            logoSrc: c.avatarUrl || "/avatars/placeholder.png",
            bannerSrc: c.bannerUrl || c.banner || undefined,
            score: c.score,
            contentScore: c.contentScore,
            collabScore: c.collabScore,
            reason: c.reason,
            reasonDetail: c.reasonDetail,
            reasonType: c.reasonType,
            endorsedBy: c.endorsedBy,
            endorsementCount: c.endorsementCount,
          }),
        );
        setExploreClubs(mappedExplore);
      } catch (err: any) {
        console.error("Failed to load recommendations", err);
        setError(err.message || "Failed to load recommendations");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  // Search all communities when user types a query
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const data = await api.community.list({ q, limit: 20 });
        const items = Array.isArray(data) ? data : (data as any).items || [];
        const mapped = items.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description || "Club description coming soon.",
          tags: (c.tags || []).map((t: any) => (t && t.name ? t.name : String(t || ""))),
          nextMeeting: { title: "General Meeting", datetime: "TBD", location: "Campus" },
          logoSrc: c.avatarUrl || "/avatars/placeholder.png",
          bannerSrc: c.bannerUrl || c.banner || undefined,
        }));
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [query]);

  const applyFilters = (clubsToFilter = clubs) => {
    const q = query.trim().toLowerCase();
    return clubsToFilter.filter((club: any) => {
      const name = (club.name || "").toLowerCase();
      const tagNames: string[] = (club.tags || []).map((t: any) =>
        (t || "").toLowerCase(),
      );
      const matchesQuery =
        !q || name.includes(q) || tagNames.some((tag) => tag.includes(q));
      const matchesFilters =
        activeFilters.length === 0 ||
        tagNames.some((tag) =>
          activeFilters.some((filter) => tag === filter.toLowerCase()),
        );
      return matchesQuery && matchesFilters;
    });
  };

  const forYouClubs = useMemo(
    () => applyFilters(clubs),
    [clubs, query, activeFilters],
  );
  const filteredExploreClubs = useMemo(
    () => applyFilters(exploreClubs),
    [exploreClubs, query, activeFilters],
  );

  const interestRows = useMemo(() => {
    if (userInterests.length === 0) return [];
    return userInterests
      .map((interest) => {
        const matched = applyFilters(
          clubs.filter((c) =>
            (c.tags || []).some(
              (t: any) => t.toLowerCase() === interest.toLowerCase(),
            ),
          ),
        );
        return { interest, clubs: matched };
      })
      .filter((row) => row.clubs.length > 0)
      .slice(0, 2);
  }, [clubs, userInterests, query, activeFilters]);

  return (
    <div className="relative min-h-full bg-[url('/background.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/90" />

      <div className="relative">
        {/* Search + Chips — sticky header */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="px-4 py-3 sm:px-6 lg:px-8 space-y-3">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Search by name or try 'I want to help in the community'..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm shadow-sm border-slate-200"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {extractChips(clubs, userInterests).map((chip: string) => {
                const active = activeFilters.includes(chip);
                return (
                  <motion.button
                    key={chip}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter(chip)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {chip}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="py-6 pl-4 pr-0 sm:pl-6 sm:pr-0 lg:pl-8 lg:pr-0">
          <div className="space-y-8">
            {loading ? (
              <p className="text-sm text-slate-500 py-8">
                Loading recommendations…
              </p>
            ) : error ? (
              <p className="text-sm text-red-500 py-8">Error: {error}</p>
            ) : (
              <>
                {query.trim() && searchResults.length > 0 && (
                  <DiscoveryCarouselRow
                    title={
                      <>
                        Search results for{" "}
                        <span className="text-orange-500">{query.trim()}</span>
                      </>
                    }
                    clubs={searchResults}
                    rowId="search-results"
                  />
                )}
                {query.trim() && searching && (
                  <p className="text-sm text-slate-500">Searching...</p>
                )}
                {query.trim() && !searching && searchResults.length === 0 && (
                  <p className="text-sm text-slate-400">No clubs found for &ldquo;{query.trim()}&rdquo;</p>
                )}

                <DiscoveryCarouselRow
                  title={
                    <>
                      For <span className="text-orange-500">You</span>
                    </>
                  }
                  clubs={forYouClubs}
                  rowId="for-you"
                />

                {filteredExploreClubs.length > 0 && (
                  <DiscoveryCarouselRow
                    title={
                      <>
                        You might{" "}
                        <span className="text-orange-500">also like</span>
                      </>
                    }
                    clubs={filteredExploreClubs}
                    rowId="you-might-also-like"
                  />
                )}

                {interestRows.map((row) => (
                  <DiscoveryCarouselRow
                    key={row.interest}
                    title={
                      <>
                        Since you liked{" "}
                        <span className="text-orange-500">{row.interest}</span>
                      </>
                    }
                    clubs={row.clubs}
                    rowId={row.interest.toLowerCase().replace(/\s+/g, "-")}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
