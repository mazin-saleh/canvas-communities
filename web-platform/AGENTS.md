---
name: web-platform-agent
description: Folder-specific operating guide for agents working inside web-platform only. Put cross-repo policy in root AGENTS.md.
---

# AGENTS.md - Web Platform Folder Guide

This file is intentionally scoped to web-platform only.

If guidance applies to multiple master folders, do not add it here. Add it to the root AGENTS.md instead.

## 1) Scope Boundary

In scope:

- web-platform/\*\*

Out of scope (belongs in root AGENTS.md):

- Cross-folder team policy and coding norms
- Shared Git/PR workflow for the entire monorepo
- Repo-wide security/compliance standards
- Global definition of team roles that are not folder-specific

## 2) Folder Snapshot (Current)

Technology and runtime specific to this folder:

- Next.js App Router + React + strict TypeScript
- Prisma + PostgreSQL integration for web data layer
- Tailwind + Radix UI for component styling and primitives
- Local startup and container startup both depend on this folder's package scripts and start.sh flow

Folder architecture:

- UI routes: src/app/\*\*
- API route handlers: src/app/api/\*\*/route.ts
- UI components: src/components/** and src/components/ui/**
- Auth state: src/context/AuthContext.tsx
- Domain/services: src/services/\*.ts
- Client API helper: src/lib/api.ts
- Prisma connection and generated client usage: src/lib/prisma.ts and src/generated/prisma/\*\*
- Schema source: prisma/schema.prisma

Route-group structure:

- (marketing)
- (auth)
- (onboard)
- (app)

## 3) Web-Platform-Specific Rules

1. Preserve layer boundaries inside this folder:

- API handlers map HTTP and validate inputs.
- Business/data logic belongs in src/services.

2. Keep API client and route contracts aligned in this folder:

- If route method/path/payload/response changes in src/app/api, update src/lib/api.ts in the same task.

3. Do not hand-edit generated Prisma output in this folder:

- Never manually edit src/generated/prisma/\*\*.
- Regenerate via Prisma commands.

4. Protect app flow specific to this folder:

- Changes to src/context/AuthContext.tsx or app layouts must verify login/onboarding redirects still behave correctly.

5. Prefer existing UI primitives already present in this folder:

- Reuse src/components/ui/\*\* before introducing custom one-off controls.

6. For Figma-driven UI implementation in this folder:

- Match Figma design specs as exactly as possible for visual details (corner radii, typography, spacing, color, hierarchy, and component sizing).
- Use mobile-first layout structure with flexbox and responsive scaling across phone, tablet, and desktop breakpoints.
- Only adjust for responsive fit and readability across viewport sizes; avoid changing the core visual design language.
- Prevent element crowding/sandwiching at intermediate widths by using fluid widths, max-width constraints, and breakpoint-aware spacing.

7. Modularize repeated UI into custom components:

- Any UI that is used more than once, or is expected to be used repeatedly, must be extracted into a reusable custom component.
- If something can be turned into a component while preserving design quality, it should be turned into a custom component aligned with this folder's visual language.

8. Build responsive layouts with dynamic sizing and fit-aware breakpoints:

- Use fluid sizing with explicit minimum and maximum constraints so components scale consistently across common screen ratios.
- Define breakpoints by fit and readability, not only device labels: hide, collapse, or reflow elements when they do not comfortably fit.
- iPhone layouts should be the most compact and prioritize core actions/content.
- iPad/tablet layouts should add moderate breathing room and only bring back secondary elements when they comfortably fit.
- Desktop layouts should expose full component sets while still flexing fluidly with viewport width.

## 4) Folder Ownership Map

Ownership for web-platform files only:

- src/app/\*\*: UI + API implementation
- src/app/api/\*\*: API contract and validation
- src/services/\*\*: service/data logic
- src/lib/api.ts: frontend API helper contract
- src/lib/prisma.ts and prisma/\*\*: database access/schema
- src/generated/prisma/\*\*: generated output (read-only except regeneration)

## 5) Folder Quality Gates

Minimum checks before completing work in web-platform:

- npm run lint (from web-platform)
- For API edits: validate one end-to-end path from src/lib/api.ts to src/app/api to src/services
- For schema edits: run Prisma generate and verify consumers compile
- For auth/layout edits: verify login/onboarding redirect behavior

## 6) Folder Contract Drift Watchlist (Current)

Current mismatches inside web-platform to address when touching related code:

- None currently recorded.

Rule for this file:

- If you modify one side of a mismatch, either update the other side in the same task or document intentional divergence in this section.

## 7) Local Commands For This Folder

Run from web-platform:

- npm install
- npm run dev
- npm run build
- npm run lint
- npm run test:security
- npx prisma generate
- npx prisma db push
- npx prisma db seed

Container startup sequence used by web-platform/start.sh:

- prisma db push
- prisma generate
- prisma db seed
- npm run dev

## 8) Context Update Protocol For This Folder (Mandatory)

Update this file whenever web-platform-specific context changes:

- Route endpoints/methods/payloads/responses
- Service responsibilities or layer boundaries in this folder
- Route-group structure or auth/onboarding behavior
- Prisma schema usage expectations in this folder
- Folder-local run/build/start commands

When updating:

1. Edit the relevant section above.
2. Add a new entry at top of Context Update Log.
3. If the change affects multiple master folders, also add a short handoff note under Root AGENTS Handoff Notes.

## 9) Root AGENTS Handoff Notes

Use this section to note cross-folder updates that must be reflected in root AGENTS.md.

- 2026-03-23 | Root baseline created | Root AGENTS.md now defines monorepo defaults; keep this file restricted to web-platform-specific rules.
- 2026-03-23 | Initial split decision | This file intentionally keeps only web-platform-specific guidance.

## 10) Context Update Log

Add newest entries at top.

- 2026-03-28 | Security QA integration coverage | Added route-level security integration tests for IDOR, privilege escalation, and ABAC enforcement in tests/security.integration.test.ts, plus a roster-protected member kick endpoint at src/app/api/clubs/[clubId]/members/[memberId]/kick/route.ts and npm run test:security command.

- 2026-03-28 | Frontend authz sync integration | Replaced mock role derivation with server-synced access state, gated sidebar/admin links by platform and club roles, added ABAC-aware UI controls in club-admin content, and introduced admin-request submission/review UI surfaces.

- 2026-03-27 | Role-request API baseline | Added guarded role-management APIs for club admin requests, super-admin review/approval, and club-owner role governance with audit logging under src/app/api/clubs/[clubId]/admin-requests, src/app/api/admin/requests, src/app/api/admin/requests/[requestId]/approve, and src/app/api/clubs/[clubId]/manage-roles.

- 2026-03-27 | Server-only auth guard baseline | Added DB-validated server-side authorization utility baseline in src/lib/auth-guards.ts for session validation and fail-closed RBAC/ABAC guard checks prior to route-level business logic work.

- 2026-03-26 | Club-admin RBAC shell baseline | Added mock role context + ProtectedRoute guard for club-admin routes and introduced a dedicated admin dashboard shell with role-gated navigation sections (General Info, Roster, Content, Settings).

- 2026-03-26 | Dynamic sizing + fit-based breakpoints policy | Added a rule requiring fluid min/max sizing and fit-aware responsive behavior across iPhone, iPad, and desktop.

- 2026-03-26 | Reusable custom component policy | Added a mandatory rule to extract repeated/reusable UI into modular custom components that stay consistent with web-platform design language.

- 2026-03-26 | Figma implementation fidelity + responsive policy | Added explicit web-platform rule to implement Figma visuals exactly and allow only mobile-first, flexbox-based responsive sizing adjustments to prevent layout crowding across mobile/tablet/desktop.

- 2026-03-23 | Communities payload alignment | Updated getUserCommunities service to return Community records (with tags and members) to match src/lib/api.ts user.getCommunities contract.
- 2026-03-23 | Contract drift resolved | Aligned user/join-community route to POST and user/communities route to GET with query parameter to match src/lib/api.ts contracts.
- 2026-03-23 | Scope refactor | Converted web-platform AGENTS.md to folder-only guidance and moved cross-repo intent to root AGENTS.md handoff.
