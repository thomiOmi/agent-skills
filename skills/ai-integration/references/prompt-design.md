# Prompt Design

## Structure

A well-structured prompt has these sections in this order:

```
ROLE (optional)
  Describe the persona the model should adopt.
  Use this when tone, domain expertise, or communication style matters.
  Example: "You are a senior software architect reviewing API designs."

TASK
  One clear description of what the model must do.
  Be specific. Vague tasks produce vague output.
  State the action, the subject, and the format of the result.

CONTEXT
  All information the model needs to complete the task.
  Include only what is relevant — do not pad with unnecessary background.
  Use variables for dynamic content: {user_input}, {document}, {history}

CONSTRAINTS
  What the model must not do, or limits it must respect.
  Examples:
  - Respond only in the language of the user's message
  - Keep the response under 150 words
  - Do not include information not present in the provided context

OUTPUT FORMAT
  The exact structure of the expected response.
  Specify JSON schema, markdown structure, or plain text format.
  For JSON: provide the schema with field names and types.
  For structured text: provide a template.

EXAMPLES (optional)
  One or two input/output pairs that demonstrate the expected behavior.
  Use these when the output format is non-obvious or when precision matters.
  Few-shot examples improve output quality significantly for complex tasks.
```

---

## Rules

- Critical instructions belong near the top of the prompt, not buried at the end.
- Tell the model what to avoid, not just what to do — negatives reduce hallucination.
- Request step-by-step reasoning for tasks that require multi-step logic.
- Specify the output format explicitly — do not assume the model will infer it.
- Do not use the same prompt across different model families without testing — behavior varies.
- For structured output: always instruct the model to return only the format, with no preamble or explanation.

---

## Clarification Before Prompting

Before writing a prompt, answer:
1. What task must the model perform?
2. What information does the model need — and what should it not have access to?
3. What is the exact output format the calling code expects?
4. What should the model say when it cannot answer from the provided context?
