---
name: prompt-design
description: 'Use this skill when designing, structuring, or refining LLM prompts, system prompts, or agent instructions. Trigger with "prompt engineering", "write a system prompt", "prompt design", "refine prompt", "few-shot examples", or when authoring AI instructions. Do not write complex prompts without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Prompt Engineering & Design

Guidelines for structuring clear, robust, and reliable LLM prompts.

---

## Canonical Prompt Structure

```text
ROLE (optional)
  Persona and domain expertise.

TASK
  One specific description of what the model must do.

CONTEXT
  Background information and dynamic variables.

CONSTRAINTS
  Explicit limits (e.g. "Do not explain", "Under 150 words").

OUTPUT FORMAT
  Exact schema or template (e.g. "Respond with valid JSON only").

EXAMPLES (optional)
  1-2 representative input/output pairs.
```

---

## Verification Checklist

```markdown
- [ ] Task and role instructions front-loaded
- [ ] Output format explicitly defined
- [ ] Constraints state what to avoid as well as what to do
- [ ] Model name configurable via environment variable (not hardcoded)
```
