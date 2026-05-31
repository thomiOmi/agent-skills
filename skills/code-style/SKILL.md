---
name: code-style
description: Use this skill when writing, reviewing, or refactoring any code in any language. Triggers: "write a function", "refactor this", "clean this up", "add comments", "review my code". Apply this skill whenever producing or modifying source code.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Code Style

Language-agnostic conventions for clean, readable, maintainable code.
Adapt syntax to your language — principles apply universally.

## Core Rules

- Name by **what it is or does**, not how it works internally.
- Every function, method, and class **must** have a docstring or doc comment.
- Complex or non-obvious logic **must** have an inline comment explaining **why**.
- One function = one concern.
- Consistency with the existing codebase takes priority over personal preference.

See `references/naming.md` for naming patterns.
See `references/docstrings.md` for docstring formats per language (Python, TS, Go, Rust).
See `references/comments.md` for inline comment examples and anti-patterns.

---

## Checklist

```
- [ ] All new functions, methods, classes have docstrings
- [ ] Inline comments on complex or non-obvious logic
- [ ] No debug statements (console.log, print, debugger, pp, var_dump, dbg!)
- [ ] No hardcoded secrets or environment-specific values
- [ ] Names consistent with existing codebase conventions
- [ ] No changes outside the scope of the current task
```
