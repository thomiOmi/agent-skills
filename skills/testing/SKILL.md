---
name: testing
description: >
  Use this skill when writing, reviewing, or fixing any tests — unit,
  integration, e2e, snapshot, or contract. Triggers: "write tests", "add tests",
  "test this", "improve coverage", "tests are failing", "mock", "stub".
  Works for all languages and frameworks.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Testing

Guidelines for tests that are clear, reliable, and actually catch bugs.
Framework-agnostic — adapt syntax to your language and test runner.

---

## Core Principles

1. **Tests are documentation** — a test should explain what the code is supposed to do.
2. **Test behavior, not implementation** — if renaming a private method breaks tests, the tests are wrong.
3. **One scenario per test** — multiple assertions are fine if they all verify one scenario.
4. **Deterministic** — no random data, no time-dependent logic without explicit control, no real network calls in unit tests.

---

## Test Naming

The test name should make the failure message self-explanatory without reading code.
Complete the sentence: *"It should…"*

```python
# Python (pytest)
def test_calculate_retry_delay_returns_exponential_backoff(): ...
def test_calculate_retry_delay_caps_at_30_seconds(): ...
def test_calculate_retry_delay_raises_for_negative_attempt(): ...
```

```typescript
// TypeScript (vitest / jest)
it("returns exponential backoff for each attempt")
it("caps delay at 30 seconds regardless of attempt count")
it("throws for negative attempt numbers")
```

```go
// Go
func TestRetryDelay_ExponentialBackoff(t *testing.T) {}
func TestRetryDelay_CapsAt30Seconds(t *testing.T)    {}
func TestRetryDelay_NegativeAttempt_Panics(t *testing.T) {}
```

Avoid: `test_1`, `test_thing`, `test_works`, names that describe implementation.

---

## Test Structure (AAA)

Every test: **Arrange → Act → Assert**

```python
def test_merge_permissions_deny_wins_over_allow():
    # Arrange
    base      = {"read": "allow", "write": "deny"}
    overrides = {"write": "allow"}

    # Act
    result = merge_permissions(base, overrides)

    # Assert
    assert result["write"] == "deny"  # deny always wins
```

---

## What to Test

**Always:**
- Happy path (valid input → expected output)
- Boundary values (empty, zero, max, None/null, empty string)
- Error cases (invalid input → correct exception or error response)
- Business rule enforcement (quotas, permissions, state transitions)

**Per function, ask:**
- What happens with valid input?
- What happens at the boundary?
- What happens when a dependency fails?
- What side effects should occur — and what must NOT occur?

---

## What NOT to Test

- Private methods or internal state — test through the public interface
- Framework or library behavior — test your code, not third-party code
- Trivial getters/setters with no logic
- Exact log message strings — fragile, low value

---

## Test Doubles

| Type | Use when |
|------|----------|
| **Mock** | Verify a call was made (email sent, event emitted) |
| **Stub** | Return a fixed value without real logic |
| **Spy** | Observe calls without replacing behavior |
| **Fake** | Lightweight real implementation (in-memory DB, fake mailer) |

**Prefer fakes over mocks** — they test behavior, not call signatures.
Over-mocking produces tests that pass even when the code is broken.

---

## Integration Tests

- Test the boundary between components (e.g. service + real database)
- Use a real test database, not mocks, for DB integration tests
- Clean up state after each test — tests must not depend on execution order
- Use transactions rolled back after each test where the framework supports it

---

## Snapshot Tests

Use snapshot tests for output that is large, structural, and changes infrequently:
UI component HTML, serialized data structures, generated files.

Rules:
- **Review every snapshot diff in code review** — do not approve blindly.
- Keep snapshot files committed in version control.
- If a snapshot changes unexpectedly, treat it as a potential bug — investigate before updating.
- Do not use snapshots for business logic — use explicit assertions instead.

```typescript
// vitest / jest
it("renders user card correctly", () => {
  const html = render(<UserCard user={mockUser} />);
  expect(html).toMatchSnapshot();
});
```

---

## Contract Tests

Use contract tests when two services communicate and must agree on a shared interface.
Verify the API contract independently from integration tests.

**Consumer-driven contract testing (recommended pattern):**

1. Consumer defines what it expects from the provider.
2. Contract is published (e.g. via Pact broker).
3. Provider verifies it can satisfy the consumer's contract.
4. CI fails if either side breaks the contract.

When to use:
- Microservices with separately deployed teams
- Public APIs with external consumers
- When full integration tests are too slow or expensive

```typescript
// Pact (consumer side)
await provider.addInteraction({
  state: "user exists",
  uponReceiving: "a request for user 123",
  withRequest: { method: "GET", path: "/users/123" },
  willRespondWith: {
    status: 200,
    body: { id: "usr_123", email: like("user@example.com") }
  }
});
```

---

## File Organization

Match test files to source files:

```
src/
├── users/
│   ├── service.ts        → tests/users/service.test.ts
│   └── repository.ts     → tests/users/repository.test.ts
```

Or co-locate (follow whatever convention exists in the project):

```
src/
└── users/
    ├── service.ts
    └── service.test.ts
```

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
