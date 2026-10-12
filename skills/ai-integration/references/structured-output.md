# Structured Output

When the response will be parsed programmatically, always request structured output explicitly.

---

## Requesting Structured Output

In the prompt, instruct the model to return only the format - no explanation, no markdown fences.

```text
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

Defensive parsing (trim whitespace, strip markdown fences, parse with error
handling, validate fields, log raw response on failure) is owned by the
`structured-output` skill - load that skill for the parsing steps and
common pitfalls. Do not duplicate them here.

---

## Using Native Structured Output APIs

Most LLM providers offer API-level structured output enforcement.
This is more reliable than prompting alone.

Common approaches by provider:

| Provider       | Mechanism                                  | Notes                                                  |
| -------------- | ------------------------------------------ | ------------------------------------------------------ |
| Anthropic      | Tool use / function calling                | Define a schema; response is guaranteed to match       |
| OpenAI         | `response_format: { type: "json_schema" }` | Enforces a specific JSON schema                        |
| Google         | `responseMimeType: "application/json"`     | Returns valid JSON                                     |
| Most providers | JSON mode                                  | Returns valid JSON, does not enforce a specific schema |

**Prefer tool use / function calling over prompt-only JSON** when the output structure is critical.
Check the documentation for the provider configured in your project.

---

## Rules

- Never parse model output without error handling.
- Log the raw response when parsing fails - do not swallow the error silently.
- Validate required fields after parsing - the model may omit them.
- Do not trust field types from the parsed output - validate each field.
- Use native structured output APIs when available - they are more reliable than prompting.
