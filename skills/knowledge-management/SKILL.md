---
name: knowledge-management
description: 'Use this skill when reading, writing, or updating knowledge files — KNOWLEDGE.md (project) or KNOWLEDGE.md (global). Triggers: "update knowledge", "remember this", "save this decision", "what do we know about", "summarize this session", "create knowledge file", "add to knowledge base". Apply at the start of every session and when significant decisions are made.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Knowledge Management

File-based persistent memory across sessions.
No external dependencies — knowledge lives as plain Markdown files in the project.

---

## Two Knowledge Files

| File | Location | Purpose | Loaded |
|------|---------|---------|--------|
| `KNOWLEDGE.md` | `~/.agents/KNOWLEDGE.md` | Personal preferences, cross-project patterns | Auto (via opencode.jsonc instructions) |
| `KNOWLEDGE.md` | Project root | Project-specific decisions, patterns, tech debt | On-demand at session start |

---

## Session Rules

**At session start:**
1. `~/.agents/KNOWLEDGE.md` is auto-loaded if configured in `opencode.jsonc`
2. Use `read` tool to read `KNOWLEDGE.md` from project root if it exists
3. Apply preferences and patterns found — do not ask the user to repeat known context

**At session end or when asked:**
1. Append new entries — never overwrite existing ones
2. Only record decisions actually made this session — do not fabricate
3. Keep entries concise — 3–5 lines per decision maximum
4. Use `edit` tool to append to the file

See `references/what-to-record.md` for what qualifies as a significant decision.
See `references/format.md` for entry format and examples.
See `assets/KNOWLEDGE.md.template` for the project or global template.

---

## Quick Commands

When user says any of these, act immediately:

| User says | Action |
|-----------|--------|
| "remember this" / "save this" | Append to KNOWLEDGE.md immediately |
| "update knowledge base" | Summarize session decisions and append |
| "what do we know about X" | Read KNOWLEDGE.md and search for X |
| "create knowledge file" | Copy template to project root and fill in project name |
| "summarize this session" | Write Session History entry and append |

---

## Checklist

```
Session start:
- [ ] ~/.agents/KNOWLEDGE.md read (if exists)
- [ ] KNOWLEDGE.md read via `read` tool (if exists in project root)
- [ ] Preferences and known patterns applied

Session end (when significant decisions were made):
- [ ] Architectural decisions appended to KNOWLEDGE.md
- [ ] Session summary appended to ## Session History
- [ ] Cross-project patterns added to ~/.agents/KNOWLEDGE.md
- [ ] No existing entries overwritten
- [ ] No fabricated entries added
```
