---
name: testing
description: Use this skill when writing, reviewing, auditing, or fixing any tests. Triggers: "write tests", "add tests", "check test coverage", "what tests are missing", "audit test quality", "review tests", "improve coverage", "tests are failing", "mock", "stub". Works for all languages and frameworks.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Testing

Guidelines for tests that are clear, reliable, and actually catch bugs.
Framework-agnostic — adapt syntax to your language and test runner.

---

## Core Principles

1. Tests are documentation — a test explains what the code is supposed to do.
2. Test behavior, not implementation — if renaming a private method breaks tests, the tests are wrong.
3. One scenario per test — multiple assertions are fine if they all verify one scenario.
4. Deterministic — no random data, no uncontrolled time, no real network calls in unit tests.
5. **Error paths are as important as happy paths** — every failure mode must be tested explicitly.

---

## References

- `references/naming.md` — test naming patterns per language (Python, TS, Go, PHP)
- `references/structure.md` — AAA pattern, what to test, **error path rules and checklist**, integration tests
- `references/doubles.md` — mocks, stubs, fakes, spies and when to use each
- `references/advanced.md` — snapshot tests and contract tests

See `assets/templates.md` for unit, integration, and test case documentation templates.

---

## Checklist

```
- [ ] Test name clearly describes the scenario and expected outcome
- [ ] Follows Arrange, Act, Assert structure
- [ ] Happy path covered
- [ ] Boundary and edge cases covered
- [ ] Error paths covered — each failure mode tested separately
- [ ] Correct error type and message asserted (not just "an error occurred")
- [ ] Each dependency failure mode tested independently
- [ ] Permission denied tested for each protected operation
- [ ] No real network calls, random values, or uncontrolled time in unit tests
- [ ] Test does not depend on other tests or execution order
- [ ] Mocks used sparingly — behavior tested, not call signatures
- [ ] Snapshot diffs reviewed deliberately before approving
- [ ] Contract tests in place for cross-service interfaces
- [ ] Test passes when run in isolation
```
