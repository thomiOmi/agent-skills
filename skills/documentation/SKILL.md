---
name: documentation
description: 'Use this skill whenever documentation needs to be written, updated, reviewed, or audited: README files, CHANGELOGs, OpenAPI specs, API docs, setup guides, inline code docs, and SDLC artifacts such as PRDs, SPEC.md, SDDs, user stories, acceptance criteria, feature specs, and release notes. Load proactively when code changes affect public interfaces, configuration, or setup, and when the user asks for "write docs", "update the README", "changelog entry", "API docs", "how to install", "write a PRD", "feature spec", "user stories", "acceptance criteria", "SPEC.md", "technical spec", or "release notes". For Architecture Decision Records, load `architecture-decision`. Keep one owner document per fact.'
license: MIT
metadata:
  version: "3.0.0"
  author: thomiOmi
---

# Documentation

Write for the reader who has zero context from this conversation. If it only makes sense to you right now, it will confuse someone else later.

For Architecture Decision Records, load `architecture-decision`. For SDLC artifacts, load the matching reference below. If a reference cannot be read, state the context, the requirement, what was rejected, and the consequence; keep one owner document per fact.

---

## Examples

**Before (unhelpful docstring):**

```text
// Gets the user
function getUser(id: string) { ... }
```

**After (helpful docstring):**

```text
/** Fetches a user by ID.
 * @param id - UUID of the user (not email or username)
 * @returns User object with profile and preferences joined
 * @throws NotFoundError if no user with that ID exists
 */
function getUser(id: string) { ... }
```

---

## SDLC Specs and SPEC.md

In real projects, generate or update `SPEC.md` at the project root or feature folder. It holds low-level technical design, module interactions, data structures, and implementation steps before code is written.

Create a `SPEC.md` when designing a complex multi-file feature or an API refactor. The template lives in `references/spec.md`.

---

## References

Load only what the task needs. All files are one level deep from this `SKILL.md`.

| Reference | Use for |
| --- | --- |
| `references/readme.md` | README structure, quick-start rules, what to document |
| `references/changelog.md` | Keep a Changelog format and section types |
| `references/adr.md` | Pointer to `architecture-decision`, the ADR format owner |
| `references/openapi.md` | Minimum OpenAPI requirements per endpoint |
| `references/spec.md` | SPEC.md template for technical feature specs |
| `references/prd.md` | Product Requirements Document template |
| `references/sdd.md` | Software Design Document template |
| `references/user-stories.md` | User story format with acceptance criteria |
| `references/test-plan.md` | Test plan template |
| `references/release-notes.md` | Release notes template |
| `references/roadmap-and-research.md` | Roadmap design and research synthesis |
| `references/requirements-spec.md` | Requirements specification template |

Assets: `assets/templates.md` (README skeleton and changelog entries), `assets/sdlc-templates.md` (SDLC document templates), `assets/doc-conventions.md` (formatting conventions).

---

## Checklist

```markdown
- [ ] README updated if setup, config, or usage changed
- [ ] CHANGELOG entry added under [Unreleased]
- [ ] OpenAPI spec updated if any REST endpoint changed
- [ ] ADR written if a significant architectural decision was made
- [ ] Requirements are specific, unambiguous, and testable
- [ ] Acceptance criteria defined for every user story or feature
- [ ] Edge cases and non-functional requirements covered
- [ ] Dependencies between features identified
- [ ] Doc matches the actual implementation after changes
- [ ] Code examples in docs are verified to work
- [ ] No "TODO: document this" left behind
- [ ] Written for a reader with zero prior context
```
