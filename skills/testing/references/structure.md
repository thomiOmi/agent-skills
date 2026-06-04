# Test Structure

## AAA Pattern

Every test follows three steps in this exact order:

```
ARRANGE   Set up the inputs, state, and dependencies needed for the test.
          Keep this minimal — only what the scenario requires.

ACT       Perform the single action being tested.
          One action per test. If you need two actions, write two tests.

ASSERT    Verify the outcome.
          Assert the observable result — return value, state change, or side effect.
          Multiple assertions are acceptable if they all verify one scenario.
```

Label each section with a comment (`# Arrange`, `// Act`, etc.) when the separation is not obvious.

---

## What to Test

**Always test:**

- Happy path — valid input produces the expected output
- Boundary values — empty string, zero, maximum allowed value, null, undefined
- Error cases — invalid input produces the correct error or rejection
- Business rules — quotas, permission checks, state transitions, validation logic

**For each function, ask:**

1. What happens with valid, typical input?
2. What happens at the edges of the valid range?
3. What happens when a required dependency fails or is unavailable?
4. What side effects should occur — and what must not occur?

---

## What Not to Test

- Private methods or internal state — test through the public interface
- Framework or library behavior — test your code, not third-party code
- Trivial accessors with no logic — getters and setters that do nothing but read/write a field
- Exact log message strings — fragile and low value

---

## Integration Tests

Rules specific to tests that cross system boundaries (database, file system, network):

- Use a real test database, not a mock, for database integration tests.
- Each test must clean up its own data — tests must not depend on execution order.
- Use transactions that roll back after each test where the framework supports it.
- Do not share state between integration tests.

---

## File Organization

Place test files adjacent to the source files they test, or in a parallel directory that mirrors the source structure. Follow the convention already established in the project — do not introduce a second convention.

```
Option A — co-located:
  src/
    users/
      service.[ext]
      service.test.[ext]     ← test file beside source

Option B — parallel directory:
  src/users/service.[ext]
  tests/users/service.test.[ext]   ← mirrors source structure
```
