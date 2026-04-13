"""
popularity.py — Time-Decayed Popularity Scoring
=================================================
Scores communities by member count weighted by recency. Recent joins count
more than old ones, so a club that got popular six months ago doesn't
dominate forever. This fights the "rich-get-richer" popularity bias.

Used as a cold-start fallback when a user has no interests or join history.
"""

from collections import defaultdict
from datetime import datetime, timezone


# Half-life in days: a join this old counts for half a fresh one.
# 90 days = a join from 3 months ago weighs 0.5, 6 months ago weighs 0.25.
# Tune this constant to make popularity more or less "sticky".
HALF_LIFE_DAYS = 90


def compute_popularity_scores(
    memberships: list[dict],
    communities: list[dict],
    now: datetime | None = None,
) -> dict[int, float]:
    """
    Returns a normalized popularity score for each community, weighted by recency.

    memberships: list of dicts from db.fetch_memberships()
                 e.g. [{"user_id": 1, "community_id": 2, "joined_at": datetime(...)}, ...]
                 joined_at is optional — missing timestamps are treated as "right now".
    communities: list of dicts from db.fetch_communities_with_tags()
                 used to ensure every community gets a score, even with 0 members.
    now:         optional override of "current time" for deterministic testing.

    Example with seed data (assume HALF_LIFE_DAYS=90):
        Two clubs have the same raw count (5 members each), but:
          - Club A: all 5 joined today        → weighted_sum = 5.0
          - Club B: all 5 joined 180 days ago → weighted_sum ≈ 1.25
        Club A ranks higher because its popularity is fresh.
    """
    reference_time = now or datetime.now(timezone.utc)

    # Sum time-decayed weights per community
    weighted_counts: dict[int, float] = defaultdict(float)
    for m in memberships:
        cid = m["community_id"]
        joined_at = m.get("joined_at")

        if joined_at is None:
            # No timestamp → treat as "now" (weight = 1.0)
            weight = 1.0
        else:
            # Ensure the datetime is timezone-aware so subtraction works
            if joined_at.tzinfo is None:
                joined_at = joined_at.replace(tzinfo=timezone.utc)
            age_days = max(0.0, (reference_time - joined_at).total_seconds() / 86400.0)
            weight = 0.5 ** (age_days / HALF_LIFE_DAYS)

        weighted_counts[cid] += weight

    # Find the highest weighted sum so we can normalize to 0.0–1.0
    max_weight = max(weighted_counts.values(), default=0.0)

    scores = {}
    for community in communities:
        cid = community["community_id"]
        raw = weighted_counts.get(cid, 0.0)
        scores[cid] = raw / max_weight if max_weight > 0 else 0.0

    return scores
