---
name: test-planning
description: 'Use this skill when designing test strategies, test plans, QA entry/exit criteria, and coverage targets. Trigger with "test plan", "test strategy", "QA plan", "coverage target", "quality gates", or before launching major test suites. Do not write test plans without this skill loaded.'
license: MIT
metadata:
  version: "1.1.0"
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

## Common Pitfalls

1. **Coverage percentage as a goal**: Chasing a number produces assertions-free tests. Measure coverage to find gaps, never as the exit criterion itself.
2. **Testing implementation instead of behavior**: Tests coupled to internals break on every refactor. Assert observable outputs and side effects.
3. **E2E for everything**: End-to-end suites are slow and flaky; putting most cases there stalls feedback. Push coverage down the pyramid toward unit tests.
4. **Skipping non-functional targets**: Load, security, and accessibility requirements discovered after release are expensive. Set their targets in the plan, not in production.
5. **No test data strategy**: Realistic data volumes and edge cases (empty, huge, unicode, concurrent) surface bugs that happy-path fixtures never will.

---

## Verification Checklist

```markdown
- [ ] Test scope and non-functional targets defined
- [ ] Unit, integration, and E2E coverage allocated
- [ ] Entry and exit quality gates specified
- [ ] Mocking and environment dependencies detailed
```
