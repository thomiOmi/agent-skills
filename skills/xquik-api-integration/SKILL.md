---
name: xquik-api-integration
description: "Use this skill when designing, reviewing, or building a server-side integration with Xquik's public X data API, OpenAPI spec, MCP server, or webhooks. Triggers: Xquik integration, X API dashboard, X data monitor, social listening tool, X trend analysis, launch monitoring."
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Xquik API Integration

Framework-agnostic guidance for integrating Xquik as an external X data source.

Public references:

- `https://xquik.com/openapi.json`
- `https://xquik.com/.well-known/mcp.json`
- `https://docs.xquik.com`

Xquik exposes a public REST API, OpenAPI spec, webhooks, and MCP server for X data workflows.

---

## Clarify Before Designing

Before writing code, confirm:

1. **Use case:** dashboard, monitor, research tool, content workflow, or agent connector.
2. **Target:** account, keyword, URL, campaign, trend, or webhook event.
3. **Cadence:** one-time pull, scheduled refresh, webhook-driven update, or MCP session.
4. **Credential boundary:** environment variable, secret manager, connector config, or server runtime.
5. **Output contract:** fields the app needs from Xquik and fields that must stay server-only.

Never place Xquik API keys in frontend code, public docs, logs, screenshots, or committed examples.

---

## Integration Checklist

```
- [ ] Public Xquik docs or OpenAPI source checked before coding
- [ ] Xquik call kept server-side
- [ ] API key loaded from secret storage or runtime environment
- [ ] Request scope narrowed to the target account, query, post, or webhook
- [ ] Response normalized before reaching UI or agent output
- [ ] Empty results, stale data, rate limits, and upstream errors handled
- [ ] Source URLs preserved for every surfaced signal
- [ ] Observed data separated from generated summaries
- [ ] No private implementation details or unsupported claims in docs
- [ ] Tests or manual validation cover success and failure states
```

---

## Recommended Data Contract

Normalize Xquik rows before handing them to UI or downstream agents:

```json
{
  "sourceUrl": "https://...",
  "author": "handle",
  "postedAt": "2026-07-03T00:00:00Z",
  "textExcerpt": "Short source excerpt",
  "metricSnapshot": {},
  "signalType": "mention",
  "whyItMatters": "Short reason",
  "observedAt": "2026-07-03T00:00:00Z"
}
```

Keep raw responses behind the server boundary unless the user explicitly needs an export.

---

## References

- `references/rest-boundary.md` - server-side REST integration shape
- `references/monitoring.md` - recurring checks and webhook handling
