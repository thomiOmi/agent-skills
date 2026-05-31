---
name: task-decomposition
description: Use this skill for any task that touches more than one file, spans multiple systems, or has unclear scope. Triggers: "implement", "build", "migrate", "refactor end-to-end", "integrate", "set up from scratch". When in doubt, use this skill first.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Task Decomposition

Structured 6-phase workflow for multi-step tasks.
For single-file edits, run phases 0, 1, 3, 4 only.

## Phases

```
PHASE 0 — Clarify & Scope
PHASE 1 — Plan & Decompose
PHASE 2 — Scaffold & Setup     (skip if environment already runs)
PHASE 3 — Implement            (one sub-task at a time)
PHASE 4 — Test & Validate
PHASE 5 — Review & Integrate
PHASE 6 — Document & Hand-off  (skip if no public interface changed)
```

See `references/phases.md` for full phase descriptions, gates, and progress report format.

---

## Cross-Skill Delegation

| When you encounter... | Read this skill |
|-----------------------|----------------|
| Writing or reviewing any code | `code-style` |
| Writing or reviewing tests | `testing` |
| Designing or modifying an API | `api-conventions` |
| Writing or updating docs | `documentation` |
| Designing schema, ERD, or system plan | `planning` |
| Writing PRD, SDD, user stories, or requirements | `sdlc-documentation` |
| A bug or unexpected failure | `debugging` |
| Integrating an LLM or AI service | `ai-integration` |

---

## Hard Rules

```
❌ Do not start implementation without completing Phase 0 and 1
❌ Do not skip tests because "the code is simple"
❌ Do not proceed past a blocker — surface it and wait
❌ Do not write code for a sub-task without reading the relevant skill first
✅ Always run phases 0, 1, 3, 4 at minimum, even for small tasks
✅ Tasks > 1 day or spanning > 3 systems: split into milestones
```
