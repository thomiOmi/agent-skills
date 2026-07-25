---
name: testing
description: 'Use this skill whenever tests are involved — writing, reviewing, auditing, debugging, or improving them. This includes unit tests, integration tests, e2e tests, contract tests, snapshot tests, and test coverage analysis. Load this skill proactively any time the user mentions tests, test files, coverage, mocking, assertions, or test frameworks like Jest, Vitest, Bun test, PyTest, PHPUnit, RSpec, or Go test. Triggers include: "write tests", "add tests", "check test coverage", "what tests are missing", "audit test quality", "review tests", "improve coverage", "tests are failing", "mock", "stub", "test this function", "add more test cases", "is this test correct", "test coverage is low". Works for all languages and frameworks.'
license: MIT
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

## Examples

**Good test** (one scenario, behavior-focused):

```ts
// Input: Processing an invoice with a valid discount code
// Output: Total should reflect the discounted amount

it('applies a 10% discount when code SAVE10 is used', async () => {
  const invoice = await createInvoice({ amount: 10000, discountCode: 'SAVE10' });
  expect(invoice.total).toBe(9000);
  expect(invoice.discountApplied).toBe(1000);
});
```

**Bad test** (implementation-coupled, fragile):

```ts
// ❌ Tests that internal setDiscount method was called — not the behavior
it('calls setDiscount with SAVE10', () => {
  const spy = vi.spyOn(invoice, 'setDiscount');
  invoice.applyDiscount('SAVE10');
  expect(spy).toHaveBeenCalledWith('SAVE10');
});
```

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
