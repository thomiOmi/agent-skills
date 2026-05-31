---
name: testing
description: Use this skill when writing, reviewing, or fixing any tests — unit, integration, e2e, snapshot, or contract. Triggers: "write tests", "add tests", "test this", "improve coverage", "tests are failing", "mock", "stub". Works for all languages and frameworks.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Testing

Guidelines for tests that are clear, reliable, and actually catch bugs.
Framework-agnostic — adapt syntax to your language and test runner.

## Core Principles

1. **Tests are documentation** — a test explains what the code is supposed to do.
2. **Test behavior, not implementation** — if renaming a private method breaks tests, the tests are wrong.
3. **One scenario per test** — multiple assertions are fine if they verify one scenario.
4. **Deterministic** — no random data, no uncontrolled time, no real network calls in unit tests.

See `references/naming.md` for test naming patterns per language.
See `references/structure.md` for AAA pattern and what to test.
See `references/doubles.md` for mocks, stubs, fakes, and spies.
See `references/advanced.md` for snapshot and contract testing.

---

## Checklist

```
- [ ] Test name clearly describes the scenario and expected outcome
- [ ] Follows Arrange → Act → Assert
- [ ] Happy path covered
- [ ] Boundary and edge cases covered
- [ ] Error / exception cases covered
- [ ] No real network calls, random values, or uncontrolled time (unit tests)
- [ ] Test does not depend on other tests or execution order
- [ ] Mocks used sparingly — behavior tested, not call signatures
- [ ] Snapshot diffs reviewed deliberately (if applicable)
- [ ] Contract tests in place for cross-service interfaces (if applicable)
- [ ] Test passes when run in isolation
```
