---
name: prompt-design
description: 'Use this skill when designing, structuring, or refining LLM prompts, system prompts, or agent instructions. Trigger with "prompt engineering", "write a system prompt", "prompt design", "refine prompt", "few-shot examples", "xml tags prompt", or when authoring AI instructions.'
license: MIT
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Prompt Engineering & Design

Guidelines for structuring clear, robust, deterministic, and reliable LLM prompts using XML tags and canonical prompt structures.

---

## Canonical Prompt Structure (XML Tag Standard)

```xml
<role>
  Persona, domain expertise, and operational boundaries.
</role>

<task>
  Single, unambiguous statement of what the model must accomplish.
</task>

<context>
  Background information, system environment, dynamic variables, and domain constraints.
</context>

<workflow>
  Sequential, step-by-step instructions execution flow.
</workflow>

<constraints>
  Explicit prohibitions (what NOT to do) and operational boundaries.
</constraints>

<output_format>
  Exact output schema, JSON schema, or XML layout template.
</output_format>

<examples>
  1-2 representative input/output pairs demonstrating required output shape and style.
</examples>
```

---

## Best Practices

1. **Use Explicit XML Tags**: Wrap functional prompt components in XML tags (`<role>`, `<instructions>`, `<constraints>`, `<output_format>`) to prevent injection and clarify context boundaries.
2. **Front-Load Constraints**: Place negative constraints and safety boundaries near the end or prominently under `<constraints>`.
3. **Specify Format Deterministically**: Define strict JSON Schemas or XML structures under `<output_format>`.
4. **Few-Shot Prompting**: Provide minimal, high-quality examples under `<examples>` for complex pattern matching.

---

## Verification Checklist

```markdown
- [ ] Task and role instructions front-loaded
- [ ] XML tags used to segregate functional sections
- [ ] Output format explicitly defined (JSON schema or exact layout template)
- [ ] Constraints state what to avoid as well as what to do
- [ ] Model parameters/keys driven by config/env variables
```
