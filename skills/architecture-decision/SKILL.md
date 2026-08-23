---
name: architecture-decision
description: 'Use this skill when recording Architecture Decision Records (ADRs) or evaluating major technical choices and trade-offs. Trigger with "write an ADR", "architecture decision", "record decision", "tech stack trade-off", or when documenting why a specific technology/pattern was selected. Do not write ADRs without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Architecture Decision Records (ADR)

Guidelines for documenting technical decisions, context, and trade-offs.

---

## ADR Template

```markdown
# ADR-001: [Short Title of Decision]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the problem or requirement? What constraints exist?

## Decision
What is the change or architecture choice we are committing to?

## Consequences
### Positive
- Benefit 1
- Benefit 2

### Negative & Risks
- Trade-off 1
- Risk 2 and mitigation
```

---

## Verification Checklist

```markdown
- [ ] Status explicitly set (Proposed/Accepted)
- [ ] Problem context and constraints documented
- [ ] Positive and negative consequences (trade-offs) listed
- [ ] Saved in `docs/adr/` or `DECISIONS.md`
```
