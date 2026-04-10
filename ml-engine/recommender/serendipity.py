"""
serendipity.py — Serendipity Picks via User-Based Collaborative Filtering
==========================================================================
Surfaces communities that users similar to the target have joined but the
target hasn't discovered yet. This is the "Users like you also joined"
signal — it's the one thing in the engine that can recommend clubs outside
a user's stated interests, fighting popularity bias and helping users
discover beyond their current scope.

Pipeline:
    target user → find top-K similar users → aggregate the clubs they joined
    → exclude clubs the target already joined → rank by (similarity × endorsements)

The output includes which peers endorsed each pick so the UI can render copy
like "Carol (60% similar) and 2 others joined this".
"""

from collections import defaultdict

from recommender.user_similarity import compute_user_similarities


def compute_serendipity_picks(
    target_user_id: int,
    users: list[dict],
    memberships: list[dict],
    communities: list[dict],
    top_n_similar_users: int = 10,
    top_k_picks: int = 10,
    exclude_prefixes: tuple[str, ...] = ("smoke_",),
) -> list[dict]:
    """
    Returns the top-K serendipity picks for a user, ranked by weighted endorsements.

    Each pick looks like:
        {
            "community_id": 11,
            "community_name": "Pre-Med Alliance",
            "score": 0.62,
            "endorsed_by": [
                {"user_id": 3, "username": "carol", "similarity": 0.604},
                ...
            ],
            "endorsement_count": 3,
        }

    The score is the sum of similarity values from each endorsing peer,
    normalized to 0.0–1.0 by dividing by the top score.
    """
    # Step 1: figure out which communities the target already joined
    already_joined = {
        m["community_id"]
        for m in memberships
        if m["user_id"] == target_user_id
    }

    # Step 2: find similar users (smoke test users filtered at the module level)
    similar_users = compute_user_similarities(
        target_user_id=target_user_id,
        users=users,
        memberships=memberships,
        communities=communities,
        top_k=top_n_similar_users,
        exclude_prefixes=exclude_prefixes,
    )

    if not similar_users:
        return []

    # Step 3: build a membership lookup so we can ask "what did user X join?"
    memberships_by_user: dict[int, set[int]] = defaultdict(set)
    for m in memberships:
        memberships_by_user[m["user_id"]].add(m["community_id"])

    # Step 4: aggregate candidate clubs from similar users
    # candidate_scores[cid] = total similarity-weighted endorsements
    # endorsers[cid] = list of peer dicts (for the "why" UI copy)
    candidate_scores: dict[int, float] = defaultdict(float)
    endorsers: dict[int, list[dict]] = defaultdict(list)

    for peer in similar_users:
        peer_clubs = memberships_by_user.get(peer["user_id"], set())
        for cid in peer_clubs:
            if cid in already_joined:
                continue  # target already has this, skip
            candidate_scores[cid] += peer["similarity"]
            endorsers[cid].append({
                "user_id": peer["user_id"],
                "username": peer["username"],
                "similarity": peer["similarity"],
            })

    if not candidate_scores:
        return []

    # Step 5: normalize scores to 0.0–1.0 so they're comparable across calls
    max_score = max(candidate_scores.values())

    # Step 6: build the result list with community names + sorted endorsers
    comm_name_by_id = {c["community_id"]: c["community_name"] for c in communities}

    results = []
    for cid, raw in candidate_scores.items():
        # Sort endorsers by similarity descending so the strongest match is first
        sorted_endorsers = sorted(
            endorsers[cid], key=lambda p: p["similarity"], reverse=True
        )
        results.append({
            "community_id": cid,
            "community_name": comm_name_by_id.get(cid, f"Community {cid}"),
            "score": round(raw / max_score, 3) if max_score > 0 else 0.0,
            "raw_score": round(raw, 3),
            "endorsed_by": sorted_endorsers,
            "endorsement_count": len(sorted_endorsers),
        })

    # Step 7: rank by score descending, return top-K
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:top_k_picks]
