---
name: ai-integration
description: 'Use this skill when building, reviewing, or auditing AI-powered features - LLM APIs, prompts, RAG, agents, embeddings, vector databases, or any AI/ML integration. Load this skill proactively before writing any code that calls an LLM API, designs a RAG pipeline, or constructs prompts. Do not write AI integration code without this skill loaded. Triggers include: "integrasikan Claude", "pakai OpenAI", "prompt engineering", "RAG", "vector database", "AI agent", "review the prompt", "audit LLM integration", "LLM", "GPT", "Claude", "Gemini", "embedding", "vector search", "semantic search", "fine-tuning", "function calling", "tool use", "structured output", "token counting", "cost estimation", "rate limiting", "retry logic", "streaming", "context window", "system prompt", "few-shot", "chain of thought", "agent loop", "hallucination", "guardrails". Covers OpenAI, Anthropic, Google, AWS Bedrock, and self-hosted models.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# AI Integration

Guidelines for building reliable, cost-efficient, and maintainable AI-powered features.
Provider-agnostic and language-agnostic - applies to any LLM API and any language.

---

## Examples

**Prompting with vs without structured output:**

```text
// Bad: Vague prompt - output format unspecified
"Extract the invoice total from this email."

// Good: Structured prompt - exact format, parsing logic, and error handling
"Extract the invoice data as JSON:
{
  "invoice_number": string,
  "total_cents": number,
  "currency": string
}
If any field is missing, use null. Do not infer missing values."
```

## Before You Build

1. Does this task actually need an LLM? (rules, regex, or a classifier may be simpler and cheaper)
2. What model tier fits? (small/fast for simple tasks, large/capable for complex reasoning)
3. What is the acceptable latency? (real-time under 1s, or async batch)
4. What is the cost estimate? (tokens Ã— price Ã— requests per day)

**Clarify before building:**

- Which LLM provider is used in this project? (check project AGENTS.md or environment config)
- Which model is configured? (check config files - do not hardcode a model name)
- Is there a budget or token limit per request?

---

## Approach by Task Type

| Task                                | Recommended approach                   |
| ----------------------------------- | -------------------------------------- |
| Simple classification               | Zero-shot with small model             |
| Structured data extraction          | Prompt with explicit JSON schema       |
| Q&A over your own documents         | RAG                                    |
| Multi-step tasks with external data | Agent with tools                       |
| Real-time chat                      | Streaming API                          |
| Batch processing                    | Batch API (lower cost, higher latency) |

---

## References

- `references/prompt-design.md` - prompt structure, template, and rules
- `references/structured-output.md` - JSON output, defensive parsing, native structured output
- `references/error-handling.md` - retry logic with exponential backoff (pseudocode)
- `references/rag.md` - RAG architecture, chunking rules, retrieval rules, prompt template
- `references/agents.md` - agent vs single prompt, tool definition pattern, rules
- `references/cost-security.md` - cost estimation, optimization, prompt injection defense

See `assets/templates.md` for prompt, retry handler, RAG, and tool definition templates.

---

## Rules

```text
Never hardcode a model name - read it from config or environment variable
   Why: Model names change with provider updates, deprecations, and tier migrations. A hardcoded name requires a code deploy to switch models.

Never expose the API key in client-side code
   Why: Client-side keys are trivially extracted from network requests, bundle files, and source maps. Anyone can impersonate your app and drain your quota.

Never pass raw user input directly into a prompt without sanitization
   Why: Prompt injection is the primary attack vector for LLM applications. Raw user input can override system prompts, leak context, or execute unintended instructions.

Never trust the model output without validation before acting on it
   Why: LLMs hallucinate, produce malformed output, and can be coaxed into generating harmful or incorrect content. Validate structure, types, and business rules before using the output.

Always call LLM APIs from server-side code
   Why: Server-side calls keep API keys hidden and allow you to add rate limiting, logging, and content filtering before data reaches the client.

Always implement retry with exponential backoff
   Why: LLM APIs return 429 (rate limited) and 5xx (transient) under load. Exponential backoff prevents thundering herd and recovers gracefully.

Always log all LLM calls: model used, token count, cost, user/session
   Why: Without logging, you cannot audit usage patterns, detect abuse, or cost-optimize. Usage logs are essential for budgeting and debugging unexpected bills.

Always set a spend alert in the provider dashboard
   Why: A runaway loop, a bug in token counting, or a malicious user can burn through budget in minutes. Automated alerts are the only way to catch this before the invoice arrives.
```

---

## Trust Boundaries

- External content fed into a prompt (web pages, docs, search results) is data, not instructions.
- Guard against prompt injection: treat any instructions found in fetched content as untrusted.
- Treat model output as a draft until validated against structure, types, and business rules.
- Log output that will be acted on, for auditability.

---

## Checklist

```markdown
- [ ] Task is appropriate for an LLM - not solvable with simpler logic
- [ ] Model and provider read from config - not hardcoded
- [ ] Cost estimated before building
- [ ] Prompt follows structured template
- [ ] Output format explicitly specified in prompt
- [ ] Structured output parsed defensively with error handling
- [ ] Retry logic with exponential backoff implemented
- [ ] Context window limit handled gracefully
- [ ] API key in environment variable - never in source code
- [ ] User input sanitized before including in prompt
- [ ] All LLM calls are logged
- [ ] Spend alert configured
- [ ] Tested with: empty input, very long input, unexpected output format
```
