# Prompt Design

Prompt structure (ROLE/TASK/CONTEXT/CONSTRAINTS/OUTPUT FORMAT/EXAMPLES
layout) is owned by the `prompt-design` skill - load that skill for the
canonical structure (XML tag standard) and examples. Do not duplicate
the template here; the sections below are ai-integration-specific
additions on top of it.

---

## Model Configuration

Never hardcode a model name in prompt code.
Read the model identifier from an environment variable or configuration file.

```text
Config file or environment variable:
  LLM_PROVIDER = "anthropic"    (or "openai", "google", "mistral", etc.)
  LLM_MODEL    = "[model-id]"   (set by the operator, not the developer)
  LLM_API_KEY  = "[key]"        (always from environment, never hardcoded)
```

This allows the operator to switch models or providers without changing code.

---

## Rules

- Critical instructions belong near the top - not buried at the end.
- Tell the model what to avoid, not just what to do.
- Request step-by-step reasoning for tasks requiring multi-step logic.
- Specify the output format explicitly - do not assume the model will infer it.
- Do not use the same prompt across different model families without testing.
- For structured output: always instruct the model to return only the format, with no preamble.
- Test prompts with the actual model being used - behavior varies between providers and versions.

---

## Clarify Before Writing Prompts

Before writing any prompt, answer:

1. What task must the model perform?
2. What information does the model need?
3. What is the exact output format the calling code expects?
4. What should the model say when it cannot answer from the provided context?
5. Which provider and model is configured for this project?
