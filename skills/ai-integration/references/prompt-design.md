# Prompt Design

## Structure (always in this order)

```
1. Role / persona (optional)
2. Task description
3. Context — relevant information
4. Constraints — format, length, what to avoid
5. Output format — exact structure expected
6. Examples — few-shot if task is non-obvious
```

## Template

```
You are a [role] that [brief description].

## Task
[Clear, specific description of what to do]

## Context
[Relevant documents, data, or user input]

## Constraints
- [e.g. Respond in the same language as the user]
- [e.g. Keep the response under 200 words]
- [e.g. Do not make up information not in the context]

## Output format
[Exact format: JSON schema, markdown structure, plain text]

## Examples
Input: [example]
Output: [example]
```

## Rules

```
✅ Be specific — vague prompts produce vague outputs
✅ Tell the model what NOT to do, not just what to do
✅ Use few-shot examples for non-obvious output formats
✅ Ask for step-by-step reasoning for complex tasks
✅ Put critical instructions near the top — not buried at the end
❌ Do not rely on the model to "figure out" implicit requirements
❌ Do not use the same prompt for different model families without testing
```
