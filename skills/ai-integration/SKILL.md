---
name: ai-integration
description: Use this skill when integrating LLM APIs, building AI-powered features, designing prompts, or working with RAG, agents, or embeddings. Triggers: "integrasikan Claude", "pakai OpenAI", "prompt engineering", "RAG", "vector database", "AI agent", "LLM", "embeddings", "chatbot", "AI feature". Use before writing any code that calls an LLM API.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.1.0"
  author: thomiOmi
---

# AI Integration

Guidelines for building reliable, cost-efficient, and maintainable AI-powered features.

---

## Before You Build

1. Does this task actually need an LLM? (regex, rules, or simpler logic may suffice)
2. What model size fits? (small and fast vs large and capable)
3. What is the acceptable latency? (real-time under 1s or async)
4. What is the cost estimate? (tokens × price × requests per day)

---

## Approach by Task Type

| Task | Recommended approach |
|------|---------------------|
| Simple classification | Zero-shot with small model |
| Text extraction to structured data | Prompt with JSON output schema |
| Q&A over your own documents | RAG |
| Multi-step tasks with external data | Agent with tools |
| Real-time chat | Streaming API |
| Batch processing | Batch API (lower cost, higher latency) |

---

## References

- `references/prompt-design.md` — prompt structure, template, and rules
- `references/structured-output.md` — JSON output, defensive parsing, native structured output
- `references/error-handling.md` — retry logic with exponential backoff
- `references/rag.md` — RAG architecture, chunking rules, retrieval rules, prompt template
- `references/agents.md` — agent vs single prompt, tool definition pattern, rules
- `references/cost-security.md` — cost estimation, optimization, prompt injection defense

See `assets/templates.md` for prompt, retry handler, RAG, and tool definition templates.

---

## Checklist

```markdown
- [ ] Task is appropriate for an LLM — not solvable with simpler logic
- [ ] Model size and cost estimated before building
- [ ] Prompt follows structured template
- [ ] Output format explicitly specified in prompt
- [ ] Structured output parsed defensively with try/catch
- [ ] Retry logic with exponential backoff implemented
- [ ] Context window limit handled gracefully
- [ ] API key stored in environment variable, never in source code
- [ ] User input sanitized before including in prompt
- [ ] All LLM calls are logged (model, tokens, cost, user)
- [ ] Spend alert set in API provider dashboard
- [ ] Tested with edge cases: empty input, very long input, unexpected output format
```
