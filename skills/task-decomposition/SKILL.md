---
name: task-decomposition
description: Use this skill for any task that touches more than one file, spans multiple systems, or has unclear scope. Triggers: "implement", "build", "migrate", "refactor end-to-end", "integrate", "set up from scratch". When in doubt, use this skill first.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Task Decomposition

Structured 6-phase workflow for multi-step tasks.
For single-file edits, run phases 0, 1, 3, 4 only.

## Phase Overview

```
PHASE 0 — Clarify & Scope
PHASE 1 — Plan & Decompose
PHASE 2 — Scaffold & Setup     (skip if environment already runs)
PHASE 3 — Implement            (one sub-task at a time)
PHASE 4 — Test & Validate
PHASE 5 — Review & Integrate
PHASE 6 — Document & Hand-off  (skip if no public interface changed)
```

---

## Cross-Skill Delegation

During execution, delegate to other skills as needed — do not proceed from memory:

| When you encounter... | Read this skill |
|-----------------------|----------------|
| Writing or reviewing any code | `code-style` |
| Writing or reviewing tests | `testing` |
| Designing or modifying an API | `api-conventions` |
| Writing or updating docs | `documentation` |
| Designing schema, ERD, or system plan | `planning` |
| A bug or unexpected failure | `debugging` |
| Integrating an LLM or AI service | `ai-integration` |

Read the relevant skill file before starting that sub-task.

---

## PHASE 0 — Clarify & Scope

**Goal:** Fully understand the task before doing anything.

Required output:
```
- [ ] Problem statement in 1–2 sentences
- [ ] Confirmed assumptions
- [ ] Out-of-scope items
- [ ] Blocking questions (must be resolved before proceeding)
```

**Gate:** No blocking questions remain.

---

## PHASE 1 — Plan & Decompose

**Goal:** Break the task into ordered, actionable sub-tasks.

Sub-task sizes:
- **S** — < 30 min, single file or function
- **M** — 30 min–2 hr, multiple files
- **L** — > 2 hr → must be split into S/M before starting

Task tree format:
```
TASK: [main task name]
├── SUB-TASK 1: [description] [S]
├── SUB-TASK 2: [description] [M] — depends on 1
└── SUB-TASK 3: [description] [S] — parallel with 2
```

Required output:
```
- [ ] Ordered sub-task list with size estimates (S/M/L)
- [ ] Dependency map (what blocks what)
- [ ] Skills needed per sub-task identified
- [ ] Key risks identified
```

**Gate:** M/L tasks must be approved by user before execution starts.

---

## PHASE 2 — Scaffold & Setup

**Goal:** Foundation before core implementation.

Required output:
```
- [ ] Environment runs without errors
- [ ] Folder structure matches project conventions
- [ ] Baseline / smoke test passes
```

**Gate:** Baseline is green.

---

## PHASE 3 — Implement

**Goal:** Execute sub-tasks one by one.

Rules:
- Complete one sub-task fully before moving to the next.
- Commit or checkpoint after each sub-task.
- L-sized sub-tasks must be decomposed before starting.
- Read the relevant skill before starting each sub-task (see Cross-Skill Delegation above).

Per-sub-task checklist:
```
- [ ] Relevant skill(s) read before starting
- [ ] Implementation complete
- [ ] Docstrings on all functions, methods, classes
- [ ] Inline comments on complex / non-obvious logic
- [ ] Unit tests written
- [ ] No lint or type errors
- [ ] No regressions in other modules
- [ ] Committed with a descriptive message
```

Commit format:
```
feat(scope): short description

- change detail 1
- change detail 2

Resolves: SUB-TASK-X
```

**Gate:** Every sub-task passes its checklist before the next begins.

---

## PHASE 4 — Test & Validate

**Goal:** Confirm correctness; no regressions.

Read the `testing` skill before running this phase.

Required output:
```
- [ ] Full test suite passes
- [ ] Coverage not below baseline
- [ ] All acceptance criteria from Phase 1 met
```

**Gate:** Zero failing tests. If bugs found → read `debugging` skill, then return to Phase 3 for the affected sub-task only.

---

## PHASE 5 — Review & Integrate

**Goal:** Code is clean and ready to merge.

Checklist:
```
- [ ] No debug statements
- [ ] No hardcoded values that belong in config
- [ ] Naming consistent with codebase conventions
- [ ] All public functions/methods have docstrings
- [ ] PR description clearly written
```

**Gate:** Self-review is clean.

---

## PHASE 6 — Document & Hand-off

**Goal:** Work can be continued by another person or agent.

Read the `documentation` skill before running this phase.

Required output:
```
- [ ] Docs updated if public API or interface changed
- [ ] Work summary written
- [ ] Known issues / follow-up tasks recorded
```

---

## Progress Report Format

```
## Progress

Task: [name]
Phase: PHASE X — [name]
Status: 🟡 In Progress | ✅ Done | 🔴 Blocked

Completed:
- ✅ PHASE 0: Scope confirmed
- ✅ PHASE 1: 4 sub-tasks planned

In Progress:
- 🟡 PHASE 3: Sub-task 2/4 — [description]

Waiting:
- ⏳ PHASE 3: Sub-tasks 3, 4

Blockers:
- 🔴 [description] — needs: [what is required]
```

---

## Hard Rules

```
❌ Do not start implementation without completing Phase 0 and 1
❌ Do not skip tests because "the code is simple"
❌ Do not proceed past a blocker — surface it and wait
❌ Do not write code for a sub-task without reading the relevant skill first
✅ Always run phases 0, 1, 3, 4 at minimum, even for small tasks
```

**Tasks too large** (> 1 day or spans > 3 systems): split into milestones.
Each milestone runs its own full phase cycle.
Define the interface between milestones before execution begins.
