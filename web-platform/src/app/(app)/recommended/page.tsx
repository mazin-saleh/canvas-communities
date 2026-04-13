"use client";

import React, { useEffect, useState } from "react";
import RecommendedClubCard from "@/components/RecommendedClubCard";
import { Club } from "@/mocks/clubs";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RecommendedPage() {
  const { user, hydrated } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !user) return;

    async function fetchRecommendations() {
      try {
        const [data, memberships] = await Promise.all([
          api.community.getRecommended(Number(user!.id)),
          api.user.getCommunities(Number(user!.id)),
        ]);

        const joinedCommunityIds = new Set(
          memberships.map((m: any) => m.communityId ?? m.community?.id)
        );

        const transformed: Club[] = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description || "No description available",
          avatarUrl: c.avatarUrl,
          tags: c.tags?.map((t: any) => t.name) || [],
          joined: joinedCommunityIds.has(c.id),
        }));

        setClubs(transformed);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [hydrated, user]);

  if (!hydrated || loading) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-5">
        <header>
          <h1 className="font-[family-name:var(--font-anybody)] text-3xl md:text-5xl font-black text-green-600">
            Your Personalized Recommendations.
          </h1>
          <p className="font-[family-name:var(--font-ibm)] text-lg md:text-2xl text-black mt-1">
            Loading your recommendations...
          </p>
        </header>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-5">
        <header>
          <h1 className="font-[family-name:var(--font-anybody)] text-3xl md:text-5xl font-black text-green-600">
            Your Personalized Recommendations.
          </h1>
          <p className="font-[family-name:var(--font-ibm)] text-lg md:text-2xl text-black mt-1">
            Please log in to see your recommendations.
          </p>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 px-5 pt-5">
        <header>
          <h1 className="font-[family-name:var(--font-anybody)] text-3xl md:text-5xl font-black text-green-600">
            Your Personalized Recommendations.
          </h1>
          <p className="font-[family-name:var(--font-ibm)] text-lg md:text-2xl text-black mt-1">
            Something went wrong.
          </p>
        </header>
        <div className="text-center py-8 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 pb-4">
        <h1 className="font-[family-name:var(--font-anybody)] text-3xl md:text-5xl font-black text-green-600">
          Your Personalized Recommendations.
        </h1>
        <p className="font-[family-name:var(--font-ibm)] text-lg md:text-2xl text-black mt-1">
          {"We've hand-picked these clubs just for you based on your interests."}
        </p>
      </header>

      {/* Card Grid */}
      {clubs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-[family-name:var(--font-ibm)]">
          No recommendations yet. Try adding some interests!
        </div>
      ) : (
        <div className="py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c) => (
              <RecommendedClubCard key={c.id} club={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
