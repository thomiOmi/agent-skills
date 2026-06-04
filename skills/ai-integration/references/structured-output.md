# Structured Output

When the response will be parsed programmatically, always request structured output explicitly.

---

## Requesting Structured Output

In the prompt, instruct the model to return only the format — no explanation, no markdown fences.

```text
PROMPT INSTRUCTION:
  Respond with valid JSON only.
  Do not include any explanation, preamble, or markdown code fences.

  Required schema:
  {
    "field_one": string,
    "field_two": integer,
    "field_three": ["string"]
  }
```

---

## Parsing Defensively

Always parse model output inside a try/catch block.
Never assume the output will be perfectly formatted.

Steps:

1. Trim whitespace from the response.
2. Strip any markdown code fences if present (`\`\`\`json` ... `\`\`\``).
3. Parse the cleaned string.
4. Validate that required fields are present and have the expected types.
5. If parsing fails, log the raw response for debugging before raising an error.

---

## Using Native Structured Output APIs

Most LLM providers offer a way to enforce structured output at the API level.
This is more reliable than prompting alone.

Common approaches:

- **Tool use / function calling**: define a schema the model must fill. The response is guaranteed to match the schema.
- **JSON mode**: instructs the model to return valid JSON. Does not enforce a specific schema.
- **Response format parameter**: some providers accept a JSON schema directly.

Prefer tool use / function calling over prompt-only JSON when the structure is critical.

---

## Rules

- Never parse model output without a try/catch.
- Log the raw response when parsing fails — do not swallow the error silently.
- Validate required fields after parsing — the model may omit them.
- Do not trust field types from the parsed output without checking — strings may come back as numbers.
