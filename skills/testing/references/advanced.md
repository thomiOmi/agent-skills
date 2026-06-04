# Advanced Testing — Snapshot and Contract Tests

## Snapshot Tests

### What they are

A snapshot test captures the output of a unit at a point in time and stores it as a reference file.
On subsequent runs, the output is compared against the stored snapshot.
Any difference causes the test to fail.

### When to use

Snapshot tests are appropriate for output that is:

- Large — too verbose to assert field by field
- Structural — the shape and relationships matter more than individual values
- Slow to change — not updated frequently

Common candidates: rendered UI components, serialized data structures, generated configuration files.

### Rules

- Review every snapshot diff during code review. Do not approve snapshot updates without understanding what changed.
- Store snapshot files in version control alongside the tests.
- If a snapshot changes unexpectedly, treat it as a potential bug — investigate before updating.
- Do not use snapshots for business logic. Use explicit, targeted assertions instead.
- Snapshots that change frequently are a sign that the wrong thing is being snapshotted.

---

## Contract Tests

### What they are

A contract test verifies that two services agree on the interface between them.
The consumer defines what it expects from the provider.
The provider verifies it can satisfy that expectation.

This approach catches integration failures without running both services simultaneously.

### When to use

- Microservices with separately deployed teams
- Public APIs with external consumers
- When full end-to-end integration tests are too slow, expensive, or environment-dependent

### Consumer-driven contract testing workflow

```text
STEP 1 — Consumer defines expectations
  The consuming service records the interactions it expects:
  - The request it will send (method, path, headers, body)
  - The response it expects back (status, body shape)

STEP 2 — Contract is published
  The recorded expectations are saved as a contract file and shared with the provider.
  This is typically done through a contract broker (e.g. Pact Broker).

STEP 3 — Provider verifies
  The provider runs the contract against its actual implementation.
  If the provider cannot satisfy the consumer's expectations, the build fails.

STEP 4 — CI enforces
  Both consumer and provider pipelines check the contract.
  A deploy that would break a contract is blocked automatically.
```

### Rules

- The consumer defines the contract — not the provider.
- Only assert the fields the consumer actually uses. Do not assert the entire response shape.
- Treat a contract failure as a breaking change — coordinate between teams before proceeding.
- Do not use contract tests as a replacement for unit tests. They serve a different purpose.
