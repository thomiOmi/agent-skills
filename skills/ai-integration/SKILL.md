---
name: ai-integration
description: Use this skill when integrating LLM APIs, building AI-powered features, designing prompts, or working with RAG, agents, or embeddings. Triggers: "integrasikan Claude", "pakai OpenAI", "prompt engineering", "RAG", "vector database", "AI agent", "LLM", "embeddings", "chatbot", "AI feature". Use before writing any code that calls an LLM API.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# AI Integration

Guidelines for building reliable, cost-efficient, and maintainable AI-powered features.

## Before You Build

1. Does this task actually need an LLM? (regex, rules, or simpler logic?)
2. What model size fits? (small/fast vs large/smart)
3. What is the acceptable latency? (real-time < 1s or async?)
4. What is the cost estimate? (tokens × price × requests/day)

See `references/prompt-design.md` for prompt structure and templates.
See `references/structured-output.md` for JSON output and defensive parsing.
See `references/error-handling.md` for retry logic and failure modes.
See `references/rag.md` for RAG architecture, chunking, and retrieval rules.
See `references/agents.md` for agent patterns, tool definitions, and tool use.
See `references/cost-security.md` for cost estimation, caching, and prompt injection defense.

---

## Approach Selection

| Task | Recommended approach |
|------|---------------------|
| Simple classification | Zero-shot with small model |
| Text extraction (structured data) | Prompt + structured output |
| Q&A over your own documents | RAG |
| Multi-step tasks with tools | Agent |
| Real-time chat | Streaming API |
| Batch processing | Batch API (cheaper, slower) |

---

## Checklist

```
- [ ] Task is appropriate for an LLM
- [ ] Model size and cost estimated
- [ ] Prompt follows structured template
- [ ] Output format explicitly specified
- [ ] Structured output parsed defensively with try/catch
- [ ] Retry logic with exponential backoff implemented
- [ ] Context window limit handled gracefully
- [ ] API key in environment variable — never in code
- [ ] User input sanitized before including in prompt
- [ ] Logging in place for all LLM calls
- [ ] Spend alert set in API provider dashboard
- [ ] Tested with edge cases: empty input, very long input, unexpected format
```
