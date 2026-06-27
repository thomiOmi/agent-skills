---
name: ai-integration
description: 'Use this skill when building, reviewing, or auditing AI-powered features — LLM APIs, prompts, RAG, agents, or embeddings. Triggers: "integrasikan Claude", "pakai OpenAI", "prompt engineering", "RAG", "vector database", "AI agent", "review the prompt", "audit LLM integration". Use before writing any code that calls an LLM API.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# AI Integration

Guidelines for building reliable, cost-efficient, and maintainable AI-powered features.
Provider-agnostic and language-agnostic — applies to any LLM API and any language.

---

## Before You Build

1. Does this task actually need an LLM? (rules, regex, or a classifier may be simpler and cheaper)
2. What model tier fits? (small/fast for simple tasks, large/capable for complex reasoning)
3. What is the acceptable latency? (real-time under 1s, or async batch)
4. What is the cost estimate? (tokens × price × requests per day)

**Clarify before building:**
- Which LLM provider is used in this project? (check project AGENTS.md or environment config)
- Which model is configured? (check config files — do not hardcode a model name)
- Is there a budget or token limit per request?

---

## Approach by Task Type

| Task | Recommended approach |
|------|---------------------|
| Simple classification | Zero-shot with small model |
| Structured data extraction | Prompt with explicit JSON schema |
| Q&A over your own documents | RAG |
| Multi-step tasks with external data | Agent with tools |
| Real-time chat | Streaming API |
| Batch processing | Batch API (lower cost, higher latency) |

---

## References

- `references/prompt-design.md` — prompt structure, template, and rules
- `references/structured-output.md` — JSON output, defensive parsing, native structured output
- `references/error-handling.md` — retry logic with exponential backoff (pseudocode)
- `references/rag.md` — RAG architecture, chunking rules, retrieval rules, prompt template
- `references/agents.md` — agent vs single prompt, tool definition pattern, rules
- `references/cost-security.md` — cost estimation, optimization, prompt injection defense

See `assets/templates.md` for prompt, retry handler, RAG, and tool definition templates.

---

## Rules

```
❌ Never hardcode a model name — read it from config or environment variable
❌ Never expose the API key in client-side code
❌ Never pass raw user input directly into a prompt without sanitization
❌ Never trust the model output without validation before acting on it
✅ Always call LLM APIs from server-side code
✅ Always implement retry with exponential backoff
✅ Always log all LLM calls: model used, token count, cost, user/session
✅ Always set a spend alert in the provider dashboard
```

---

## Checklist

```
- [ ] Task is appropriate for an LLM — not solvable with simpler logic
- [ ] Model and provider read from config — not hardcoded
- [ ] Cost estimated before building
- [ ] Prompt follows structured template
- [ ] Output format explicitly specified in prompt
- [ ] Structured output parsed defensively with error handling
- [ ] Retry logic with exponential backoff implemented
- [ ] Context window limit handled gracefully
- [ ] API key in environment variable — never in source code
- [ ] User input sanitized before including in prompt
- [ ] All LLM calls are logged
- [ ] Spend alert configured
- [ ] Tested with: empty input, very long input, unexpected output format
```
