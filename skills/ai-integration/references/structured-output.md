# Structured Output

## Request JSON Explicitly

```python
prompt = """
Extract the following fields from the invoice text.
Respond ONLY with valid JSON. No explanation, no markdown fences.

Schema:
{
  "vendor": string,
  "amount_cents": integer,
  "date": "YYYY-MM-DD",
  "line_items": [{ "description": string, "amount_cents": integer }]
}

Invoice text:
{invoice_text}
"""
```

## Parse Defensively

```python
try:
    clean = response.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(clean)
except json.JSONDecodeError as e:
    logger.error(f"Failed to parse model response: {response!r}")
    raise
```

## Use Native Structured Output When Available

```python
# Anthropic — tool use for structured output
response = client.messages.create(
    model="claude-sonnet-4-5",
    tools=[{
        "name": "extract_invoice",
        "description": "Extract invoice fields",
        "input_schema": {
            "type": "object",
            "properties": {
                "vendor": { "type": "string" },
                "amount_cents": { "type": "integer" }
            },
            "required": ["vendor", "amount_cents"]
        }
    }],
    tool_choice={"type": "tool", "name": "extract_invoice"},
    messages=[{ "role": "user", "content": prompt }]
)
```
