"""
test_serendipity.py — Unit tests for user-based collaborative serendipity picks.
"""

import pytest
from recommender.serendipity import compute_serendipity_picks


# ── Fixtures ──────────────────────────────────────────────────────────────────

USERS = [
    {"user_id": 1, "username": "alice",  "tags": ["Pre-Med", "Biology"]},
    {"user_id": 2, "username": "bob",    "tags": ["Pre-Med", "Biology", "Chemistry"]},
    {"user_id": 3, "username": "carol",  "tags": ["Pre-Med", "Chemistry"]},
    {"user_id": 4, "username": "dave",   "tags": ["Gaming", "Art"]},  # Dissimilar to target
]

COMMUNITIES = [
    {"community_id": 1, "community_name": "Neuroscience Explorers", "tags": ["Biology"]},
    {"community_id": 2, "community_name": "Pre-Med Alliance",        "tags": ["Pre-Med"]},
    {"community_id": 3, "community_name": "Chemistry Club",          "tags": ["Chemistry"]},
    {"community_id": 4, "community_name": "Gator Robotics",          "tags": ["Robotics"]},
]


# ── Tests ────────────────────────────────────────────────────────────────────

class TestComputeSerendipityPicks:

    def test_surfaces_clubs_from_similar_users(self):
        """
        Alice has joined Neuroscience Explorers. Bob and carol — both similar
        to alice via interests — joined Pre-Med Alliance and Chemistry Club.
        Serendipity should surface those two.
        """
        memberships = [
            {"user_id": 1, "community_id": 1},  # alice: Neuroscience Explorers
            {"user_id": 2, "community_id": 1},  # bob: Neuroscience Explorers (shared w/ alice)
            {"user_id": 2, "community_id": 2},  # bob: Pre-Med Alliance        ← pick
            {"user_id": 3, "community_id": 3},  # carol: Chemistry Club        ← pick
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=USERS,
            memberships=memberships,
            communities=COMMUNITIES,
        )

        pick_ids = [p["community_id"] for p in picks]
        # Pre-Med Alliance and Chemistry Club should both surface
        assert 2 in pick_ids, "Pre-Med Alliance should be suggested"
        assert 3 in pick_ids, "Chemistry Club should be suggested"
        # Already-joined Neuroscience Explorers should NOT appear
        assert 1 not in pick_ids, "Already-joined clubs must be excluded"

    def test_excludes_already_joined(self):
        """A target user's existing clubs are never in the picks."""
        memberships = [
            {"user_id": 1, "community_id": 2},  # alice already joined Pre-Med Alliance
            {"user_id": 2, "community_id": 2},  # bob also in Pre-Med Alliance
            {"user_id": 2, "community_id": 3},  # bob also in Chemistry Club
            {"user_id": 3, "community_id": 3},  # carol also in Chemistry Club
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=USERS,
            memberships=memberships,
            communities=COMMUNITIES,
        )

        pick_ids = [p["community_id"] for p in picks]
        assert 2 not in pick_ids  # Alice already in Pre-Med Alliance
        assert 3 in pick_ids       # But she should still get Chemistry Club

    def test_endorsers_included(self):
        """Each pick should list the similar users who endorsed it."""
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 2, "community_id": 1},
            {"user_id": 2, "community_id": 3},  # bob endorses Chemistry Club
            {"user_id": 3, "community_id": 3},  # carol endorses Chemistry Club
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=USERS,
            memberships=memberships,
            communities=COMMUNITIES,
        )

        chemistry = next((p for p in picks if p["community_id"] == 3), None)
        assert chemistry is not None, "Chemistry Club should be in picks"
        assert chemistry["endorsement_count"] >= 1
        usernames = [e["username"] for e in chemistry["endorsed_by"]]
        assert "bob" in usernames or "carol" in usernames

    def test_scores_normalized_to_one(self):
        """Top pick should have score = 1.0 after normalization."""
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 2, "community_id": 1},
            {"user_id": 2, "community_id": 2},
            {"user_id": 3, "community_id": 2},
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=USERS,
            memberships=memberships,
            communities=COMMUNITIES,
        )

        assert len(picks) > 0
        assert picks[0]["score"] == pytest.approx(1.0)
        # All scores are between 0 and 1
        for p in picks:
            assert 0.0 <= p["score"] <= 1.0

    def test_no_similar_users_returns_empty(self):
        """A user with no overlap with anyone gets zero picks."""
        isolated_user = {"user_id": 99, "username": "loner", "tags": ["ObscureTag"]}
        memberships = [
            {"user_id": 2, "community_id": 2},
            {"user_id": 3, "community_id": 3},
        ]

        picks = compute_serendipity_picks(
            target_user_id=99,
            users=USERS + [isolated_user],
            memberships=memberships,
            communities=COMMUNITIES,
        )

        assert picks == []

    def test_respects_top_k(self):
        """top_k_picks should cap the result length."""
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 2, "community_id": 1},
            {"user_id": 2, "community_id": 2},
            {"user_id": 2, "community_id": 3},
            {"user_id": 2, "community_id": 4},
            {"user_id": 3, "community_id": 2},
            {"user_id": 3, "community_id": 3},
            {"user_id": 3, "community_id": 4},
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=USERS,
            memberships=memberships,
            communities=COMMUNITIES,
            top_k_picks=2,
        )

        assert len(picks) <= 2

    def test_smoke_users_excluded(self):
        """Smoke test users should not appear in endorsements."""
        users_with_smoke = USERS + [
            {"user_id": 100, "username": "smoke_12345", "tags": ["Pre-Med", "Biology"]},
        ]
        memberships = [
            {"user_id": 1, "community_id": 1},
            {"user_id": 100, "community_id": 2},  # smoke user would endorse Pre-Med Alliance
        ]

        picks = compute_serendipity_picks(
            target_user_id=1,
            users=users_with_smoke,
            memberships=memberships,
            communities=COMMUNITIES,
        )

        # The smoke user's endorsement should be filtered out, so Pre-Med Alliance
        # has no other endorsers and should not appear.
        pick_ids = [p["community_id"] for p in picks]
        assert 2 not in pick_ids
