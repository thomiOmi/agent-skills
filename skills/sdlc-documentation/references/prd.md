# PRD — Product Requirements Document

Audience: product managers, designers, engineers, stakeholders.
Use when: starting a new feature, product, or significant change.

```markdown
# PRD: [Feature / Product Name]

**Version:** 1.0
**Status:** Draft | Review | Approved
**Author:** [name]
**Date:** YYYY-MM-DD
**Stakeholders:** [list]

---

## 1. Overview

### Problem Statement
[2–3 sentences: what problem exists, who has it, and why it matters now]

### Goal
[1 sentence: what does success look like when this ships?]

### Non-Goals
[What this explicitly will NOT do — prevents scope creep]

---

## 2. Background & Context
[Why now? Relevant metrics, user feedback, or business context.]

---

## 3. User Stories

| As a... | I want to... | So that... |
| --------- | ------------- | ----------- |
| registered user | reset my password via email | I can regain access without contacting support |

---

## 4. Functional Requirements

### FR-01: [Requirement Name]
- **Description:** [What the system must do]
- **Priority:** Must Have | Should Have | Nice to Have
- **Acceptance criteria:**
  - [ ] [Specific, testable condition]

---

## 5. Non-Functional Requirements

| Category | Requirement |
| ---------- | ------------ |
| Performance | API response < 200ms at p95 |
| Security | All endpoints require authentication |
| Availability | 99.9% uptime SLA |

---

## 6. UX / Design
[Link to wireframes, mockups, or design system references.]

---

## 7. Dependencies & Risks

| Item | Type | Impact | Mitigation |
| ------ | ------ | -------- | ------------ |
| Payment provider API | Dependency | High | Use abstraction layer |

---

## 8. Success Metrics

| Metric | Baseline | Target | Measurement |
| -------- | ---------- | -------- | ------------- |
| Checkout completion | 62% | 75% | Analytics |

---

## 9. Timeline

| Phase | Deliverable | Target |
| ------- | ------------- | -------- |
| Design | Mockups approved | Week 1 |
| Development | Feature complete | Week 3 |

---

## 10. Open Questions
- [ ] [Question that needs resolution before development]
```

## PRD Rules

```text
✅ Every FR must have testable acceptance criteria
✅ Non-goals must be explicit
✅ Success metrics must be measurable
✅ Open questions must be resolved before development starts
❌ Do not write PRD and SDD in the same document
❌ Do not list features without explaining why they are needed
```
