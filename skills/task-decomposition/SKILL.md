---
name: task-decomposition
description: 'Use this skill FIRST for any non-trivial or multi-step task. Whenever the user asks to implement, build, migrate, refactor, integrate, set up, or review something that spans multiple files, modules, or systems, load this skill before starting any work. It provides a structured 6-phase workflow to decompose complexity, avoid rework, and ensure nothing is missed. Triggers include: "implement", "build", "migrate", "refactor end-to-end", "integrate", "review this module end-to-end", "audit the full feature", "what needs to be improved", "set up from scratch", "plan this feature", "break this down", "complex task", "multi-step", "large change". When in doubt about scope or approach, use this skill first before anything else.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Task Decomposition

Structured 6-phase workflow for multi-step tasks.
For single-file edits, run phases 0, 1, 3, 4 only.

---

## Phases

```text
PHASE 0 -  Clarify & Scope
PHASE 1 -  Plan & Decompose
PHASE 2 -  Scaffold & Setup     (skip if environment already runs)
PHASE 3 -  Implement            (one sub-task at a time)
PHASE 4 -  Test & Validate
PHASE 5 -  Review & Integrate
PHASE 6 -  Document & Hand-off  (skip if no public interface changed)
```

See `references/phases.md` for full phase descriptions, gates, and progress report format.
See `assets/templates.md` for scope document, task tree, progress report, and milestone templates.

---

## Cross-Skill Delegation

| When you encounter...                           | Read this skill      |
| ----------------------------------------------- | -------------------- |
| Writing or reviewing any code                   | `code-style`         |
| Writing or reviewing tests                      | `testing`            |
| Designing or modifying an API                   | `api-conventions`    |
| Writing or updating docs                        | `documentation`      |
| Designing schema, ERD, or system plan           | `planning`           |
| Writing PRD, SDD, user stories, or requirements | `sdlc-documentation` |
| A bug or unexpected failure                     | `debugging`          |
| Integrating an LLM or AI service                | `ai-integration`     |

---

## Hard Rules

```text
Do not start implementation without completing Phase 0 and 1
   Why: Phases 0-1 (clarify and plan) catch scope ambiguity, missing requirements, and wrong assumptions. Skipping them means rework -  often 2-3x the original estimate.

Do not skip tests because "the code is simple"
   Why: "Simple" code is often the most-touched code (utilities, helpers, config). Untested simple code breaks silently and wastes more debugging time than writing the test did.

Do not proceed past a blocker -  surface it and wait
   Why: Making assumptions about a blocker leads to code that must be rewritten when the blocker is resolved. Surface it in a focused question and wait for a response.

Do not write code for a sub-task without reading the relevant skill first
   Why: Skills contain project-specific conventions, edge cases, and patterns. Code written without loading the skill will likely violate conventions and require review rework.

Always run phases 0, 1, 3, 4 at minimum, even for small tasks
   Why: These four phases catch scope issues, plan the approach, implement, and verify. Omitting any one of them increases the risk of incomplete or incorrect work.

Tasks > 1 day or spanning > 3 systems: split into milestones
   Why: Large tasks without milestones cannot be tracked, blocked tasks are invisible, and partial progress is lost. Milestones give clear checkpoints for status and review.
```
