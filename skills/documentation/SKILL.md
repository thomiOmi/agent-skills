---
name: documentation
description: >
  Use this skill when writing or updating any developer documentation — README,
  changelog, ADR, OpenAPI spec, or setup guides. Triggers: "update the README",
  "write docs", "document this", "changelog entry", "write an ADR", "OpenAPI
  spec". Also apply when a code change clearly requires a documentation update
  even if the user hasn't mentioned it.
license: MIT
compatibility: Designed for OpenCode, Claude Code, Cursor, and similar AI coding agents. No system dependencies required.
metadata:
  version: "1.1.0"
  author: thomiOmi
---

# Documentation

Write for the reader who has zero context from this conversation.
If it only makes sense to you right now, it will confuse someone else — or future you — later.

---

## README

Every project needs a README that answers these in order:

```
1. What is this?    — One paragraph. What it does and who it's for.
2. Quick start      — Minimum steps to run it. Must work copy-paste.
3. Usage            — Common use cases with real examples.
4. Configuration    — All env vars and config options, with defaults and types.
5. Development      — How to run tests, linter, and contribute.
6. Architecture     — (optional) High-level overview for contributors.
```

### Quick start must be copy-pasteable

```bash
# ❌ Bad
npm install && npm start

# ✅ Good
cp .env.example .env   # fill in your API keys
npm install
npm run dev            # → http://localhost:3000
```

### Document the unexpected, not the obvious

```markdown
❌ Run npm install to install dependencies.

✅ Requires Node 22+. Uses pnpm workspaces — run `pnpm install` from the
   repo root, not from individual packages (workspace deps won't link correctly).
```

---

## Changelog

Format: [Keep a Changelog](https://keepachangelog.com). Update on every PR that changes behavior.

```markdown
## [Unreleased]

### Added
- User export endpoint: `GET /users/{id}/export`

### Changed
- `calculateRetryDelay` now caps at 30 s (was 60 s)

### Fixed
- Pagination cursor was off-by-one for empty result sets

### Deprecated
- `POST /v1/users/create` — use `POST /v2/users` instead

### Removed
- `legacyAuth` middleware (deprecated in v1.2)

### Security
- Upgraded `jsonwebtoken` to address CVE-2024-XXXXX
```

Valid sections: `Added` · `Changed` · `Fixed` · `Deprecated` · `Removed` · `Security`

---

## Architecture Decision Records (ADRs)

Write an ADR when a decision is:
- Not obvious from the code
- Likely to be revisited or questioned later
- Based on tradeoffs future maintainers should understand

Store at: `docs/adr/NNN-short-title.md`

```markdown
# ADR NNN: [Short Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX

## Context
What situation prompted this decision? What constraints shaped the options?

## Decision
What did we decide to do?

## Rationale
Why this option over the alternatives? What were the key tradeoffs?

## Consequences
What becomes easier? What becomes harder?
What risks does this introduce? What follow-up work does this create?

## Alternatives Considered
- **Option A:** [brief] — rejected because [reason]
- **Option B:** [brief] — rejected because [reason]
```

---

## OpenAPI / Swagger Spec

For any REST API, maintain an OpenAPI spec (`openapi.yaml` or `openapi.json`).

Minimum required per endpoint:
```yaml
/users/{id}:
  get:
    summary: Get a user by ID
    security:
      - bearerAuth: []
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      "200":
        description: User found
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserResponse"
      "404":
        description: User not found
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ErrorResponse"
```

Rules:
- **Every endpoint** must have: summary, security (if auth required), all parameters, all response codes.
- Define reusable schemas in `components/schemas` — do not inline the same shape twice.
- Keep spec and implementation in sync — use validation or code-gen in CI if possible.
- Breaking changes to the spec = bump the API version.

---

## Inline Code Documentation

Write comments that explain **why**, not what:

```python
# ✅ Explains a non-obvious threshold
# Requests under 100ms never trigger the downstream rate limiter empirically.
# Skip the sleep on fast paths to avoid unnecessary latency.
if elapsed_ms > 100:
    time.sleep(RATE_LIMIT_DELAY)

# ❌ Restates the code
# Sleep if elapsed time is greater than 100ms
if elapsed_ms > 100:
    time.sleep(RATE_LIMIT_DELAY)
```

---

## Checklist

```
- [ ] README updated if setup, config, or usage changed
- [ ] CHANGELOG entry added under [Unreleased]
- [ ] OpenAPI spec updated if any REST endpoint changed
- [ ] ADR written if a significant architectural decision was made
- [ ] Code examples in docs verified to work
- [ ] No "TODO: document this" left behind
- [ ] Written for a reader with zero prior context
```
