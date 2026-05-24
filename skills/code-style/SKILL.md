---
name: code-style
description: >
  Use this skill when writing, reviewing, or refactoring any code in any
  language. Triggers: "write a function", "refactor this", "clean this up",
  "add comments", "review my code". Apply this skill whenever producing or
  modifying source code.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Code Style

Language-agnostic conventions for clean, readable, maintainable code.
Adapt syntax to your language — principles apply universally.

---

## Naming

**Be explicit, not clever.**

| Pattern | Bad | Good |
|---------|-----|------|
| Functions / methods | `doThing()` | `calculateRetryDelay()` |
| Booleans | `flag`, `check`, `ok` | `isAuthenticated`, `hasPermission` |
| Collections | `data`, `list`, `items` | `activeUsers`, `pendingOrders` |
| Event handlers | `handle()`, `click()` | `handlePaymentFailure()` |
| Generic variables | `x`, `temp`, `val` | `retryAttempt`, `expiresAt` |

Rules:
- Name by **what it is or does**, not how it works internally.
- Avoid abbreviations unless universally known in the domain (`id`, `url`, `db`, `ctx`).
- **Consistency with the existing codebase takes priority** over personal preference.
- Before naming something new, search the codebase for similar patterns.

---

## Docstrings

Every function, method, and class **must** have a docstring or doc comment.
Use the idiomatic format for your language (JSDoc, Python docstrings, GoDoc, rustdoc, etc.).

A good docstring covers:
1. **What** it does — one clear sentence
2. **Parameters** — name, type, what it represents
3. **Return value** — type and what it represents
4. **Side effects** — writes to DB, emits events, mutates external state
5. **Exceptions / errors** it may raise or return
6. **Why** any non-obvious behavior exists

**Python:**
```python
def calculate_retry_delay(attempt: int, base_ms: int = 100) -> int:
    """
    Calculate exponential backoff delay for a retry attempt.

    Uses base_ms * 2^attempt, capped at 30 seconds to prevent
    excessive wait on repeated failures.

    Args:
        attempt: Zero-indexed retry attempt number.
        base_ms: Base delay in milliseconds. Defaults to 100.

    Returns:
        Delay in milliseconds, capped at 30_000.

    Raises:
        ValueError: If attempt is negative.
    """
```

**TypeScript / JavaScript (JSDoc):**
```typescript
/**
 * Merges two permission sets, giving precedence to explicit denies.
 *
 * When the same key exists in both sets, "deny" always wins over "allow"
 * to enforce least-privilege by default.
 *
 * @param base - Default permission set (e.g. role-level).
 * @param overrides - User-specific overrides applied on top of base.
 * @returns Merged PermissionSet with deny-wins resolution.
 */
function mergePermissions(base: PermissionSet, overrides: PermissionSet): PermissionSet
```

**Go:**
```go
// chunkSlice splits a slice into chunks of at most size elements.
// The last chunk may be smaller if len(s) is not evenly divisible.
//
// Returns nil if s is empty. Panics if size <= 0.
func chunkSlice[T any](s []T, size int) [][]T
```

**Rust:**
```rust
/// Splits a slice into chunks of at most `size` elements.
///
/// The last chunk may be smaller than `size` if the slice length
/// is not evenly divisible. Returns an empty iterator if `s` is empty.
///
/// # Panics
/// Panics if `size` is zero.
///
/// # Examples
/// ```
/// let chunks: Vec<_> = chunk_slice(&[1, 2, 3, 4, 5], 2).collect();
/// assert_eq!(chunks, vec![&[1, 2][..], &[3, 4], &[5]]);
/// ```
pub fn chunk_slice<T>(s: &[T], size: usize) -> impl Iterator<Item = &[T]>
```

---

## Inline Comments

Add an inline comment when:

**1. Magic number or constant:**

Python:
```python
MAX_RETRIES = 5  # SLA-agreed limit before alerting on-call
```
Go:
```go
const maxRetries = 5 // SLA-agreed limit before alerting on-call
```
Rust:
```rust
const MAX_RETRIES: u32 = 5; // SLA-agreed limit before alerting on-call
```

**2. Non-obvious algorithm step:**

Python:
```python
# Rotate left by 1 to align with the expected RLE encoding format
encoded = (value << 1) | (value >> 7)
```
Go:
```go
// Rotate left by 1 to align with the expected RLE encoding format
encoded := (value << 1) | (value >> 7)
```

**3. Workaround or known limitation:**

Python:
```python
# TODO(#1234): stdlib json doesn't handle NaN; strip before serializing
clean = {k: v for k, v in data.items() if v == v}
```
Rust:
```rust
// FIXME(#1234): serde_json silently drops NaN; normalize before serializing
let clean: HashMap<_, _> = data.into_iter().filter(|(_, v)| v.is_finite()).collect();
```

**4. Non-obvious business logic:**

Python:
```python
# Free tier capped at 10 exports/day; quota resets at UTC midnight
if user.tier == "free" and user.exports_today >= 10:
    raise QuotaExceededError
```
Go:
```go
// Free tier capped at 10 exports/day; quota resets at UTC midnight
if user.Tier == "free" && user.ExportsToday >= 10 {
    return ErrQuotaExceeded
}
```

**Do NOT restate what the code says:**
```python
i += 1  # ❌ increment i by 1
i += 1  # ✅ skip the header row
```

---

## Structure

- One function = one concern. If it needs a long comment to explain what it does, consider splitting it.
- Don't extract single-use helpers prematurely — inline unless the helper is reused or has a meaningful standalone name.
- Keep related code together. Readers should not scroll far to understand a flow.

---

## Checklist

```
- [ ] All new functions, methods, classes have docstrings
- [ ] Inline comments on complex or non-obvious logic
- [ ] No debug statements (console.log, print, debugger, pp, var_dump, dbg!)
- [ ] No hardcoded secrets or environment-specific values
- [ ] Names consistent with existing codebase conventions
- [ ] No changes outside the scope of the current task
```
