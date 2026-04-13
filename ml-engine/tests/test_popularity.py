"""
test_popularity.py — Tests for time-decayed member count scoring
"""

from datetime import datetime, timedelta, timezone

import pytest
from recommender.popularity import compute_popularity_scores, HALF_LIFE_DAYS


# ── Sample Data ──────────────────────────────────────────────────────────────

COMMUNITIES = [
    {"community_id": 1, "community_name": "Next.js Devs", "tags": []},
    {"community_id": 2, "community_name": "Python Enthusiasts", "tags": []},
    {"community_id": 3, "community_name": "Gamers Hub", "tags": []},
]


# ── Tests ────────────────────────────────────────────────────────────────────

class TestComputePopularityScores:

    def test_normal_distribution(self):
        """Communities with different member counts get normalized scores."""
        memberships = [
            {"user_id": 1, "community_id": 1},  # Next.js: 1 member
            {"user_id": 1, "community_id": 2},  # Python: 2 members
            {"user_id": 3, "community_id": 2},
            {"user_id": 2, "community_id": 3},  # Gamers: 1 member
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES)

        # Python has max (2), so it gets 1.0
        assert scores[2] == pytest.approx(1.0)

        # Others have 1, so they get 0.5
        assert scores[1] == pytest.approx(0.5)
        assert scores[3] == pytest.approx(0.5)

    def test_all_equal_members(self):
        """All communities have same member count."""
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 2, "community_id": 2},
            {"user_id": 3, "community_id": 3},
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES)

        # All have 1 member, max is 1, so everyone gets 1.0
        assert scores[1] == pytest.approx(1.0)
        assert scores[2] == pytest.approx(1.0)
        assert scores[3] == pytest.approx(1.0)

    def test_community_with_zero_members(self):
        """One community has no members."""
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 2, "community_id": 1},  # Next.js: 2 members
            # Python: 0 members
            {"user_id": 3, "community_id": 3},  # Gamers: 1 member
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES)

        assert scores[1] == pytest.approx(1.0)   # 2/2
        assert scores[2] == pytest.approx(0.0)   # 0/2
        assert scores[3] == pytest.approx(0.5)   # 1/2

    def test_no_memberships_at_all(self):
        """Empty database — no one has joined anything."""
        memberships = []

        scores = compute_popularity_scores(memberships, COMMUNITIES)

        # All should be 0.0
        assert scores[1] == pytest.approx(0.0)
        assert scores[2] == pytest.approx(0.0)
        assert scores[3] == pytest.approx(0.0)

    def test_returns_all_communities(self):
        """Scores dict should contain an entry for every community."""
        memberships = [{"user_id": 1, "community_id": 1}]
        scores = compute_popularity_scores(memberships, COMMUNITIES)

        assert len(scores) == len(COMMUNITIES)
        assert all(cid in scores for cid in [1, 2, 3])

    def test_single_community_single_member(self):
        """Edge case: only one community with one member."""
        communities = [{"community_id": 99, "community_name": "Solo Club", "tags": []}]
        memberships = [{"user_id": 1, "community_id": 99}]

        scores = compute_popularity_scores(memberships, communities)

        # 1/1 = 1.0
        assert scores[99] == pytest.approx(1.0)

    def test_recent_join_beats_old_join(self):
        """
        Two clubs have the same raw member count, but the one with recent
        joins should score higher thanks to time decay.
        """
        now = datetime(2026, 4, 1, tzinfo=timezone.utc)
        recent = now - timedelta(days=5)      # weight ~0.96
        old = now - timedelta(days=365)       # weight ~0.061

        memberships = [
            # Next.js Devs (id=1): 2 recent joins
            {"user_id": 1, "community_id": 1, "joined_at": recent},
            {"user_id": 2, "community_id": 1, "joined_at": recent},
            # Python Enthusiasts (id=2): 2 stale joins
            {"user_id": 3, "community_id": 2, "joined_at": old},
            {"user_id": 4, "community_id": 2, "joined_at": old},
            # Gamers Hub (id=3): no members
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES, now=now)

        # Next.js Devs should rank at the top (freshest joins)
        assert scores[1] == pytest.approx(1.0)
        # Python should be meaningfully lower despite having the same count
        assert scores[2] < 0.15
        # Gamers Hub has no members, still zero
        assert scores[3] == pytest.approx(0.0)

    def test_half_life_weighting(self):
        """A join exactly one half-life ago should weigh 0.5 of a fresh join."""
        now = datetime(2026, 4, 1, tzinfo=timezone.utc)
        fresh = now
        half_life_ago = now - timedelta(days=HALF_LIFE_DAYS)

        memberships = [
            {"user_id": 1, "community_id": 1, "joined_at": fresh},         # weight 1.0
            {"user_id": 2, "community_id": 2, "joined_at": half_life_ago}, # weight 0.5
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES, now=now)

        # Club 1 weighted 1.0, club 2 weighted 0.5 → after normalization 1.0 and 0.5
        assert scores[1] == pytest.approx(1.0)
        assert scores[2] == pytest.approx(0.5, abs=0.01)

    def test_missing_joined_at_treated_as_now(self):
        """Backward compat: memberships without joined_at should still work."""
        memberships = [
            {"user_id": 1, "community_id": 1},  # no joined_at
            {"user_id": 2, "community_id": 1},
            {"user_id": 3, "community_id": 2},
        ]

        scores = compute_popularity_scores(memberships, COMMUNITIES)

        # Same as the old behavior: raw count divided by max count
        assert scores[1] == pytest.approx(1.0)  # 2/2
        assert scores[2] == pytest.approx(0.5)  # 1/2
        assert scores[3] == pytest.approx(0.0)
