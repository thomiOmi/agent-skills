---
name: memory-management
description: 'Use this skill when starting a session on an existing project, when resuming unfinished work, or before a session ends so no context is lost. Also load it when the conversation context grows long and needs compacting. It defines the external memory hierarchy (TASKS.md for live state, DECISIONS.md for rationale, SPEC.md and ARCHITECTURE.md for structural knowledge), a session start and end protocol, and rules for what to persist, compress, or drop. Triggers include: "continue from last session", "resume work", "pick up where we left off", "remember this", "save this decision", "write that down", "session handoff", "new session", "context is getting long", "compact the context", "what did we decide", "memory", "persistence", "handoff", "catch me up".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Memory Management

Persistent context across sessions via plain files in the repo.
The chat transcript is volatile; the file system is the only durable memory.

---

## The External Memory Hierarchy

| File                 | Holds                        | Lifetime          | Owner skill          |
| -------------------- | ---------------------------- | ----------------- | -------------------- |
| `TASKS.md`           | Live state: active work, blockers, next actions | Current effort    | `task-decomposition` |
| `DECISIONS.md`       | Decisions and their rationale | Project lifetime  | `architecture-decision` |
| `SPEC.md`            | What is being built and why  | Project lifetime  | `sdlc-documentation` |
| `ARCHITECTURE.md`    | How the system is structured | Project lifetime  | `planning`           |
| Chat transcript      | Everything else              | Session only      | nobody - assume loss |

Rules of the hierarchy:

- Live state lives in `TASKS.md`, never only in chat.
- Every non-obvious choice gets a `DECISIONS.md` entry the moment it is made.
- Structural knowledge (schemas, contracts, layouts) belongs in `SPEC.md`/`ARCHITECTURE.md`, not in prose replies.
- If a fact matters beyond this session and it is not in a file, treat it as lost.

---

## Session Start Protocol

Before doing any work in a fresh session, read in this order:

```text
1. TASKS.md          - what is in progress, what is blocked, Continue Here section
2. DECISIONS.md      - the constraints you must not re-litigate
3. SPEC.md / ARCHITECTURE.md - skim only the sections relevant to the task
4. git log --oneline -10    - what actually landed since the last session
```

Then verify claims against the working tree: files win over notes. If `TASKS.md` says "auth module in progress" but the code is already merged, update `TASKS.md` first, then continue.

Do not re-read every reference file end-to-end - progressive disclosure: read what the current task touches.

---

## Session End Protocol

Before a session ends (user says goodbye, context near limit, natural milestone), write:

```text
1. Update TASKS.md     - mark done items, move new work into Active, add "Continue Here"
2. Append DECISIONS.md - one entry per decision made this session (not yet recorded)
3. Update SPEC/ARCHITECTURE only if structure changed
```

The `Continue Here` section in `TASKS.md` is the resume point. Keep it under 15 lines:

- Current objective and scope
- Completed subtasks and status
- Decisions made and rationale (one line each, full entry in `DECISIONS.md`)
- Blocker, if any, with suggested resolution
- Next action and its owner

---

## Compaction: Keep, Compress, Drop

When context grows long, compress deliberately instead of summarizing vaguely:

| Content                    | Action                                      |
| -------------------------- | ------------------------------------------- |
| Decisions and rationale    | **Keep** - persist to `DECISIONS.md` first  |
| Open questions, blockers   | **Keep** - persist to `TASKS.md` first      |
| Step-by-step work history  | **Compress** - outcome one line, drop steps |
| Failed approaches + why    | **Compress** - keep the "why", drop logs    |
| File contents already read | **Drop** - re-read from disk when needed    |
| Secrets, tokens, credentials | **Drop** - never persist, see Hard Rules  |

Persist before compacting: a fact that only exists in the transcript is lost at compaction time.

---

## Cross-Skill Delegation

| When you encounter...                          | Read this skill          |
| ---------------------------------------------- | ------------------------ |
| Decomposing new work into tasks                | `task-decomposition`     |
| Recording an architectural trade-off           | `architecture-decision`  |
| Writing or updating a spec or PRD              | `sdlc-documentation`     |
| Diagramming structure after structural change  | `planning`               |
| Discrepancy between notes and actual behavior  | `debugging`              |

---

## Hard Rules

```text
Never persist secrets, tokens, or credentials to memory files
   Why: Memory files are committed to the repo. A leaked token in TASKS.md or DECISIONS.md is a security incident, not a note.

Files win over transcript
   Why: The transcript may be stale, truncated, or from a different branch. The working tree is the only ground truth.

Persist at decision time, not session end
   Why: Session end is unreliable (crash, context limit). A decision written when it is made can never be lost.

One source of truth per fact
   Why: Duplicated state diverges. Details live in one file; other files may link to it by name.

Verify memory before acting on it
   Why: Notes describe the past. A quick check of the code, branch, or test run prevents resuming into a fantasy.
```

---

## Memory Hygiene Checklist

```markdown
- [ ] Session started with TASKS.md, DECISIONS.md read before any work
- [ ] Claims from memory verified against the working tree
- [ ] Every decision made this session has a DECISIONS.md entry
- [ ] TASKS.md updated at every milestone, not just session end
- [ ] Continue Here section present and under 15 lines
- [ ] No secrets or credentials in any memory file
- [ ] Compressed transcript kept outcomes and rationale, dropped step logs
```

---

## References

- `references/memory-protocols.md` - file entry formats, anti-patterns (memory rot, split truth), and trust boundaries in depth
