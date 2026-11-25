---
name: task-decomposition
description: 'Use this skill FIRST for any non-trivial or multi-step task. Whenever the user asks to implement, build, migrate, refactor, integrate, set up, or review something that spans multiple files, modules, or systems, load this skill before starting any work. It provides a structured 6-phase workflow to decompose complexity, avoid rework, and track progress in the conversation. Triggers include: "implement", "build", "migrate", "refactor end-to-end", "integrate", "review this module end-to-end", "audit the full feature", "what needs to be improved", "set up from scratch", "plan this feature", "break this down", "complex task", "multi-step", "large change", "plan tasks". When in doubt about scope or approach, use this skill first before anything else.'
license: MIT
metadata:
  version: "3.0.0"
  author: thomiOmi
---

# Task Decomposition

Structured 6-phase workflow for multi-step work. Keep the live task list in the conversation; mirror durable items in the project's issue tracker when one exists. Do not create a project-local task file.

For single-file edits, run phases 0, 1, 3, 4 only.

---

## Task State

For multi-step work, keep a compact state block in the conversation:

```markdown
Active
- [ ] Task title - context, owner, and next action

Waiting On
- [ ] Item waiting on - dependency or user input needed

Done
- [x] Completed task title
```

### Conventions

- One line per task; include the owner or module context.
- Mark completed tasks with `[x]` and keep them in the Done list until the final response.
- When the project has an issue tracker, create or update issues for durable backlog items; do not invent a parallel file format.

---

## Workflow Phases

```text
PHASE 0 - Clarify & Scope
PHASE 1 - Plan & Decompose (ordered subtasks with dependencies)
PHASE 2 - Scaffold & Setup     (skip if environment already runs)
PHASE 3 - Implement            (one sub-task at a time)
PHASE 4 - Test & Validate
PHASE 5 - Review & Integrate
PHASE 6 - Document & Hand-off  (skip if no public interface changed)
```

See `references/phases.md` for full phase descriptions, gates, and progress report format.
See `assets/templates.md` for scope document, task tree, progress report, and milestone templates.

---

## Cross-Skill Delegation

When a domain skill is available, load it. If it cannot be loaded, use the inline fallback below and state in the final response which skill was unavailable.

| When you encounter...                           | Skill        | Inline fallback |
| ----------------------------------------------- | ------------ | --------------- |
| Writing or reviewing any code                   | `code-style` | Follow existing naming and structure; no debug statements |
| Writing or reviewing tests                      | `testing`    | Test first, then implement, then verify |
| Designing or modifying an API                   | `api-conventions` | Keep resource names and error responses consistent |
| Writing or updating docs                        | `documentation` | Update docs when public behavior changes |
| Designing schema, ERD, or system plan           | `planning`   | Sketch inputs, outputs, and boundaries before coding |
| Writing PRD, SDD, user stories, or requirements | `sdlc-documentation` | State goal, users, scope, and acceptance criteria |
| A bug or unexpected failure                     | `debugging`  | Reproduce before fixing; verify the fix |
| Integrating an LLM or AI service                | `ai-integration` | Validate untrusted output and handle rate limits |

---

## Hard Rules

```text
Do not start implementation without completing Phase 0 and 1
   Why: Phases 0-1 (clarify and plan) catch scope ambiguity, missing requirements, and wrong assumptions. Skipping them means rework.

Keep the live task state in the conversation
   Why: An explicit state block makes progress and blockers visible to the user and keeps the next action clear.

Do not skip tests because "the code is simple"
   Why: "Simple" code is often the most-touched code. Untested helpers break silently.

Do not proceed past a blocker - surface it and wait
   Why: Making assumptions about a blocker leads to code that must be rewritten. Surface it in a focused question and wait for a response.

Do not write code for a sub-task without the relevant guidance
   Why: Domain guidance carries conventions and edge cases. Work without it needs review rework. If the skill is missing, use the inline fallback and report the gap.

Always run phases 0, 1, 3, 4 at minimum, even for small tasks
   Why: These four phases catch scope issues, plan the approach, implement, and verify.
```

---

## Session Handoff

At the end of every multi-step session, state a `Continue Here` block in the conversation with:

- Current objective and scope
- Completed subtasks and their status
- Decisions made and their rationale
- Blocker, if any, with suggested resolution
- Next action and its owning subagent

Keep it under 15 lines. OpenCode's built-in compaction summarizes the session, so the handoff should be short and concrete rather than duplicated into a project file.

---

## Task Decomposition Checklist

```markdown
- [ ] Phases 0 (clarify) and 1 (plan) completed before implementation
- [ ] Subtasks are atomic and independently verifiable
- [ ] Every subtask assigned to a subagent matching its domain
- [ ] Dependencies between subtasks ordered correctly
- [ ] Live task state kept in the conversation
- [ ] Blocker surfaced and resolved before proceeding
- [ ] Verification done for each subtask before marking complete
```
