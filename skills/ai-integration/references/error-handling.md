# Error Handling

LLM API calls fail in ways that differ from typical HTTP calls.
Always implement retry logic and handle each failure type explicitly.

---

## Failure Types

| Failure | Cause | Action |
| --------- | ------- | -------- |
| Rate limit error | Too many requests | Retry with exponential backoff |
| Server error (5xx) | Provider outage or overload | Retry with exponential backoff |
| Client error (4xx) | Bad request, invalid API key, quota exceeded | Do not retry — fix the request |
| Timeout | Response took too long | Retry once, then fail gracefully |
| Empty response | Model returned nothing | Validate before using, retry if critical |
| Malformed output | Model did not follow the format | Re-prompt or parse defensively |
| Context window exceeded | Input is too long | Chunk the input or summarize history |

---

## Exponential Backoff Pattern

```text
FUNCTION call_with_retry(request, max_retries):

  FOR attempt FROM 0 TO max_retries - 1:

    TRY:
      response = call_api(request)
      RETURN response

    CATCH rate_limit_error:
      wait = 2 ^ attempt seconds
      log("Rate limited. Retry {attempt + 1}/{max_retries} in {wait}s")
      sleep(wait)

    CATCH server_error (status >= 500):
      wait = 2 ^ attempt seconds
      log("Server error {status}. Retry {attempt + 1}/{max_retries} in {wait}s")
      sleep(wait)

    CATCH client_error (status 4xx):
      log("Client error {status}. Not retrying.")
      RAISE  ← do not retry client errors

  RAISE "API call failed after {max_retries} attempts"
```

---

## Context Window Management

When conversation history is too long to fit in the context window:

```text
STRATEGY 1 — Truncate oldest messages
  Remove the oldest messages first.
  Always preserve the system prompt.
  Preserve the most recent N exchanges.

STRATEGY 2 — Summarize history
  Summarize the oldest portion of the conversation into one message.
  Replace the original messages with the summary.
  This preserves more context than truncation.

STRATEGY 3 — Sliding window
  Keep only the last N messages.
  Simple but loses all early context.
```

---

## Rules

- Never silently catch and ignore an LLM API error.
- Always log the failure reason, attempt number, and raw response.
- Do not retry client errors (4xx) — they indicate a problem with the request itself.
- Set an explicit timeout on every API call.
- Validate the response before using it — do not assume a successful status means a usable response.
