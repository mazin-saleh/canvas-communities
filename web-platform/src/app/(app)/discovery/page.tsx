"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Input from "@/components/ui/input";
import DiscoveryCarouselRow from "@/components/discovery/DiscoveryCarouselRow";
import EventsYouMightLike from "@/components/discovery/EventsYouMightLike";
import { DiscoveryClub } from "@/mocks/discovery";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// Tag groups for generating "Since you liked X" rows dynamically
const TAG_GROUPS: Record<string, string[]> = {
  Tech: ["Computer Science", "Engineering", "Robotics", "AI & Machine Learning", "Cybersecurity", "javascript", "react", "python"],
  Social: ["Social", "Leadership", "Networking", "community"],
  Creative: ["Music", "Art", "Dance"],
  Athletic: ["Sports", "Fitness", "Outdoors"],
  Science: ["Pre-Med", "ml"],
};

const FILTER_CHIPS = [
  "Computer Science",
  "Engineering",
  "Social",
  "Music",
  "Dance",
  "Sports",
  "Fitness",
  "Outdoors",
  "Art",
  "Leadership",
];

function findScrollParent(el: Element | null): Element | null {
  let cur: Element | null = el;
  while (cur && cur !== document.documentElement) {
    const style = getComputedStyle(cur);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return cur;
    cur = cur.parentElement;
  }
  return document.documentElement;
}

