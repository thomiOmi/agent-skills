# Error Handling and Retry Logic

## Retry with Exponential Backoff

```python
import time

def call_with_retry(client, params, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.messages.create(**params)
        except RateLimitError:
            wait = 2 ** attempt
            time.sleep(wait)
        except APIStatusError as e:
            if e.status_code >= 500:
                time.sleep(2 ** attempt)
            else:
                raise  # 4xx — do not retry
    raise RuntimeError(f"API call failed after {max_retries} attempts")
```

## Always Handle

```
- Rate limit errors → exponential backoff + retry
- Server errors (5xx) → retry with backoff
- Client errors (4xx) → do not retry, fix the request
- Timeout → set explicit timeout, handle gracefully
- Empty or malformed response → validate before using
- Context window exceeded → chunk input or summarize
```
