---
name: api-conventions
description: Use this skill when designing, reviewing, or documenting any API — REST, GraphQL, or WebSocket. Triggers: "add an endpoint", "design the API", "add a route", "GraphQL schema", "WebSocket", "response format". Read the existing API surface before designing anything new.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# API Conventions

Framework-agnostic guidelines for clean, consistent, evolvable APIs.

## Before You Design

1. Who is the consumer? (internal service, public client, mobile app)
2. What resource or action does this represent?
3. Does something similar already exist? (read the codebase first)
4. Which protocol fits? → see `references/protocol-choice.md`

**Do not design in isolation — read the existing API surface first.**

See `references/rest.md` for REST conventions, status codes, and versioning.
See `references/graphql.md` for GraphQL schema design and mutation patterns.
See `references/websocket.md` for WebSocket message envelope and rules.
See `references/field-conventions.md` for dates, IDs, money, and naming.

---

## Review Checklist

```
- [ ] Protocol choice justified (REST vs GraphQL vs WebSocket)
- [ ] REST: resource name is noun, plural, consistent with existing API
- [ ] REST: HTTP method matches operation semantics
- [ ] REST: response uses standard envelope shape
- [ ] REST: status codes correct (no 200 for errors)
- [ ] GraphQL: mutation uses payload + errors pattern
- [ ] GraphQL: paginated lists use connection types
- [ ] WebSocket: message envelope is consistent
- [ ] Dates are ISO 8601 UTC
- [ ] Breaking changes are versioned
- [ ] Endpoint / type is documented
- [ ] No duplication with existing API surface
```
