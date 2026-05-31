# Advanced Testing — Snapshot and Contract Tests

## Snapshot Tests

Use for output that is large, structural, and changes infrequently:
UI component HTML, serialized data structures, generated files.

Rules:
- **Review every snapshot diff in code review** — do not approve blindly.
- Keep snapshot files committed in version control.
- If a snapshot changes unexpectedly, treat it as a potential bug.
- Do not use snapshots for business logic — use explicit assertions.

```typescript
it("renders user card correctly", () => {
  const html = render(<UserCard user={mockUser} />);
  expect(html).toMatchSnapshot();
});
```

## Contract Tests

Use when two services communicate and must agree on a shared interface.

When to use:
- Microservices with separately deployed teams
- Public APIs with external consumers
- When full integration tests are too slow or expensive

**Consumer-driven contract testing pattern (Pact):**

1. Consumer defines what it expects from the provider.
2. Contract is published (e.g. via Pact broker).
3. Provider verifies it can satisfy the consumer's contract.
4. CI fails if either side breaks the contract.

```typescript
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
