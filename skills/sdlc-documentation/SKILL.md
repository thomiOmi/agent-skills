---
name: sdlc-documentation
description: Use this skill when generating software development lifecycle (SDLC) specs, product requirements (PRDs), technical design documents, user stories, acceptance criteria, feature specs, or SPEC.md. Trigger with "SDLC docs", "write a PRD", "feature spec", "user stories", "acceptance criteria", "SPEC.md", "technical spec", or "release notes".
license: MIT
metadata:
  version: "1.2.0"
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
- Reference template available in `references/spec.md`.

---

## References

- `references/spec.md` - SPEC.md template for technical feature specs
- `references/prd.md` - Product Requirements Document template
- `references/sdd.md` - Software Design Document template
- `references/user-stories.md` - user story format with acceptance criteria
- `references/test-plan.md` - test plan template
- `references/release-notes.md` - release notes template
- `references/roadmap-and-research.md` - roadmap design and user research synthesis
- `architecture-decision` - when recording Architecture Decision Records (ADRs) for significant decisions

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
