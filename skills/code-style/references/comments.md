# Inline Comments — When and How

## When to add an inline comment

**1. Magic number or constant:**
```python
MAX_RETRIES = 5  # SLA-agreed limit before alerting on-call
```
```go
const maxRetries = 5 // SLA-agreed limit before alerting on-call
```

**2. Non-obvious algorithm step:**
```python
# Rotate left by 1 to align with expected RLE encoding format
encoded = (value << 1) | (value >> 7)
```

**3. Workaround or known limitation:**
```python
# TODO(#1234): stdlib json doesn't handle NaN; strip before serializing
clean = {k: v for k, v in data.items() if v == v}
```
```rust
// FIXME(#1234): serde_json silently drops NaN; normalize before serializing
let clean: HashMap<_, _> = data.into_iter().filter(|(_, v)| v.is_finite()).collect();
```

**4. Non-obvious business logic:**
```python
# Free tier capped at 10 exports/day; quota resets at UTC midnight
if user.tier == "free" and user.exports_today >= 10:
    raise QuotaExceededError
```
```go
// Free tier capped at 10 exports/day; quota resets at UTC midnight
if user.Tier == "free" && user.ExportsToday >= 10 {
    return ErrQuotaExceeded
}
```

## Anti-pattern — never restate what the code says

```python
i += 1  # ❌ increment i by 1
i += 1  # ✅ skip the header row
```
