---
name: canvascommunities-root-agents
description: Monorepo-wide baseline rules for all agents. Folder AGENTS.md files may add folder-specific constraints and override root only for local conflicts.
---

# AGENTS.md - Monorepo Baseline

This file defines monorepo-wide rules for all agents in CanvasCommunities.

Policy split:

- Root AGENTS.md: cross-folder standards only.
- Folder AGENTS.md: folder-specific implementation details only.

## 1) Scope And Rule Precedence

Scope:

- Applies to the entire repository by default.

Precedence:

- Root AGENTS.md is the baseline.
- Folder AGENTS.md files append folder-specific guidance.
- If a root rule conflicts with a folder-specific rule, folder rule wins for that folder.

Current master-folder matrix:

- web-platform: has folder AGENTS.md
- frontend: has folder AGENTS.md
- ml-engine: has folder AGENTS.md

## 2) Planning And Execution Defaults

Default workflow for agents:

1. Make a concrete plan first.
2. Ask for user approval before implementation.
3. Implement tightly to the approved plan.
4. If better design options are discovered during work, propose plan adjustments before changing direction.

Execution quality principles:

- Favor modularity and simplicity.
- Avoid spaghetti code and hidden side effects.
- Prefer maintainable changes over clever shortcuts.

## 3) Approval-Gated Actions

Agents must explicitly ask before:

- Installing dependencies.
- Database schema changes or migrations.
- Deleting files.

Additional recommendation:

- If an action has high blast radius, include a warning and rollback path before execution.

## 4) Safety And Git Behavior

Safety posture:

- Potentially destructive operations are allowed only with a warning and clear justification.
- If risk is high, request explicit confirmation first.

Git behavior:

- Never auto-commit or auto-push unless the user explicitly asks.

## 5) Style, Tooling, And Verification

Source of truth:

- Use repository/tool config files as primary enforcement (eslint, tsconfig, build configs, etc.).
- AGENTS.md may add behavior guidance, but config files take precedence for formatting/linting behavior.

Verification default:

- Run full test/build checks whenever possible.
- Merge readiness standard is strict: full relevant suite should be green.

Minimum completion bar for any task:

- No newly introduced lint/type/build/test failures in changed scope.
- Contract or docs updates included when behavior changes.

## 6) Dependency Policy

Default:

- Do not add dependencies casually.

A dependency may be added only when:

- It is a clear win for performance, simplicity, maintainability, or delivery speed.
- There is codebase-consistent evidence it helps overall goals.
- The proposal is presented to the user before adoption.

## 7) Documentation And Repeat-Issue Logging Duty

Agents must update AGENTS/docs when behavior, contracts, commands, or architecture changes.
The log sections in AGENTS files are for repeat-issue prevention only.

Required pattern:

1. Update the relevant AGENTS.md section(s).
2. Add/update a repeat-issue log entry only if the issue is recurring or likely to recur.
3. If impact crosses folders, record a handoff note between root and folder AGENTS files.

## 8) Security Baseline

Monorepo-wide security expectations:

- Principle of least privilege for services, credentials, and data access.
- RBAC/RDAC discipline for privileged operations and data access decisions.
- Session expiration for authenticated contexts where applicable.
- Maintain ACID compliance expectations for data-critical changes and transactional integrity.
- Prefer simple designs when complexity does not provide clear security value.

Operational hygiene:

- Never expose secrets or credentials in code, logs, or output.
- Use environment variables and existing secret-management patterns.

## 9) Copilot Skill Compatibility Modes

For Copilot agent sessions in this repo, the names below are supported as **behavior modes** (not native tools/plugins):

- **frontend-design**: When user asks to use this skill, prioritize distinctive, production-grade UI direction with intentional typography, color system, motion, and spacing. Avoid generic template aesthetics.
- **superpowers**: When user asks to use this skill, follow a structured workflow: clarify goal, produce an actionable plan, execute in small validated steps, and include review/checkpoint discipline.
- **caveman**: When user asks to use this skill, use terse, high-density responses (minimal filler, short phrasing) while keeping technical accuracy.

Mode controls:

- Activate when user explicitly asks for one of these skill names.
- Deactivate on user request (for example: "normal mode" or "stop caveman").
- If user instructions conflict with mode style, user instructions win.
- Do not claim native tool invocation for these modes in Copilot sessions.

## 10) Root Repeat-Issue Log

Purpose: Capture only recurring or likely-recurring repo-wide issues and how to avoid them.

Add newest entries at top.

- 2026-04-13 | Compose runtime CR normalization | Updated container startup command to strip carriage-return bytes from shell script execution path, preventing CRLF parse failures across Windows/macOS/Linux worktrees.
- 2026-04-13 | Cross-platform line-ending guard | Added repository-level line-ending normalization policy so shell/env files remain LF-safe for Linux/macOS container runtimes used by the monorepo.
