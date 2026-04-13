"""
main.py — FastAPI Endpoints
============================
Exposes the ML recommendation pipeline as HTTP endpoints.
The Next.js web platform calls these to trigger and fetch recommendations.
"""

from fastapi import FastAPI, HTTPException

import db
from recommender.training import run_for_user, run_for_all_users
from recommender.user_similarity import compute_user_similarities
from recommender.serendipity import compute_serendipity_picks

app = FastAPI()


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Basic health check — returns ok if the service is running."""
    return {"status": "ok"}


# ── Recommendation Endpoints ─────────────────────────────────────────────────

# NOTE: /recommend/all must come BEFORE /recommend/{user_id}
# Otherwise FastAPI tries to parse "all" as an integer and fails

@app.post("/recommend/all")
def compute_all_recommendations():
    """
    Batch endpoint — runs the ML pipeline for every user in the database.
    Useful for initial population after seeding or nightly refresh jobs.

    Takes longer but avoids separate POST calls per user.
    """
    try:
        results = run_for_all_users()
        return {
            "computed": True,
            "user_count": len(results),
            "results": {
                user_id: {
                    "count": len(recs),
                    "top_score": recs[0]["score"] if recs else None,
                }
                for user_id, recs in results.items()
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing batch recommendations: {e}")


@app.post("/recommend/{user_id}")
def compute_recommendations(user_id: int):
    """
    Triggers full ML pipeline for one user.
    Computes scores, writes to DB, returns results.

    Use this when you want fresh recommendations (e.g., after user updates interests).
    """
    try:
        results = run_for_user(user_id)
        return {
            "user_id": user_id,
            "computed": True,
            "recommendations": results,
        }
    except ValueError as e:
        # User not found
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Unexpected error
        raise HTTPException(status_code=500, detail=f"Error computing recommendations: {e}")


@app.get("/explore/{user_id}")
def explore_for_user(user_id: int, top_k: int = 10):
    """
    Serendipity picks — clubs that similar users joined but the target hasn't.

    Powers the "You might also like" row on the discovery page. This is the
    one recommendation signal that can reach beyond a user's stated interests,
    pulling suggestions from the social graph of similar users.

    Returns:
        {
            "user_id": 16,
            "picks": [
                {
                    "community_id": 11,
                    "community_name": "Pre-Med Alliance",
                    "score": 1.0,
                    "endorsed_by": [{"user_id": 3, "username": "carol", "similarity": 0.604}, ...],
                    "endorsement_count": 3
                },
                ...
            ]
        }
    """
    try:
        users = db.fetch_users_with_interests()
        memberships = db.fetch_memberships()
        communities = db.fetch_communities_with_tags()

        if not any(u["user_id"] == user_id for u in users):
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        picks = compute_serendipity_picks(
            target_user_id=user_id,
            users=users,
            memberships=memberships,
            communities=communities,
            top_k_picks=top_k,
        )
        return {"user_id": user_id, "picks": picks}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error computing serendipity picks: {e}"
        )


@app.get("/similar-users/{user_id}")
def get_similar_users(user_id: int, top_k: int = 10):
    """
    Returns the top-K users most similar to user_id.

    Useful for debugging the collaborative filter and showing the professor
    how the recommendation model connects users to each other. Similarity
    blends interest overlap (Jaccard) with join overlap (cosine).
    """
    try:
        users = db.fetch_users_with_interests()
        memberships = db.fetch_memberships()
        communities = db.fetch_communities_with_tags()

        # Validate target exists
        if not any(u["user_id"] == user_id for u in users):
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")

        results = compute_user_similarities(
            target_user_id=user_id,
            users=users,
            memberships=memberships,
            communities=communities,
            top_k=top_k,
        )
        return {"user_id": user_id, "similar_users": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error computing user similarities: {e}"
        )


@app.get("/recommend/{user_id}")
def get_recommendations(user_id: int):
    """
    Reads pre-computed recommendations from the database.
    Fast path — no recomputation, just returns what's stored.

    Use this for normal page loads (recommendations were already computed earlier).
    Returns computed=False if no recommendations exist yet for this user.
    """
    try:
        results = db.fetch_recommendations_for_user(user_id)
        return {
            "user_id": user_id,
            "computed": len(results) > 0,
            "recommendations": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendations: {e}")
