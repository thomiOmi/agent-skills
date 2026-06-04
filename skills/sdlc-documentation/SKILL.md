---
name: sdlc-documentation
description: Use this skill when creating or updating any SDLC artifact — PRD, SDD, BRD, FRD, user stories, acceptance criteria, test plans, or release notes. Triggers: "write a PRD", "create SDD", "document requirements", "user stories", "acceptance criteria", "business requirements", "functional spec", "release notes", "test plan". Use before starting any feature or product that requires formal documentation.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# SDLC Documentation

Structured templates for Software Development Lifecycle artifacts.
Always produce documentation before implementation — not after.

---

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

---

## References

- `references/prd.md` — PRD template with 10 sections
- `references/sdd.md` — SDD template with 10 sections
- `references/user-stories.md` — user story format with acceptance criteria and Definition of Done
- `references/test-plan.md` — test plan with entry/exit criteria and test case template
- `references/release-notes.md` — release notes template for end users and stakeholders

See `assets/templates.md` for PRD and SDD quick skeletons.
See `assets/doc-conventions.md` for document storage and naming conventions.

---

## SDLC Checklist

```markdown
- [ ] PRD written and approved before design starts
- [ ] SDD written and reviewed before development starts
- [ ] User stories have acceptance criteria and Definition of Done
- [ ] Test plan covers unit, integration, e2e, and performance
- [ ] Release notes written for all user-facing changes
- [ ] All open questions resolved before implementation
- [ ] Documents stored in docs/ with consistent naming convention
```
