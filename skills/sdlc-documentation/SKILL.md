---
name: sdlc-documentation
description: Use this skill when generating software development lifecycle (SDLC) specs, technical design documents, user stories, feature specs, or SPEC.md. Trigger with "SDLC docs", "feature spec", "SPEC.md", "technical spec", or "release notes".
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# SDLC Documentation & SPEC.md

Guidelines for technical feature specifications and SDLC documentation.

---

## Real Project File: SPEC.md

In real projects, this skill generates or updates `SPEC.md` at the project root or feature folder.
A `SPEC.md` contains low-level technical design, module interactions, data structures, and implementation steps before writing code.

### When to create SPEC.md
- Designing complex multi-file features or API refactors.
- Reference template available in `references/SPEC_TEMPLATE.md`.

---

## SDLC Documentation Checklist

```markdown
- [ ] Requirements are specific, unambiguous, and testable
- [ ] Acceptance criteria defined for every user story or feature
- [ ] Edge cases and non-functional requirements covered
- [ ] Dependencies between features identified
- [ ] Doc matches the actual implementation after changes
- [ ] Versioned and formatted cleanly in Markdown
```
