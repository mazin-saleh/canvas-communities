---
name: ml-engine-agent
description: Folder-specific guide for agents working in ml-engine only. Cross-folder rules belong in root AGENTS.md.
---

# AGENTS.md - ML Engine Folder Guide

This file is intentionally scoped to ml-engine only.

If guidance applies to other folders, place it in root AGENTS.md.

## 1) Scope Boundary

In scope:

- ml-engine/\*\*

Out of scope:

- Monorepo-wide workflow, global approval gates, and shared git/security policy (root AGENTS.md)

## 2) Folder Snapshot (Current)

Technology/runtime specific to this folder:

- FastAPI service in Python
- Uvicorn runtime
- requirements.txt-based dependency management
- Docker runtime exposed on port 8000 in this folder

Current implementation:

- main.py defines health endpoint: GET /health
- Dockerfile installs requirements and runs uvicorn with reload

## 3) ML-Engine-Specific Rules

1. Keep API behavior explicit:

- Route additions must include clear request/response semantics and status handling.

2. Keep dependencies minimal and justified for this service:

- Reuse existing stack where possible before proposing new libraries.

3. Preserve runtime consistency:

- Keep Docker command and local run assumptions aligned when changing server entrypoint or port behavior.

4. Keep service simple and stable:

- Prefer straightforward endpoint/module structure unless complexity has clear benefit.

## 4) Folder Quality Gates

Minimum checks before completing work in ml-engine:

- Validate app import and startup path for main:app
- Verify /health still responds successfully after changes
- If dependencies change, confirm requirements.txt is in sync

## 5) Local Commands For This Folder

Typical local flow:

- python -m venv venv
- source venv/bin/activate
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8001

Container notes:

- Folder Dockerfile exposes 8000
- Compose may map host port differently at monorepo level

## 6) Repeat-Issue Logging Protocol For This Folder

Update this file whenever ml-engine-specific context changes:

- Endpoint contracts
- Runtime/entrypoint commands
- Folder architecture
- Dependency model

When updating:

1. Edit relevant sections.
2. Add a new entry at top of the log only for recurring or likely-recurring issues.
3. If cross-folder impact exists, add a handoff note to root AGENTS.md.

## 7) Repeat-Issue Log

Purpose: Capture only recurring or likely-recurring ml-engine issues and prevention guidance.

Add newest entries at top.

- 2026-04-13 | Schema reflection hardening | Updated DB reflection usage to avoid import-time startup failure when reflected ORM class names are unavailable before schema sync.
