---
name: code-style
description: Use this skill when writing, reviewing, or refactoring any code in any language. Triggers: "write a function", "refactor this", "clean this up", "add comments", "review my code". Apply whenever producing or modifying source code.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.1.0"
  author: thomiOmi
---

# Code Style

Language-agnostic conventions for clean, readable, maintainable code.
Adapt syntax to your language — principles apply universally.

---

## Core Rules

**Naming:**
- Name by what it is or does, not how it works internally.
- Avoid single-letter or abbreviated variables — use full, descriptive names.
  `processing_error` not `e` · `active_users` not `x` · `retry_attempt` not `n`
- Abbreviations only when universally known in the domain: `id`, `url`, `db`, `ctx`.
- Consistency with the existing codebase takes priority over personal preference.

**Docstrings:**
- Every function, method, and class must have a docstring or doc comment.
- One sentence per point. No decorative banners, emoji, or ASCII art.
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

```markdown
- [ ] All new functions, methods, and classes have docstrings
- [ ] No decorative banners or emoji in docstrings
- [ ] Inline comments on complex or non-obvious logic
- [ ] No single-letter or abbreviated variable names (e, x, n, tmp)
- [ ] No debug statements (console.log, print, debugger, pp, var_dump, dbg!)
- [ ] No hardcoded secrets or environment-specific values
- [ ] Names consistent with existing codebase conventions
- [ ] No changes outside the scope of the current task
```

---

See `assets/` for code templates per language.
