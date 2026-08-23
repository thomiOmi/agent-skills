---
name: test-planning
description: 'Use this skill when designing test strategies, test plans, QA entry/exit criteria, and coverage targets. Trigger with "test plan", "test strategy", "QA plan", "coverage target", "quality gates", or before launching major test suites. Do not write test plans without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Test Planning & QA Strategy

Guidelines for designing comprehensive test plans, QA entry/exit criteria, and coverage strategies.

---

## Test Plan Structure

1. **Scope & Objectives**: Features, components, and platforms under test.
2. **Test Pyramid Allocation**:
   - **Unit Tests**: Business logic, edge cases, data validation.
   - **Integration Tests**: API endpoints, database interactions, auth flows.
   - **E2E Tests**: Critical user journeys and happy paths.
3. **Entry & Exit Criteria**:
   - Entry: Code frozen, unit tests passing.
   - Exit: 0 critical/high bugs open, 80%+ test coverage.
4. **Environment & Data Setup**: Mocking requirements and test database seeding.

---

## Verification Checklist

```markdown
- [ ] Test scope and non-functional targets defined
- [ ] Unit, integration, and E2E coverage allocated
- [ ] Entry and exit quality gates specified
- [ ] Mocking and environment dependencies detailed
```
