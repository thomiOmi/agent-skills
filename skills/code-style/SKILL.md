---
name: code-style
description: 'Use this skill whenever you write, review, refactor, or audit any code in any language. This includes naming conventions, docstrings, inline comments, code structure, and general code quality. Apply proactively - do not write or modify code without loading this skill first. Triggers include: "write a function", "refactor this", "review my code", "audit code quality", "check docstrings", "review the Auth module", "identify code issues", "what needs cleaning", "add comments", "clean up this code", "make this more readable", "naming conventions", "is this idiomatic". Even if the user does not explicitly ask for code review, load this skill whenever code is being produced or modified.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Code Style

Language-agnostic conventions for clean, readable, maintainable code.
Adapt syntax to your language - principles apply universally.

---

## Core Rules

**Naming:**

- Every name must be readable without additional context.
  - Why: A name like `e` or `tmp` tells the reader nothing. Six months from now, every abbreviated name requires mental decompilation to understand.
- No single-letter or abbreviated names - `processing_error` not `e`, `active_users` not `x`.
- No generic names - `invoice` not `data`, `parsed_response` not `result`.
- Consistency with the existing codebase takes priority over personal preference.
  - Why: A codebase with mixed naming conventions (camelCase here, snake_case there) looks unprofessional and confuses readers. Consistency reduces cognitive load.
- See `references/naming.md` for full rules per category (variables, functions, booleans, classes).

**Docstrings:**

- Every function, method, and class must have a docstring or doc comment.
  - Why: Docstrings are the primary documentation surface for other developers. Without them, the only way to understand a function is to read its entire implementation.
- Use the idiomatic format for your language.
- One sentence per field. No decorative banners, emoji, or ASCII art.
  - Why: Decorative comments add visual noise and rot - they are never updated when code changes, so they eventually mislead.
- Write for the next developer reading this in 6 months.
  - Why: The person reading this code likely has zero context from this conversation. If the docstring only makes sense to you right now, it will confuse someone else later.
- See `references/docstrings.md` for format per language (Python, TS, Go, Rust, PHP, Java).

**Inline comments:**

- Required on complex or non-obvious logic - explain **why**, not what.
  - Why: "What" is already visible in the code. "Why" - the reasoning behind the approach - is invisible without a comment.
- Required on magic numbers, workarounds, and non-obvious business rules.
  - Why: Magic numbers and workarounds have no self-documenting intention. A future reader cannot tell if a number is intentional or a bug.
- Never restate what the code already says.
  - Why: Comments that repeat the code add noise without value. Worse, they go stale and actively mislead.
- See `references/comments.md` for examples and anti-patterns.

**Structure:**

- One function = one concern.
  - Why: A function that does two things cannot be named accurately, is harder to test, and forces readers to keep both concerns in working memory.
- Do not extract single-use helpers prematurely.
  - Why: Premature extraction adds indirection without reuse benefit. Wait for duplication to emerge, then refactor.
- Keep related code together - minimize scrolling to understand a flow.
  - Why: Scattering related logic across a file forces mental context-switching. Grouping minimizes the surface area a reader must scan.

---

## Checklist

```markdown
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
