---
name: memory-management
description: 'Use this skill when starting a session on an existing project, when resuming unfinished work, or before a session ends so no context is lost. Also load it when the conversation context grows long and needs compacting. It defines the external memory hierarchy (DECISIONS.md for rationale, SPEC.md and ARCHITECTURE.md for structural knowledge), a session start and end protocol, and rules for what to persist, compress, or drop. Triggers include: "continue from last session", "resume work", "pick up where we left off", "remember this", "save this decision", "write that down", "session handoff", "new session", "context is getting long", "compact the context", "what did we decide", "memory", "persistence", "handoff", "catch me up".'
license: MIT
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Memory Management

Persistent context across sessions via plain files in the repo and OpenCode's built-in compaction. The chat transcript is volatile; the working tree and committed files are durable memory.

---

## The External Memory Hierarchy

| Source | Holds | Lifetime | Owner skill |
| ------ | ----- | -------- | ----------- |
| `DECISIONS.md` | Decisions and their rationale | Project lifetime | `architecture-decision` |
| `SPEC.md` | What is being built and why | Project lifetime | `documentation` |
| `ARCHITECTURE.md` | How the system is structured | Project lifetime | `planning` |
| Issue tracker | Active work, blockers, next actions | Current effort | project workflow |
| Compaction summary | Session objective, next move, decisions, open work | Session continuum | OpenCode built-in |
| Chat transcript | Everything else | Session only | nobody - assume loss |

Rules of the hierarchy:

- Live state belongs in the conversation and, when durable, in the project's issue tracker. Do not create a project-local task file.
- Every non-obvious choice gets a `DECISIONS.md` entry the moment it is made.
- Structural knowledge (schemas, contracts, layouts) belongs in `SPEC.md`/`ARCHITECTURE.md`, not in prose replies.
- If a fact matters beyond this session and it is not in a file, treat it as lost.

---

## Session Start Protocol

Before doing any work in a fresh session, read in this order:

```text
1. DECISIONS.md      - the constraints you must not re-litigate
2. SPEC.md / ARCHITECTURE.md - skim only the sections relevant to the task
3. git log --oneline -10    - what actually landed since the last session
4. git status               - uncommitted work and current branch
```

Then verify claims against the working tree: files win over notes. If a note says "auth module in progress" but the code is already merged, correct the note or tracker first, then continue.

Do not re-read every reference file end-to-end. Read what the current task touches.

---

## Session End Protocol

Before a session ends (user says goodbye, context near limit, natural milestone):

```text
1. Append DECISIONS.md - one entry per decision made this session (not yet recorded)
2. Update SPEC/ARCHITECTURE only if structure changed
3. Update the issue tracker with completed, blocked, and next items
```

State a `Continue Here` block in the conversation, under 15 lines:

- Current objective and scope
- Completed subtasks and status
- Decisions made and rationale (one line each, full entry in `DECISIONS.md`)
- Blocker, if any, with suggested resolution
- Next action and its owner

OpenCode's compaction summarizes the session with an objective and a next move; keep the handoff short and concrete instead of duplicating it into a project file.

---

## Compaction: Keep, Compress, Drop

When context grows long, compress deliberately instead of summarizing vaguely:

| Content | Action |
| ------- | ------ |
| Decisions and rationale | **Keep** - persist to `DECISIONS.md` first |
| Open questions, blockers | **Keep** - state in the conversation and the tracker |
| Step-by-step work history | **Compress** - outcome one line, drop steps |
| Failed approaches + why | **Compress** - keep the "why", drop logs |
| File contents already read | **Drop** - re-read from disk when needed |
| Secrets, tokens, credentials | **Drop** - never persist, see Hard Rules |

Persist before compacting: a fact that only exists in the transcript is lost at compaction time. Note that compaction is lossy and cannot create room when fixed instructions dominate the context window.

---

## Cross-Skill Delegation

When a domain skill is available, load it. If it cannot be loaded, use the relevant inline fallback and state the gap in the final response.

| When you encounter... | Skill |
| --------------------- | ----- |
| Decomposing new work into tasks | `task-decomposition` |
| Recording an architectural trade-off | `architecture-decision` |
| Writing or updating a spec or PRD | `documentation` |
| Diagramming structure after structural change | `planning` |
| Discrepancy between notes and actual behavior | `debugging` |

---

## Hard Rules

```text
Never persist secrets, tokens, or credentials to memory files
   Why: Memory files are committed to the repo. A leaked token is a security incident, not a note.

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
- [ ] Session started with DECISIONS.md read before any work
- [ ] Claims from memory verified against the working tree
- [ ] Every decision made this session has a DECISIONS.md entry
- [ ] Live state stated in the conversation and the tracker at every milestone
- [ ] Continue Here block present and under 15 lines
- [ ] No secrets or credentials in any memory file
- [ ] Compressed transcript kept outcomes and rationale, dropped step logs
```

---

## References

- `references/memory-protocols.md` - file entry formats, anti-patterns (memory rot, split truth), and trust boundaries in depth
