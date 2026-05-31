# Naming Conventions

**Be explicit, not clever.**

| Pattern | Bad | Good |
|---------|-----|------|
| Functions / methods | `doThing()` | `calculateRetryDelay()` |
| Booleans | `flag`, `check`, `ok` | `isAuthenticated`, `hasPermission` |
| Collections | `data`, `list`, `items` | `activeUsers`, `pendingOrders` |
| Event handlers | `handle()`, `click()` | `handlePaymentFailure()` |
| Generic variables | `x`, `temp`, `val` | `retryAttempt`, `expiresAt` |

Rules:
- Avoid abbreviations unless universally known (`id`, `url`, `db`, `ctx`).
- Before naming something new, search the codebase for similar patterns.
- Consistency with the existing codebase takes priority over personal preference.
