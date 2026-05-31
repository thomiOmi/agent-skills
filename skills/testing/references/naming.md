# Test Naming Patterns

Name tests so the failure message tells you exactly what broke without reading the code.
Complete the sentence: *"It should..."*

```python
# Python (pytest)
def test_calculate_retry_delay_returns_exponential_backoff(): ...
def test_calculate_retry_delay_caps_at_30_seconds(): ...
def test_calculate_retry_delay_raises_for_negative_attempt(): ...
```

```typescript
// TypeScript (vitest / jest)
it("returns exponential backoff delay for each attempt")
it("caps delay at 30 seconds regardless of attempt count")
it("throws for negative attempt numbers")
```

```go
// Go
func TestRetryDelay_ExponentialBackoff(t *testing.T) {}
func TestRetryDelay_CapsAt30Seconds(t *testing.T)    {}
func TestRetryDelay_NegativeAttempt_Panics(t *testing.T) {}
```

```php
// PHP (Pest)
it('returns exponential backoff delay for each attempt');
it('caps delay at 30 seconds regardless of attempt count');
it('throws for negative attempt numbers');
```

Avoid: `test_1`, `test_thing`, `test_works`, names describing implementation.
