"""
user_similarity.py — User-to-User Similarity
=============================================
Computes how similar users are to each other based on shared interests and
joined communities. Useful for debugging the collaborative filter and
showing "users like you" insights.

Two signals are combined:
  1. Interest overlap (Jaccard similarity on tag sets)
  2. Join overlap (cosine similarity on community membership vectors)

The final similarity is a 50/50 blend of the two.
"""

import numpy as np
from scipy.spatial.distance import cosine


def compute_user_similarities(
    target_user_id: int,
    users: list[dict],
    memberships: list[dict],
    communities: list[dict],
    top_k: int = 10,
    exclude_prefixes: tuple[str, ...] = ("smoke_",),
) -> list[dict]:
    """
    Returns the top-K most similar users to target_user_id.

    users:        list from db.fetch_users_with_interests()
                  each item: {"user_id", "username", "tags": [...]}
    memberships:  list from db.fetch_memberships()
    communities:  list from db.fetch_communities_with_tags()
    top_k:        how many similar users to return

    Returns a list of dicts sorted by overall similarity (descending):
      [
        {
          "user_id": 45,
          "username": "alice",
          "similarity": 0.83,
          "interest_similarity": 0.75,
          "join_similarity": 0.91,
          "shared_interests": ["Biology", "Astronomy"],
          "shared_clubs": ["Neuroscience Explorers"],
        },
        ...
      ]
    """
    # Locate target user
    target = next((u for u in users if u["user_id"] == target_user_id), None)
    if target is None:
        return []

    target_interests = set(target.get("tags", []))

    # Build user × community matrix for join-based similarity
    all_user_ids = sorted(u["user_id"] for u in users)
    all_community_ids = [c["community_id"] for c in communities]

    user_idx = {uid: i for i, uid in enumerate(all_user_ids)}
    comm_idx = {cid: i for i, cid in enumerate(all_community_ids)}

    matrix = np.zeros((len(all_user_ids), len(all_community_ids)))
    for m in memberships:
        if m["user_id"] in user_idx and m["community_id"] in comm_idx:
            matrix[user_idx[m["user_id"]], comm_idx[m["community_id"]]] = 1.0

    # Target user's join vector + joined community names (for shared_clubs)
    target_row = matrix[user_idx[target_user_id]] if target_user_id in user_idx else None
    comm_id_by_idx = {i: cid for cid, i in comm_idx.items()}
    comm_name_by_id = {c["community_id"]: c["community_name"] for c in communities}

    results = []
    for other in users:
        other_id = other["user_id"]
        if other_id == target_user_id:
            continue

        # Skip users whose username matches an excluded prefix (e.g. smoke test users)
        other_username = other.get("username", "")
        if any(other_username.startswith(p) for p in exclude_prefixes):
            continue

        # --- Interest similarity (Jaccard) ---
        other_interests = set(other.get("tags", []))
        shared_interests = target_interests & other_interests
        union = target_interests | other_interests
        interest_sim = len(shared_interests) / len(union) if union else 0.0

        # --- Join similarity (cosine) ---
        join_sim = 0.0
        shared_clubs: list[str] = []
        if target_row is not None and other_id in user_idx:
            other_row = matrix[user_idx[other_id]]
            if np.any(target_row) and np.any(other_row):
                join_sim = float(1 - cosine(target_row, other_row))
                # Find which communities they both joined
                both_joined = np.where((target_row > 0) & (other_row > 0))[0]
                shared_clubs = [
                    comm_name_by_id[comm_id_by_idx[i]] for i in both_joined
                ]

        # Combine: 50/50 blend, but skip pairs with zero similarity entirely
        overall = 0.5 * interest_sim + 0.5 * join_sim
        if overall == 0.0:
            continue

        results.append({
            "user_id": other_id,
            "username": other.get("username", f"user{other_id}"),
            "similarity": round(overall, 3),
            "interest_similarity": round(interest_sim, 3),
            "join_similarity": round(join_sim, 3),
            "shared_interests": sorted(shared_interests),
            "shared_clubs": shared_clubs,
        })

    # Sort by overall similarity, descending
    results.sort(key=lambda r: r["similarity"], reverse=True)
    return results[:top_k]
