import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/dashboard/pretty
 *
 * Visual admin dashboard showing the full state of the system.
 * Open: http://localhost:3000/api/admin/dashboard/pretty
 */
export async function GET() {
  const [users, communities] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        interests: { select: { name: true } },
        memberships: {
          select: {
            community: { select: { name: true } },
            joinedAt: true,
          },
          orderBy: { joinedAt: "desc" },
        },
        recommendations: {
          where: { score: { gt: 0 } },
          select: {
            community: { select: { name: true, tags: { select: { name: true } } } },
            score: true,
            contentScore: true,
            collabScore: true,
          },
          orderBy: { score: "desc" },
          take: 5,
        },
      },
      orderBy: { id: "desc" },
    }),
    prisma.community.findMany({
      select: {
        id: true,
        name: true,
        tags: { select: { name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Filter out smoke test users
  const realUsers = users.filter((u) => !u.username.startsWith("smoke_"));
  const seedUsers = realUsers.filter((u) => u.id <= 12);
  const signedUpUsers = realUsers.filter((u) => u.id > 12);

  function userCard(u: typeof users[0]) {
    const interests = u.interests.map((t) => t.name);
    const joined = u.memberships.map((m) => m.community.name);

    const recsHtml = u.recommendations.length === 0
      ? `<p class="muted">No recommendations yet</p>`
      : u.recommendations
          .map((r) => {
            const communityTags = r.community.tags.map((t) => t.name);
            const matching = communityTags.filter((t) => interests.includes(t));
            const matchBadge = matching.length > 0
              ? `<span class="match">matched: ${matching.join(", ")}</span>`
              : `<span class="popularity">popularity-based</span>`;

            // Score bar width
            const pct = Math.round(r.score * 100);

            return `<div class="rec-row">
              <div class="rec-bar" style="width:${Math.max(pct, 8)}%"></div>
              <div class="rec-info">
                <strong>${r.community.name}</strong> <span class="score">${pct}% match</span>
                ${matchBadge}
              </div>
            </div>`;
          })
          .join("");

    const searchText = [u.username, ...interests, ...joined].join(' ');

    return `<div class="user-card" data-search="${searchText.replace(/"/g, '')}">
      <div class="user-header">
        <div>
          <span class="user-id">#${u.id}</span>
          <span class="user-name">${u.username}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-label">Interests</div>
        <div class="tags">
          ${interests.length > 0
            ? interests.map((t) => `<span class="tag">${t}</span>`).join("")
            : `<span class="muted">None selected</span>`}
        </div>
      </div>

      <div class="section">
        <div class="section-label">Joined Clubs</div>
        <div class="tags">
          ${joined.length > 0
            ? joined.map((c) => `<span class="tag joined">${c}</span>`).join("")
            : `<span class="muted">Hasn't joined any clubs yet</span>`}
        </div>
      </div>

      <div class="section">
        <div class="section-label">Top 5 Recommended Clubs</div>
        <div class="recs">${recsHtml}</div>
      </div>
    </div>`;
  }

  // Community table grouped by member count
  const commRows = communities
    .sort((a, b) => b._count.members - a._count.members)
    .map(
      (c) => `<tr>
        <td>${c.id}</td>
        <td><strong>${c.name}</strong></td>
        <td>${c.tags.map((t) => `<span class="tag sm">${t.name}</span>`).join(" ")}</td>
        <td class="center">${c._count.members}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head>
<title>Admin Dashboard</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 1100px; margin: 0 auto; padding: 20px 24px; background: #f4f5f7; color: #1a1a1a; }
  h1 { font-size: 22px; color: #1a1a1a; border-bottom: 3px solid #e96d2b; padding-bottom: 8px; margin-bottom: 4px; }
  h1 span { color: #e96d2b; }
  .subtitle { color: #888; font-size: 13px; margin-bottom: 24px; }
  .subtitle a { color: #e96d2b; }
  h2 { font-size: 16px; color: #444; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }

  /* Summary */
  .summary { display: flex; gap: 12px; margin: 20px 0; }
  .stat { background: white; padding: 14px 20px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-align: center; flex: 1; }
  .stat .num { font-size: 26px; font-weight: 700; color: #e96d2b; }
  .stat .label { font-size: 11px; color: #999; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* User cards */
  .user-card { background: white; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .user-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .user-id { color: #bbb; font-size: 12px; margin-right: 6px; }
  .user-name { font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 10px; }
  .section-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { display: inline-block; background: #eef1f5; color: #555; padding: 3px 10px; border-radius: 14px; font-size: 11px; }
  .tag.joined { background: #d4edda; color: #155724; }
  .tag.sm { font-size: 10px; padding: 2px 7px; }
  .muted { color: #bbb; font-size: 12px; font-style: italic; }

  /* Recommendation bars */
  .recs { display: flex; flex-direction: column; gap: 6px; }
  .rec-row { position: relative; background: #f8f9fa; border-radius: 6px; overflow: hidden; min-height: 32px; }
  .rec-bar { position: absolute; top: 0; left: 0; bottom: 0; background: linear-gradient(90deg, #e96d2b22, #e96d2b33); border-radius: 6px; }
  .rec-info { position: relative; padding: 6px 10px; font-size: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .rec-info strong { font-size: 12px; }
  .score { color: #e96d2b; font-weight: 600; font-size: 11px; }
  .match { background: #d4edda; color: #155724; padding: 1px 6px; border-radius: 8px; font-size: 10px; }
  .popularity { background: #fff3cd; color: #856404; padding: 1px 6px; border-radius: 8px; font-size: 10px; }

  /* Table */
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin: 8px 0 24px; }
  th { background: #2d3748; color: white; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 6px 12px; border-top: 1px solid #f0f0f0; font-size: 12px; }
  td.center { text-align: center; }
  tr:hover td { background: #fafbfc; }

  /* Collapsible */
  details { margin-bottom: 8px; }
  summary { cursor: pointer; font-size: 14px; font-weight: 600; color: #555; padding: 4px 0; }

  /* Search */
  .search-box {
    width: 100%;
    padding: 8px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 13px;
    font-family: inherit;
    margin: 8px 0 12px;
    outline: none;
    transition: border-color 0.2s;
  }
  .search-box:focus { border-color: #e96d2b; }
  .hidden { display: none !important; }

  /* User similarity explorer */
  .sim-controls { display: flex; gap: 10px; align-items: center; margin: 10px 0 16px; flex-wrap: wrap; }
  .sim-controls label { font-size: 12px; color: #666; font-weight: 600; }
  .sim-controls select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; font-family: inherit; background: white; cursor: pointer; }
  .sim-controls select:focus { outline: none; border-color: #e96d2b; }
  .sim-results { display: flex; flex-direction: column; gap: 8px; min-height: 40px; }
  .sim-empty { color: #bbb; font-size: 13px; font-style: italic; text-align: center; padding: 20px; }
  .sim-loading { color: #e96d2b; font-size: 13px; text-align: center; padding: 20px; }
  .sim-row { background: white; border-radius: 10px; padding: 12px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); position: relative; overflow: hidden; }
  .sim-bar { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, #e96d2b18, #e96d2b08); }
  .sim-content { position: relative; display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
  .sim-who { flex: 0 0 auto; min-width: 140px; }
  .sim-who strong { font-size: 13px; color: #1a1a1a; display: block; }
  .sim-who .sim-id { font-size: 10px; color: #bbb; }
  .sim-score { flex: 0 0 auto; text-align: right; min-width: 90px; }
  .sim-score .pct { font-size: 18px; font-weight: 700; color: #e96d2b; }
  .sim-score .label { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; }
  .sim-breakdown { flex: 1 1 300px; display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #555; min-width: 260px; }
  .sim-breakdown .split { display: flex; gap: 12px; }
  .sim-breakdown .split span { background: #f4f5f7; padding: 2px 8px; border-radius: 10px; }
  .sim-shared { display: flex; flex-wrap: wrap; gap: 3px; }
  .sim-shared .chip { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: #eef1f5; color: #555; }
  .sim-shared .chip.tag-match { background: #fde5d3; color: #b45215; }
  .sim-shared .chip.club-match { background: #d4edda; color: #155724; }

  /* Help panel explaining what the numbers mean */
  .help-panel {
    background: #fff8f2;
    border: 1px solid #fde5d3;
    border-left: 4px solid #e96d2b;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 8px 0 16px;
    font-size: 12px;
    color: #4a4a4a;
    line-height: 1.6;
  }
  .help-panel summary {
    cursor: pointer;
    font-weight: 600;
    color: #b45215;
    font-size: 13px;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .help-panel summary::before {
    content: "?";
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #e96d2b;
    color: white;
    font-size: 11px;
    font-weight: 700;
  }
  .help-panel[open] summary::before { content: "×"; font-size: 14px; }
  .help-panel .help-body { margin-top: 10px; }
  .help-panel h4 {
    margin: 10px 0 4px;
    font-size: 12px;
    color: #1a1a1a;
    font-weight: 700;
  }
  .help-panel h4:first-child { margin-top: 0; }
  .help-panel .math {
    background: #fff;
    border: 1px dashed #fde5d3;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: ui-monospace, Menlo, monospace;
    font-size: 11px;
    margin: 4px 0;
    display: inline-block;
  }
  .help-panel ul { margin: 4px 0 0 16px; padding: 0; }
  .help-panel li { margin: 2px 0; }
  .help-panel .legend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 10px;
  }
  .help-panel .legend-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }
  .legend-tag { background: #fde5d3; }
  .legend-club { background: #d4edda; }

  /* Tooltips on breakdown labels */
  .sim-tip { cursor: help; border-bottom: 1px dotted #999; }
</style>
<script>
function filterCards(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    const cards = container.querySelectorAll('[data-search]');
    cards.forEach(card => {
      const text = card.getAttribute('data-search').toLowerCase();
      card.classList.toggle('hidden', q !== '' && !text.includes(q));
    });
  });
}

function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.classList.toggle('hidden', q !== '' && !text.includes(q));
    });
  });
}

async function loadSimilarUsers(userId) {
  const results = document.getElementById('sim-results');
  if (!userId) {
    results.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'sim-empty';
    empty.textContent = 'Pick a user to see who the ML model considers most similar.';
    results.appendChild(empty);
    return;
  }
  results.textContent = '';
  const loading = document.createElement('div');
  loading.className = 'sim-loading';
  loading.textContent = 'Computing similarities...';
  results.appendChild(loading);

  try {
    const res = await fetch('/api/user/similar?userId=' + encodeURIComponent(userId) + '&topK=10');
    if (!res.ok) {
      results.textContent = '';
      const err = document.createElement('div');
      err.className = 'sim-empty';
      err.textContent = 'Failed to load similarities. Is the ML engine running?';
      results.appendChild(err);
      return;
    }
    const data = await res.json();
    const similar = data.similar_users || [];

    results.textContent = '';
    if (similar.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sim-empty';
      empty.textContent = 'No similar users found. This user has no overlapping interests or joined clubs with anyone.';
      results.appendChild(empty);
      return;
    }

    similar.forEach(function(s) {
      const pct = Math.round(s.similarity * 100);
      const interestPct = Math.round(s.interest_similarity * 100);
      const joinPct = Math.round(s.join_similarity * 100);

      const row = document.createElement('div');
      row.className = 'sim-row';

      const bar = document.createElement('div');
      bar.className = 'sim-bar';
      bar.style.width = Math.max(pct, 8) + '%';
      row.appendChild(bar);

      const content = document.createElement('div');
      content.className = 'sim-content';

      // Who
      const who = document.createElement('div');
      who.className = 'sim-who';
      const idSpan = document.createElement('span');
      idSpan.className = 'sim-id';
      idSpan.textContent = '#' + s.user_id;
      const nameStrong = document.createElement('strong');
      nameStrong.textContent = s.username;
      who.appendChild(idSpan);
      who.appendChild(nameStrong);
      content.appendChild(who);

      // Breakdown
      const breakdown = document.createElement('div');
      breakdown.className = 'sim-breakdown';
      const split = document.createElement('div');
      split.className = 'split';
      const iSpan = document.createElement('span');
      iSpan.className = 'sim-tip';
      iSpan.title = 'Jaccard similarity on interest tags: shared tags divided by all unique tags combined. Measures stated preferences.';
      iSpan.textContent = 'Interest: ' + interestPct + '%';
      const jSpan = document.createElement('span');
      jSpan.className = 'sim-tip';
      jSpan.title = 'Cosine similarity on club membership vectors. Measures actual joined-club overlap — revealed behavior.';
      jSpan.textContent = 'Join: ' + joinPct + '%';
      split.appendChild(iSpan);
      split.appendChild(jSpan);
      breakdown.appendChild(split);

      const shared = document.createElement('div');
      shared.className = 'sim-shared';
      const tags = s.shared_interests || [];
      const clubs = s.shared_clubs || [];
      if (tags.length === 0 && clubs.length === 0) {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = 'no direct overlap';
        shared.appendChild(chip);
      } else {
        tags.forEach(function(t) {
          const chip = document.createElement('span');
          chip.className = 'chip tag-match';
          chip.textContent = t;
          shared.appendChild(chip);
        });
        clubs.forEach(function(c) {
          const chip = document.createElement('span');
          chip.className = 'chip club-match';
          chip.textContent = c;
          shared.appendChild(chip);
        });
      }
      breakdown.appendChild(shared);
      content.appendChild(breakdown);

      // Score
      const score = document.createElement('div');
      score.className = 'sim-score';
      score.title = '50/50 blend of interest and join similarity. Higher = the ML model thinks these users will like the same recommendations.';
      const pctDiv = document.createElement('div');
      pctDiv.className = 'pct';
      pctDiv.textContent = pct + '%';
      const labelDiv = document.createElement('div');
      labelDiv.className = 'label sim-tip';
      labelDiv.textContent = 'overall';
      score.appendChild(pctDiv);
      score.appendChild(labelDiv);
      content.appendChild(score);

      row.appendChild(content);
      results.appendChild(row);
    });
  } catch (e) {
    results.textContent = '';
    const err = document.createElement('div');
    err.className = 'sim-empty';
    err.textContent = 'Error: ' + e.message;
    results.appendChild(err);
  }
}

async function loadSerendipityPicks(userId) {
  const container = document.getElementById('sim-picks');
  if (!container) return;

  if (!userId) {
    container.textContent = '';
    return;
  }

  container.textContent = '';
  const loading = document.createElement('div');
  loading.className = 'sim-loading';
  loading.textContent = 'Computing serendipity picks...';
  container.appendChild(loading);

  try {
    const res = await fetch('/api/community/explore?userId=' + encodeURIComponent(userId) + '&topK=5');
    if (!res.ok) {
      container.textContent = '';
      const err = document.createElement('div');
      err.className = 'sim-empty';
      err.textContent = 'Failed to load serendipity picks.';
      container.appendChild(err);
      return;
    }

    const picks = await res.json();
    container.textContent = '';

    if (!Array.isArray(picks) || picks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'sim-empty';
      empty.textContent = 'No serendipity picks — this user has no similar peers who joined clubs they haven\\'t.';
      container.appendChild(empty);
      return;
    }

    picks.forEach(function(p) {
      const pct = Math.round((p.score || 0) * 100);

      const row = document.createElement('div');
      row.className = 'sim-row';

      const bar = document.createElement('div');
      bar.className = 'sim-bar';
      bar.style.width = Math.max(pct, 8) + '%';
      row.appendChild(bar);

      const content = document.createElement('div');
      content.className = 'sim-content';

      // Club name
      const who = document.createElement('div');
      who.className = 'sim-who';
      const clubStrong = document.createElement('strong');
      clubStrong.textContent = p.name;
      who.appendChild(clubStrong);
      content.appendChild(who);

      // Breakdown: reason + endorser chips
      const breakdown = document.createElement('div');
      breakdown.className = 'sim-breakdown';

      if (p.reason) {
        const reasonDiv = document.createElement('div');
        reasonDiv.style.fontStyle = 'italic';
        reasonDiv.style.color = '#666';
        reasonDiv.textContent = p.reason;
        breakdown.appendChild(reasonDiv);
      }

      const endorsers = p.endorsedBy || [];
      if (endorsers.length > 0) {
        const shared = document.createElement('div');
        shared.className = 'sim-shared';
        endorsers.slice(0, 4).forEach(function(e) {
          const chip = document.createElement('span');
          chip.className = 'chip tag-match';
          chip.textContent = e.username + ' (' + Math.round(e.similarity * 100) + '%)';
          shared.appendChild(chip);
        });
        breakdown.appendChild(shared);
      }

      content.appendChild(breakdown);

      // Score
      const score = document.createElement('div');
      score.className = 'sim-score';
      score.title = 'Serendipity score: sum of peer similarity values, normalized. Higher = more similar users joined this club.';
      const pctDiv = document.createElement('div');
      pctDiv.className = 'pct';
      pctDiv.textContent = pct + '%';
      const labelDiv = document.createElement('div');
      labelDiv.className = 'label';
      labelDiv.textContent = 'strength';
      score.appendChild(pctDiv);
      score.appendChild(labelDiv);
      content.appendChild(score);

      row.appendChild(content);
      container.appendChild(row);
    });
  } catch (e) {
    container.textContent = '';
    const err = document.createElement('div');
    err.className = 'sim-empty';
    err.textContent = 'Error: ' + e.message;
    container.appendChild(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  filterCards('search-signup', 'signup-cards');
  filterCards('search-seed', 'seed-cards');
  filterTable('search-communities', 'communities-table');

  const simSelect = document.getElementById('sim-user');
  if (simSelect) {
    simSelect.addEventListener('change', (e) => {
      loadSimilarUsers(e.target.value);
      loadSerendipityPicks(e.target.value);
    });
  }
});
</script>
</head><body>

<h1>Canvas<span>Communities</span> Dashboard</h1>
<p class="subtitle">Live database snapshot &middot; <a href="/api/admin/dashboard">JSON API</a></p>

<div class="summary">
  <div class="stat"><div class="num">${signedUpUsers.length}</div><div class="label">Signed Up Users</div></div>
  <div class="stat"><div class="num">${communities.length}</div><div class="label">Communities</div></div>
  <div class="stat"><div class="num">${users.reduce((n, u) => n + u.memberships.length, 0)}</div><div class="label">Total Joins</div></div>
  <div class="stat"><div class="num">${users.reduce((n, u) => n + u.interests.length, 0)}</div><div class="label">Total Interests</div></div>
</div>

<h2>User Similarity Explorer</h2>
<p class="subtitle" style="margin-top:-8px">See how the ML model connects users based on shared interests and joined clubs.</p>

<details class="help-panel">
  <summary>How to read this</summary>
  <div class="help-body">
    <p>
      This tool shows how the recommendation engine decides which users are similar to each other.
      Pick a user above and it will rank the top 10 most similar people, with a full breakdown of
      <em>why</em> they're considered similar.
    </p>

    <h4>Overall similarity</h4>
    <p>
      The big orange percentage on the right. It's a 50/50 blend of the two signals below.
      Higher means the model thinks these users will like the same clubs.
    </p>
    <div class="math">overall = 0.5 × interest_similarity + 0.5 × join_similarity</div>

    <h4>Interest similarity (Jaccard)</h4>
    <p>
      Measures how much the two users' <strong>stated interests</strong> overlap. This is based on
      the tags they picked during onboarding.
    </p>
    <div class="math">interest = shared_tags ÷ all_unique_tags_combined</div>
    <p>
      Example: User A picks <code>{Law, Biology}</code>, User B picks <code>{Law, Chemistry, Biology}</code>.
      They share <code>{Law, Biology}</code> (2 tags) out of <code>{Law, Biology, Chemistry}</code> (3 total) =
      <strong>67% interest similarity</strong>.
    </p>

    <h4>Join similarity (Cosine)</h4>
    <p>
      Measures how much the two users' <strong>actual club memberships</strong> overlap. Each user has a
      vector across all clubs (1 = joined, 0 = not joined), and cosine similarity measures how
      closely those vectors point in the same direction.
    </p>
    <div class="math">join = cosine_similarity(userA_join_vector, userB_join_vector)</div>
    <p>
      Think of this as "what they actually do" vs. what they <em>say</em> they like. Join similarity
      is usually more predictive, but it doesn't exist for brand-new users who haven't joined anything yet.
    </p>

    <h4>Shared overlap chips</h4>
    <p>
      <span class="legend"><span class="legend-swatch legend-tag"></span>Orange chips</span>
      = shared interest tags (the reason for interest similarity).
      <br />
      <span class="legend"><span class="legend-swatch legend-club"></span>Green chips</span>
      = shared joined clubs (the reason for join similarity).
    </p>

    <h4>Why both matter</h4>
    <ul>
      <li><strong>High interest, low join:</strong> users say they like the same things but haven't acted on it yet — the cold-start case.</li>
      <li><strong>Low interest, high join:</strong> users' tags don't reflect their actual behavior — possibly a sign the onboarding taxonomy is incomplete.</li>
      <li><strong>High both:</strong> strong signal — these users are likely to enjoy the same recommendations.</li>
    </ul>
  </div>
</details>

<div class="sim-controls">
  <label for="sim-user">Target user:</label>
  <select id="sim-user">
    <option value="">— pick a user —</option>
    ${[...signedUpUsers, ...seedUsers]
      .map(
        (u) =>
          `<option value="${u.id}">#${u.id} ${u.username.replace(/"/g, "")}${
            u.interests.length > 0
              ? ` — ${u.interests.map((t) => t.name).join(", ")}`
              : ""
          }</option>`
      )
      .join("")}
  </select>
</div>
<div id="sim-results" class="sim-results">
  <div class="sim-empty">Pick a user to see who the ML model considers most similar.</div>
</div>

<h3 style="font-size: 14px; color: #666; margin: 24px 0 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
  Serendipity picks for this user
</h3>
<p class="subtitle" style="margin: 0 0 10px;">
  Clubs the similar users above joined that this user hasn't — powers the "You might also like" row on /discovery.
</p>
<div id="sim-picks" class="sim-results"></div>

<h2>Users &amp; Their Recommendations</h2>

<details class="help-panel">
  <summary>How to read user cards</summary>
  <div class="help-body">
    <p>Each card shows one user and what the ML engine recommends for them.</p>
    <h4>Interests</h4>
    <p>Grey chips — tags the user picked during onboarding.</p>
    <h4>Joined Clubs</h4>
    <p>Green chips — clubs the user has actually joined (counts as strong signal for collaborative filtering).</p>
    <h4>Top 5 Recommended Clubs</h4>
    <p>Ranked by the hybrid score. Each row shows a percentage match and <em>why</em> it was recommended:</p>
    <ul>
      <li><span class="match">matched: Biology</span> — content-based: the club's tags overlap with the user's interests.</li>
      <li><span class="popularity">popularity-based</span> — the club ranks high because many users joined it (fallback when content/collab signals are weak).</li>
    </ul>
    <p>
      The percentage is the final hybrid score (out of 100). Scores below 10% mean the engine is
      mostly guessing via popularity; scores above 20% are strong matches.
    </p>
  </div>
</details>

<details open>
  <summary>Signed Up Users (${signedUpUsers.length})</summary>
  <input type="search" id="search-signup" class="search-box" placeholder="Search by username, interest, or club...">
  <div id="signup-cards">
    ${signedUpUsers.length === 0 ? '<p class="muted">No users have signed up yet</p>' : signedUpUsers.map(userCard).join("")}
  </div>
</details>

<details>
  <summary>Seed Users (${seedUsers.length})</summary>
  <input type="search" id="search-seed" class="search-box" placeholder="Search by username, interest, or club...">
  <div id="seed-cards">
    ${seedUsers.map(userCard).join("")}
  </div>
</details>

<h2>All Communities (${communities.length})</h2>
<input type="search" id="search-communities" class="search-box" placeholder="Search by name or tag...">
<table id="communities-table">
  <thead><tr><th>ID</th><th>Name</th><th>Tags</th><th>Members</th></tr></thead>
  <tbody>${commRows}</tbody>
</table>

</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
