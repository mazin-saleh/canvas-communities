"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiscoveryClub } from "@/mocks/discovery";
import DiscoveryClubCard from "@/components/discovery/DiscoveryClubCard";

type Props = {
  title: ReactNode;
  clubs: DiscoveryClub[];
  rowId?: string;
};

export default function DiscoveryCarouselRow({ title, clubs, rowId }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const id = rowId ?? `discovery-row-${Math.random().toString(36).slice(2, 9)}`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    update();

    el.addEventListener("scroll", update, { passive: true });

    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } catch {
      window.addEventListener("resize", update);
    }

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (ro) ro.disconnect();
    };
  }, [clubs.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll by the visible width minus a small peek
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>

      <div className="relative group/carousel">
        {/* Right edge fade */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white/95 to-transparent z-10" />

        {/* Scroll container */}
        <div
          ref={scrollRef}
          aria-label={typeof title === "string" ? title : undefined}
          id={id}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar"
        >
          {clubs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate-500">
              No clubs match your current filters yet.
            </p>
          ) : (
            clubs.map((club) => (
              <div
                key={club.id}
                data-discovery-card="true"
                className="snap-start shrink-0 w-[340px] sm:w-[370px] lg:w-[400px]"
              >
                <DiscoveryClubCard club={club} />
              </div>
            ))
          )}
        </div>

        {/* Nav arrows */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 -translate-x-3 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 translate-x-3 rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>
        )}
      </div>
    </section>
  );
}
