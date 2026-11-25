---
name: structured-output
description: 'Use this skill when requesting JSON output, function/tool calling schemas, or programmatically parsing LLM responses. Trigger with "structured output", "JSON mode", "function calling", "tool calling", "JSON schema", "defensive parsing", or when parsing LLM outputs. Do not write response parsing logic without this skill loaded.'
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Structured Output & Response Parsing

Guidelines for enforcing structured schemas and defensively parsing LLM outputs.

---

## Defensive Parsing Steps

1. Trim leading/trailing whitespace.
2. Strip markdown fences (```json ... ```) if present.
3. Parse string with error handling (`try/catch`).
4. Validate required fields and types against schema (e.g., Zod).
5. Log raw string on parse failure (never swallow error silently).

---

## Common Pitfalls

1. **Retrying blindly**: Retrying a parse without logging the raw response hides the actual failure cause. Always capture the raw string first.
2. **Trusting type coercion**: `"false"` (string), `"0"` (string), and empty strings are truthy or coerce unexpectedly. Validate types explicitly, never rely on truthiness checks.
3. **Assuming JSON mode guarantees validity**: Provider JSON modes reduce but do not eliminate malformed output. Keep defensive parsing even when JSON mode is enabled.
4. **Ignoring streaming**: Streamed responses can be partial or chunk-split mid-token. Accumulate the full stream before parsing.
5. **Schema drift**: Prompts and schemas evolve separately, so the model output lags schema changes. Version schemas alongside prompts and test them together.

---

## Verification Checklist

```markdown
- [ ] Response parsing wrapped in try/catch block
- [ ] Markdown fences handled gracefully
- [ ] Schema validation applied to parsed object
- [ ] Raw response logged on parse failure
```
