# SDLC Quick Skeletons

For full templates see references/prd.md, references/sdd.md, etc.

## PRD Skeleton

```markdown
# PRD: [Feature Name]

**Version:** 1.0 | **Status:** Draft | **Date:** YYYY-MM-DD

## Problem Statement
[2-3 sentences: what problem, who has it, why it matters now]

## Goal
[1 sentence: what success looks like]

## Non-Goals
- [explicit exclusion]

## Functional Requirements

### FR-01: [Name]
- **Description:** [what the system must do]
- **Priority:** Must Have | Should Have | Nice to Have
- **Acceptance criteria:**
  - [ ] Given [...], when [...], then [...]

## Success Metrics
| Metric | Baseline | Target |
|--------|----------|--------|

## Open Questions
- [ ] [question — needs answer before development starts]
```

## SDD Skeleton

```markdown
# SDD: [Feature Name]

**Version:** 1.0 | **Status:** Draft | **Related PRD:** [link]

## Summary
[2-3 sentences: what is being built and why this design]

## Architecture
[Mermaid diagram]

## Data Design
[ERD from planning skill]

## Key Design Decisions
| Decision | Chosen | Reason |
|----------|--------|--------|

## Security Considerations
- [item]

## Rollout Plan
| Phase | Scope | Criteria to proceed |
|-------|-------|---------------------|
| Internal | Dev team | All tests passing |
| GA | All users | Beta stable 48h |
```
