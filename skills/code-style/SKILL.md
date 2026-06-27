---
name: code-style
description: 'Use this skill when writing, reviewing, refactoring, or auditing any code. Triggers: "write a function", "refactor this", "review my code", "audit code quality", "check docstrings", "review the Auth module", "identify code issues", "what needs cleaning", "add comments". Apply whenever producing, modifying, or reviewing source code.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Code Style

Language-agnostic conventions for clean, readable, maintainable code.
Adapt syntax to your language — principles apply universally.

---

## Core Rules

**Naming:**
- Every name must be readable without additional context.
- No single-letter or abbreviated names — `processing_error` not `e`, `active_users` not `x`.
- No generic names — `invoice` not `data`, `parsed_response` not `result`.
- Consistency with the existing codebase takes priority over personal preference.
- See `references/naming.md` for full rules per category (variables, functions, booleans, classes).

**Docstrings:**
- Every function, method, and class must have a docstring or doc comment.
- Use the idiomatic format for your language.
- One sentence per field. No decorative banners, emoji, or ASCII art.
- Write for the next developer reading this in 6 months.
- See `references/docstrings.md` for format per language (Python, TS, Go, Rust, PHP, Java).

**Inline comments:**
- Required on complex or non-obvious logic — explain **why**, not what.
- Required on magic numbers, workarounds, and non-obvious business rules.
- Never restate what the code already says.
- See `references/comments.md` for examples and anti-patterns.

**Structure:**
- One function = one concern.
- Do not extract single-use helpers prematurely.
- Keep related code together — minimize scrolling to understand a flow.

---

## Checklist

```
- [ ] All new functions, methods, and classes have docstrings
- [ ] No decorative banners or emoji in docstrings
- [ ] Inline comments on complex or non-obvious logic
- [ ] No single-letter or abbreviated variable names (e, x, n, tmp, usr)
- [ ] No generic variable names (data, result, info, obj)
- [ ] No debug statements (console.log, print, debugger, pp, var_dump, dbg!)
- [ ] No hardcoded secrets or environment-specific values
- [ ] Names consistent with existing codebase conventions
- [ ] No changes outside the scope of the current task
```
