# Structured Output

When the response will be parsed programmatically, always request structured output explicitly.

---

## Requesting Structured Output

In the prompt, instruct the model to return only the format — no explanation, no markdown fences.

```
PROMPT INSTRUCTION:
  Respond with valid JSON only.
  Do not include any explanation, preamble, or markdown code fences.

  Required schema:
  {
    "field_one": "string value",
    "field_two": 0,
    "field_three": ["string"]
  }
```

---

## Parsing Defensively

Always parse model output inside error handling.
Never assume the output will be perfectly formatted.

Steps:
1. Trim whitespace from the response.
2. Strip any markdown code fences if present.
3. Parse the cleaned string as JSON.
4. Validate that required fields are present and have the expected types.
5. If parsing fails, log the raw response before raising an error — never swallow it silently.

---

## Using Native Structured Output APIs

Most LLM providers offer API-level structured output enforcement.
This is more reliable than prompting alone.

Common approaches by provider:

| Provider | Mechanism | Notes |
|----------|-----------|-------|
| Anthropic | Tool use / function calling | Define a schema; response is guaranteed to match |
| OpenAI | `response_format: { type: "json_schema" }` | Enforces a specific JSON schema |
| Google | `responseMimeType: "application/json"` | Returns valid JSON |
| Most providers | JSON mode | Returns valid JSON, does not enforce a specific schema |

**Prefer tool use / function calling over prompt-only JSON** when the output structure is critical.
Check the documentation for the provider configured in your project.

---

## Rules

- Never parse model output without error handling.
- Log the raw response when parsing fails — do not swallow the error silently.
- Validate required fields after parsing — the model may omit them.
- Do not trust field types from the parsed output — validate each field.
- Use native structured output APIs when available — they are more reliable than prompting.
