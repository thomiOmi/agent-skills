# Docstring Formats by Language

A good docstring covers:
1. **What** it does — one clear sentence
2. **Parameters** — name, type, what it represents
3. **Return value** — type and what it represents
4. **Side effects** — writes to DB, emits events, mutates external state
5. **Exceptions / errors** it may raise or return
6. **Why** any non-obvious behavior exists

---

## Python

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

## TypeScript / JavaScript (JSDoc)

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

## Go

```go
// chunkSlice splits a slice into chunks of at most size elements.
// The last chunk may be smaller if len(s) is not evenly divisible.
//
// Returns nil if s is empty. Panics if size <= 0.
func chunkSlice[T any](s []T, size int) [][]T
```

## Rust

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

## PHP

```php
/**
 * Calculate exponential backoff delay for a retry attempt.
 *
 * Uses base_ms * 2^attempt, capped at 30 seconds to prevent
 * excessive wait on repeated failures.
 *
 * @param int $attempt Zero-indexed retry attempt number.
 * @param int $base_ms Base delay in milliseconds. Defaults to 100.
 * @return int Delay in milliseconds, capped at 30000.
 * @throws \InvalidArgumentException If attempt is negative.
 */
public function calculateRetryDelay(int $attempt, int $base_ms = 100): int
```

## Java / Kotlin

```java
/**
 * Calculates exponential backoff delay for a retry attempt.
 *
 * Uses baseMs * 2^attempt, capped at 30 seconds to prevent
 * excessive wait on repeated failures.
 *
 * @param attempt  Zero-indexed retry attempt number.
 * @param baseMs   Base delay in milliseconds.
 * @return         Delay in milliseconds, capped at 30_000.
 * @throws IllegalArgumentException if attempt is negative.
 */
public int calculateRetryDelay(int attempt, int baseMs)
```