export default function DiscoveryPage() {
  const { user, hydrated } = useAuth();
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [allClubs, setAllClubs] = useState<DiscoveryClub[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ML recommendations and user interests when user is available
  useEffect(() => {
    if (!hydrated || !user) return;

    async function fetchData() {
      try {
        const [data, interests] = await Promise.all([
          api.community.getRecommended(Number(user!.id)),
          api.user.getInterests(Number(user!.id)),
        ]);

        setUserInterests(interests.map((t: any) => t.name));

        const transformed: DiscoveryClub[] = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description || "No description available",
          tags: c.tags?.map((t: any) => t.name) || [],
          logoSrc: c.avatarUrl || "/avatars/placeholder.png",
          bannerSrc: "/gator-hero.png",
          score: c.score,
          contentScore: c.contentScore,
          collabScore: c.collabScore,
        }));

        setAllClubs(transformed);
      } catch (err: any) {
        console.error("Failed to fetch recommendations:", err);
        setError(err.message || "Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [hydrated, user]);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const applyFilters = (clubs: DiscoveryClub[]) => {
    const q = query.trim().toLowerCase();
    return clubs.filter((club) => {
      const matchesQuery =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesFilters =
        activeFilters.length === 0 ||
        club.tags.some((tag) =>
          activeFilters.some((filter) => tag.toLowerCase() === filter.toLowerCase())
        );

      return matchesQuery && matchesFilters;
    });
  };

  // ML-ranked recommendations
  const forYouClubs = useMemo(() => applyFilters(allClubs), [allClubs, query, activeFilters]);

  // Build dynamic "Since you liked X" rows based on user's actual interests
  const interestRows = useMemo(() => {
    const rows: { label: string; clubs: DiscoveryClub[] }[] = [];
    for (const [groupName, groupTags] of Object.entries(TAG_GROUPS)) {
      // Check if the user has any interests in this group
      const hasInterest = userInterests.some((interest) =>
        groupTags.some((gt) => gt.toLowerCase() === interest.toLowerCase())
      );
      if (!hasInterest) continue;

      const filtered = applyFilters(
        allClubs.filter((c) =>
          c.tags.some((t) => groupTags.some((gt) => gt.toLowerCase() === t.toLowerCase()))
        )
      );
      if (filtered.length > 0) {
        rows.push({ label: groupName, clubs: filtered });
      }
    }
    return rows.slice(0, 2); // Show at most 2 interest-based rows
  }, [allClubs, userInterests, query, activeFilters]);

  const controlsRef = useRef<HTMLDivElement | null>(null);
  const pageWrapperRef = useRef<HTMLDivElement | null>(null);

  const [rowHeight, setRowHeight] = useState<number | undefined>(undefined);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const GAP = 32;
    const NUM_ROWS = 3;
    const MIN_ROW_HEIGHT = 130;

    function computeRowHeight() {
      const controlsEl = controlsRef.current;
      const wrapperEl = pageWrapperRef.current;

      const scrollParent = findScrollParent(controlsEl ?? wrapperEl) ?? document.documentElement;
      const scrollParentEl = scrollParent as HTMLElement;

      requestAnimationFrame(() => {
        const containerRect = scrollParentEl.getBoundingClientRect();
        const containerH = scrollParentEl.clientHeight || window.innerHeight;

        const controlsRect = controlsEl ? controlsEl.getBoundingClientRect() : null;
        const controlsBottomRelative = controlsRect ? controlsRect.bottom - containerRect.top : 0;

        const bottomMargin = 20;
        const available = Math.max(0, containerH - controlsBottomRelative - bottomMargin);

        const totalGaps = GAP * (NUM_ROWS - 1);
        const rawRowHeight = Math.floor((available - totalGaps) / NUM_ROWS);
        const finalRowHeight = Math.max(MIN_ROW_HEIGHT, rawRowHeight);

        setContainerHeight(containerH);
        setRowHeight(finalRowHeight);
      });
    }

    computeRowHeight();

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => computeRowHeight());
      if (controlsRef.current) ro.observe(controlsRef.current);
      if (pageWrapperRef.current) ro.observe(pageWrapperRef.current);

      const scrollParent = findScrollParent(controlsRef.current ?? pageWrapperRef.current);
      if (scrollParent && scrollParent !== document.documentElement) ro.observe(scrollParent);
    } catch {
      window.addEventListener("resize", computeRowHeight);
    }

    window.addEventListener("resize", computeRowHeight);

    return () => {
      window.removeEventListener("resize", computeRowHeight);
      if (ro) ro.disconnect();
    };
  }, []);

  // Show loading while auth hydrates
  if (!hydrated || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading recommendations...</div>
      </div>
    );
  }

  // No user logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Please log in to see personalized recommendations</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="text-red-500 font-medium">Something went wrong</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageWrapperRef} className="relative min-h-full bg-[url('/personalpage.png')] bg-cover bg-center">
    <div className="absolute inset-0 bg-white/90" />

      {/* page content */}
      <div className="relative px-10 py-2 min-w-0">
        <div className="flex gap-10 items-start min-w-0">
          {/* MAIN */}
          <div className="flex-1 min-w-0">
            {/* Controls*/}
            <div ref={controlsRef} className="space-y-4">
              {/* Search  */}
              <div className="relative max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search by name or try 'I want to help in the community'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-[clamp(2.5rem,4vh,3rem)] w-full rounded-full bg-white pl-10 pr-4 text-sm shadow-sm"
                />
              </div>

              {/* Chips */}
              <div className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
                {FILTER_CHIPS.map((chip) => {
                  const active = activeFilters.includes(chip);
                  return (
                    <motion.button
                      key={chip}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFilter(chip)}
                      className={`shrink-0 rounded-full px-4 py-1 text-xs font-medium transition
                        ${
                          active
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      {chip}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Rows*/}
            <div className="mt-4 space-y-4">
              <DiscoveryCarouselRow
                title={
                  <>
                    For <span className="text-orange-500">You</span>
                  </>
                }
                clubs={forYouClubs}
                rowId="for-you"
                rowHeight={rowHeight}
              />

              {interestRows.map((row) => (
                <DiscoveryCarouselRow
                  key={row.label}
                  title={
                    <>
                      Since you liked{" "}
                      <span className="text-orange-500">{row.label}</span>
                    </>
                  }
                  clubs={row.clubs}
                  rowId={row.label.toLowerCase()}
                  rowHeight={rowHeight}
                />
              ))}
            </div>
          </div>

          {/* RIGHT EVENTS */}
          <aside className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-10">
              <EventsYouMightLike
                maxHeight={
                  containerHeight ? Math.max(200, Math.floor(containerHeight - 80)) : undefined
                }
              />
            </div>
          </aside>
        </div>
      </div>

      <div
        aria-hidden
        className="fixed left-4 bottom-4 z-50 rounded-md bg-white/90 px-3 py-2 text-xs shadow-md text-slate-700"
      >

      </div>
    </div>
  );
}
