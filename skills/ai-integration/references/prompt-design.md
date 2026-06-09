# Prompt Design

## Structure

A well-structured prompt has these sections in this order:

```
ROLE (optional)
  Describe the persona the model should adopt.
  Use when tone, domain expertise, or communication style matters.

TASK
  One clear description of what the model must do.
  Be specific. Vague tasks produce vague output.
  State the action, the subject, and the format of the result.

CONTEXT
  All information the model needs to complete the task.
  Include only what is relevant.
  Use variables for dynamic content: {user_input}, {document}, {history}

CONSTRAINTS
  What the model must not do, or limits it must respect.
  Examples:
  - Respond only in the language of the user's message
  - Keep the response under 150 words
  - Do not include information not present in the provided context

OUTPUT FORMAT
  The exact structure of the expected response.
  For JSON: provide the schema with field names and types.
  For structured text: provide a template with placeholders.
  Always say: "Respond with valid JSON only. No explanation. No markdown fences."

EXAMPLES (optional)
  One or two input/output pairs demonstrating the expected behavior.
  Use when the output format is non-obvious or precision is critical.
```

---

## Model Configuration

Never hardcode a model name in prompt code.
Read the model identifier from an environment variable or configuration file.

```
Config file or environment variable:
  LLM_PROVIDER = "anthropic"    (or "openai", "google", "mistral", etc.)
  LLM_MODEL    = "[model-id]"   (set by the operator, not the developer)
  LLM_API_KEY  = "[key]"        (always from environment, never hardcoded)
```

This allows the operator to switch models or providers without changing code.

---

## Rules

- Critical instructions belong near the top — not buried at the end.
- Tell the model what to avoid, not just what to do.
- Request step-by-step reasoning for tasks requiring multi-step logic.
- Specify the output format explicitly — do not assume the model will infer it.
- Do not use the same prompt across different model families without testing.
- For structured output: always instruct the model to return only the format, with no preamble.
- Test prompts with the actual model being used — behavior varies between providers and versions.

---

## Clarify Before Writing Prompts

Before writing any prompt, answer:
1. What task must the model perform?
2. What information does the model need?
3. What is the exact output format the calling code expects?
4. What should the model say when it cannot answer from the provided context?
5. Which provider and model is configured for this project?
