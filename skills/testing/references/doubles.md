# Test Doubles

| Type | Use when |
| ------ | ---------- |
| **Mock** | Verify a call was made (email sent, event emitted) |
| **Stub** | Return a fixed value without real logic |
| **Spy** | Observe calls without replacing behavior |
| **Fake** | Lightweight real implementation (in-memory DB, fake mailer) |

**Prefer fakes over mocks** — they test behavior, not call signatures.
Over-mocking produces tests that pass even when the code is broken.
