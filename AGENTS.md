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

## 7) Documentation And Context Update Duty

Agents must update AGENTS/docs when behavior, contracts, commands, or architecture changes.

Required pattern:

1. Update the relevant AGENTS.md section(s).
2. Add/update a context log entry.
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

## 9) Root Context Log

Add newest entries at top.

- 2026-03-23 | Folder coverage + security wording | Added frontend/ml-engine folder AGENTS status and refined security language to RBAC/RDAC + ACID compliance expectations.
- 2026-03-23 | Initial baseline | Created monorepo-wide AGENTS rules from user-defined restrictions, habits, and conventions.
