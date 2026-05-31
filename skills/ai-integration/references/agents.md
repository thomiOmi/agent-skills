# Agents and Tool Use

## When to Use Agent vs Single Prompt

| Single prompt | Agent |
|--------------|-------|
| One clear input → one clear output | Multi-step with branching decisions |
| All context fits in one message | Needs external APIs or tools |
| Deterministic output | Needs to iterate or self-correct |

## Tool Definition Pattern

```python
tools = [
    {
        "name": "search_database",
        "description": "Search the product database. Use when the user asks about specific products or inventory.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": { "type": "string", "description": "Search terms" },
                "limit": { "type": "integer", "default": 5 }
            },
            "required": ["query"]
        }
    }
]
```

## Rules

```
✅ Write clear tool descriptions — the model picks tools based on description
✅ Set a maximum iteration limit — prevent infinite loops
✅ Log every tool call and result for debugging
✅ Validate tool inputs before executing
❌ Do not give agents access to destructive operations without confirmation
❌ Do not use agents for tasks a single prompt can solve
```
