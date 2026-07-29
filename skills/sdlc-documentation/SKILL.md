---
name: sdlc-documentation
description: 'Use this skill when creating or reviewing any SDLC artifact -  PRD, SDD, BRD, FRD, user stories, acceptance criteria, test plans, or release notes. Load this skill proactively before starting any feature that requires formal documentation or requirements gathering. For technical design diagrams (architecture, data model, flows), use planning instead. Triggers include: "write a PRD", "create SDD", "document requirements", "user stories", "acceptance criteria", "review the PRD", "audit requirements", "business requirements", "functional specification", "technical specification", "requirements gathering", "stakeholder review", "feature request", "scope definition", "release notes", "change log", "project charter", "vision document", "executive summary". Use before starting any feature requiring formal documentation.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# SDLC Documentation

Structured templates for Software Development Lifecycle artifacts.
Always produce documentation before implementation -  not after.

---

## Document Types

| Document                         | Abbrev | Use when                              |
| -------------------------------- | ------ | ------------------------------------- |
| Product Requirements Document    | PRD    | Defining what to build and why        |
| Software Design Document         | SDD    | Defining how to build it              |
| Business Requirements Document   | BRD    | Capturing business needs              |
| Functional Requirements Document | FRD    | Detailed feature specifications       |
| User Stories                     | -       | Agile tasks ready for development     |
| Test Plan                        | -       | Test strategy before QA begins        |
| Release Notes                    | -       | Communicating changes to stakeholders |

---

## References

- `references/prd.md` -  PRD template with 10 sections
- `references/sdd.md` -  SDD template with 10 sections
- `references/user-stories.md` -  user story format with acceptance criteria and Definition of Done
- `references/test-plan.md` -  test plan with entry/exit criteria and test case template
- `references/release-notes.md` -  release notes template for end users and stakeholders

See `assets/templates.md` for PRD and SDD quick skeletons.
See `assets/doc-conventions.md` for document storage and naming conventions.

---

## SDLC Checklist

```
- [ ] PRD written and approved before design starts
- [ ] SDD written and reviewed before development starts
- [ ] User stories have acceptance criteria and Definition of Done
- [ ] Test plan covers unit, integration, e2e, and performance
- [ ] Release notes written for all user-facing changes
- [ ] All open questions resolved before implementation
- [ ] Documents stored in docs/ with consistent naming convention
```
