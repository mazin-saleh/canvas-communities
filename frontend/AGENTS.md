---
name: frontend-agent
description: Folder-specific guide for agents working in frontend only. Cross-folder rules belong in root AGENTS.md.
---

# AGENTS.md - Frontend Folder Guide

This file is intentionally scoped to frontend only.

If guidance applies beyond this folder, put it in root AGENTS.md instead.

## 1) Scope Boundary

In scope:

- frontend/\*\*

Out of scope:

- Monorepo-wide process, git policy, security baseline, and approval gates (defined in root AGENTS.md)

## 2) Folder Snapshot (Current)

Current state:

- This folder is currently a lightweight scaffold (e.g., next-env.d.ts, package-lock.json).
- No mature app/module structure is established yet.

Agent behavior for current state:

- Keep changes minimal until the folder structure and runtime responsibilities are formalized.
- When feature code is introduced, update this file with concrete architecture, ownership map, and validation gates.

## 3) Folder-Specific Rules

1. Prefer scaffold-safe edits:

- Avoid introducing broad conventions here before folder architecture exists.

2. Keep this file synced as folder evolves:

- Add sections for architecture, contracts, and commands as soon as they become real.

3. Defer shared policy upward:

- If a rule is not uniquely frontend-specific, move it to root AGENTS.md.

## 4) Context Update Protocol For This Folder

Update this file whenever frontend-specific context changes:

- New runtime/framework setup
- New command set (dev/build/test/lint)
- New folder architecture or contracts

When updating:

1. Edit relevant sections.
2. Add a new entry at top of Context Update Log.
3. If change impacts other master folders, add a handoff note to root AGENTS.md.

## 5) Context Update Log

Add newest entries at top.

- 2026-03-23 | Initial folder guide | Created folder-scoped AGENTS.md for frontend scaffold state.
