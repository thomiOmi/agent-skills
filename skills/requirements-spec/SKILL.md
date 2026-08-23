---
name: requirements-spec
description: 'Use this skill when writing product requirements documents (PRDs), feature specifications, user stories, or acceptance criteria. Trigger with "write a PRD", "feature spec", "user story", "acceptance criteria", "product requirements", or before defining scope for new features. Do not write feature specs without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Requirements Specification (PRD & User Stories)

Guidelines for defining feature specifications, user stories, and acceptance criteria.

---

## User Story Format

```markdown
### User Story: [Feature Name]

**As a** [user persona]
**I want** [goal / action]
**So that** [benefit / value]

#### Acceptance Criteria
- [ ] **Given** [initial context], **When** [action happens], **Then** [expected result]
- [ ] **Given** [invalid input], **When** [submitted], **Then** [error message shown]

#### Out of Scope
- [Explicitly listed out-of-scope boundaries]
```

---

## Verification Checklist

```markdown
- [ ] Problem statement and target persona clear
- [ ] User story uses "As a / I want / So that" format
- [ ] Acceptance criteria verifiable and clear
- [ ] Out-of-scope items explicitly listed
```
