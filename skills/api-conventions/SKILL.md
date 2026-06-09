---
name: api-conventions
description: Use this skill when designing, reviewing, or auditing any API — REST, GraphQL, or WebSocket. Triggers: "add an endpoint", "design the API", "review all routes", "audit API consistency", "check response format", "are the endpoints consistent", "review the API surface". Read the existing API surface before designing anything new.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# API Conventions

Framework-agnostic guidelines for clean, consistent, evolvable APIs.

---

## Clarify Before Designing

Before writing any endpoint, schema, or response shape, confirm:

1. **Who is the consumer?** (internal service, public client, mobile app)
2. **Does something similar already exist?** (read the codebase first — do not duplicate)
3. **Which protocol fits?** see `references/protocol-choice.md`
4. **What is the success response format?** ask the user or check project AGENTS.md
5. **What is the error/problem response format?** ask the user or check project AGENTS.md
6. **What naming convention for JSON keys?** ask the user or check existing endpoints
7. **What date/time format?** ask the user — ISO 8601, MySQL YYYY-MM-DD HH:mm:ss, Unix timestamp, or other

For questions 4–7: if not defined in project AGENTS.md, ask before proceeding.
See `references/field-conventions.md` for full clarification checklist and format options.

---

## References

- `references/protocol-choice.md` — REST vs GraphQL vs WebSocket
- `references/rest.md` — URLs, HTTP methods, status codes, versioning
- `references/graphql.md` — schema design, mutation payload pattern
- `references/websocket.md` — message envelope, auth, reconnection
- `references/field-conventions.md` — response formats, date formats, naming clarification

---

## Review Checklist

```
- [ ] Success and error response format confirmed
- [ ] Date/time format confirmed
- [ ] JSON key naming convention confirmed
- [ ] Protocol choice justified (REST vs GraphQL vs WebSocket)
- [ ] REST: resource name is noun, plural, consistent with existing API
- [ ] REST: HTTP method matches operation semantics
- [ ] REST: status codes correct (no 200 for errors, no 500 for client errors)
- [ ] REST: 204 responses have no body
- [ ] GraphQL: mutation uses payload + errors pattern
- [ ] GraphQL: paginated lists use connection types
- [ ] WebSocket: message envelope is consistent
- [ ] Breaking changes are versioned
- [ ] Endpoint is documented
- [ ] No duplication with existing API surface
```
