---
name: sdlc-documentation
description: Use this skill when creating or updating any SDLC artifact — PRD, SDD, BRD, FRD, user stories, acceptance criteria, test plans, or release notes. Triggers: "write a PRD", "create SDD", "document requirements", "user stories", "acceptance criteria", "business requirements", "functional spec", "release notes", "test plan". Use before starting any feature or product that requires formal documentation.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# SDLC Documentation

Structured templates for Software Development Lifecycle artifacts.
Always produce documentation before implementation — not after.

## Document Types

| Document | Abbrev | Use when |
|----------|--------|----------|
| Product Requirements Document | PRD | Defining what to build and why |
| Software Design Document | SDD | Defining how to build it |
| Business Requirements Document | BRD | Capturing business needs |
| Functional Requirements Document | FRD | Detailed feature specifications |
| User Stories | — | Agile tasks ready for development |
| Test Plan | — | Test strategy before QA begins |
| Release Notes | — | Communicating changes to stakeholders |

See `references/prd.md` for PRD template (10 sections).
See `references/sdd.md` for SDD template (10 sections).
See `references/user-stories.md` for user story + acceptance criteria format.
See `references/test-plan.md` for test plan template.
See `references/release-notes.md` for release notes template.
See `assets/doc-conventions.md` for document storage conventions.

---

## SDLC Checklist

```
- [ ] PRD written and approved before design starts
- [ ] SDD written and reviewed before development starts
- [ ] User stories have acceptance criteria and Definition of Done
- [ ] Test plan covers unit, integration, e2e, performance
- [ ] Release notes written for all user-facing changes
- [ ] All open questions resolved before implementation
- [ ] Documents stored in docs/ with consistent naming
```
