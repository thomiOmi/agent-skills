# SDD — Software Design Document

Audience: engineers, tech leads, architects.
Use when: engineers are about to implement something non-trivial.

```markdown
# SDD: [Feature / System Name]

**Version:** 1.0
**Status:** Draft | Review | Approved
**Author:** [name]
**Date:** YYYY-MM-DD
**Related PRD:** [link]

---

## 1. Overview
[2–3 sentences: what is being built and why this design approach]

### Scope
[What is covered — and what is explicitly not covered]

---

## 2. Architecture

### High-Level Design
CLIENT → API GATEWAY → SERVICE → DATABASE → MESSAGE QUEUE → WORKER

### Component Breakdown

| Component | Responsibility | Technology |
| ----------- | --------------- | ------------ |
| API Gateway | Auth, rate limiting, routing | [framework] |

---

## 3. Data Design

### Database Schema
[ERD or table definitions — use planning skill for ERD format]

### Data Flow
[Input → processing → output → storage]

---

## 4. API Design

### Endpoints
[New or modified endpoints — use api-conventions skill]

---

## 5. Key Design Decisions

| Decision | Options | Chosen | Reason |
| ---------- | --------- | -------- | -------- |
| Auth method | JWT vs Session | JWT | Stateless, works for mobile + web |

---

## 6. Security Considerations
- [Auth and authorization approach]
- [Input validation strategy]
- [Sensitive data handling]

---

## 7. Performance Considerations
- [Expected load and scale]
- [Caching strategy]
- [Async/queue strategy for heavy operations]

---

## 8. Testing Strategy

| Type | Target | Tool |
|------|--------|------|
| Unit | 80%+ critical paths | [framework] |
| Integration | All API endpoints | [framework] |

---

## 9. Rollout Plan

| Phase | Scope | Criteria |
| ------- | ------- | ---------- |
| Internal | Dev team | All tests passing |
| Beta | 10% users | Error rate < 0.1% |
| GA | 100% | Beta stable 48h |

---

## 10. Open Questions
- [ ] [Technical decision that needs resolution]
```

## SDD Rules

```text
✅ Link to the PRD — SDD explains HOW, PRD explains WHAT and WHY
✅ Document all major design decisions with reasoning
✅ Include rollout plan for production changes
✅ Security and performance must be addressed explicitly
❌ Do not skip data design
❌ Do not finalize without tech lead review
```
