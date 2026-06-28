---
name: knowledge-management
description: 'Use this skill when reading, writing, or updating knowledge files — KNOWLEDGE.md (project) or KNOWLEDGE.md (global). Triggers: "update knowledge", "remember this", "save this decision", "what do we know about", "summarize this session", "create knowledge file", "add to knowledge base". Apply at the start of every session and when significant decisions are made.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Knowledge Management

File-based persistent memory across sessions.
No external dependencies — knowledge lives as plain Markdown files.

---

## Two Knowledge Files

Both files are named KNOWLEDGE.md. Location determines which is which.

| Label | Full path | Purpose | Loaded |
|-------|----------|---------|--------|
| Global | ~/.agents/KNOWLEDGE.md | Personal preferences, cross-project patterns | Auto via opencode.jsonc |
| Project | [project-root]/KNOWLEDGE.md | Project decisions, patterns, tech debt | On-demand at session start |

Never confuse the two — always check the full path, not just the filename.

---

## Session Rules

At session start:
1. ~/.agents/KNOWLEDGE.md is auto-loaded if configured in opencode.jsonc
2. Use read tool to read project KNOWLEDGE.md from project root if it exists
3. Apply preferences and patterns found — do not ask the user to repeat known context

At session end or when asked:
1. Append new entries — never overwrite existing ones
2. Only record decisions actually made this session — do not fabricate
3. Keep entries concise — 3 to 5 lines per decision maximum
4. Use edit tool to append to the file
5. Cross-project findings go to ~/.agents/KNOWLEDGE.md
6. Project-specific findings go to project root KNOWLEDGE.md

See `references/what-to-record.md` for what qualifies as a significant decision.
See `references/format.md` for entry format and examples.
See `assets/KNOWLEDGE.md.template` for the template used for both global and project.

---

## Quick Commands

When user says any of these, act immediately:

| User says | Action |
|-----------|--------|
| "remember this" or "save this" | Append to project KNOWLEDGE.md immediately |
| "remember this globally" | Append to ~/.agents/KNOWLEDGE.md |
| "update knowledge base" | Summarize session decisions and append |
| "what do we know about X" | Read both KNOWLEDGE.md files and search for X |
| "create knowledge file" | Copy template to project root and fill in project details |
| "summarize this session" | Write Session History entry and append |

---

## Section Rules

Which sections belong in which file:

| Section | Global KNOWLEDGE.md | Project KNOWLEDGE.md |
|---------|--------------------|--------------------|
| Preferences | YES - personal working style | NO - not here |
| Decisions | YES - cross-project | YES - project architecture |
| Conventions | YES - cross-project | YES - project-specific |
| Known Issues | YES - cross-project pitfalls | YES - project bugs or debt |
| Session History | YES - notable cross-project sessions | YES - per-session summary |
| Update Log | YES | YES |

Session History is NOT a copy of Decisions.
Session History = brief summary of what happened. Reference decision titles only — full detail stays in Decisions.

---

## Checklist

```
Session start:
- [ ] ~/.agents/KNOWLEDGE.md read (auto-loaded or via read tool)
- [ ] Project KNOWLEDGE.md read via read tool (if exists in project root)
- [ ] Preferences and known patterns applied without asking user

Session end (when significant decisions were made):
- [ ] Project decisions appended to project KNOWLEDGE.md under Decisions
- [ ] Session summary appended to Session History (brief reference only)
- [ ] Cross-project patterns added to ~/.agents/KNOWLEDGE.md
- [ ] No existing entries overwritten
- [ ] No fabricated entries added
```