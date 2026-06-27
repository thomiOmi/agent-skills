# Knowledge Entry Format

## Architectural Decision

```markdown
## [Short title] — [YYYY-MM-DD]
**Decision:** [What was decided — one sentence]
**Reason:** [Why this choice — one to two sentences]
**Alternatives rejected:** [What was considered and why not chosen]
**Impact:** [What this affects going forward]
```

Example:

```markdown
## Sanctum Bearer Token over JWT — 2026-06-27
**Decision:** Use Sanctum personal access tokens for all API authentication
**Reason:** API is consumed by mobile and third-party clients — stateless Bearer fits better than session cookies. No microservices, so JWT cross-service benefits do not apply.
**Alternatives rejected:** JWT (tymon/jwt-auth) — adds refresh token lifecycle complexity with no benefit for a single-service backend.
**Impact:** All endpoints use auth:sanctum middleware. No CSRF concern. Token revocation is per-device via personal_access_tokens table.
```

---

## Project Convention

```markdown
## Convention: [name]
**Applies to:** [where in the codebase]
**Rule:** [what to do]
**Exception:** [any exceptions, or "none"]
```

Example:

```markdown
## Convention: Date format
**Applies to:** All API responses and database storage
**Rule:** Use MySQL format YYYY-MM-DD HH:mm:ss — not ISO 8601
**Exception:** Timestamps in logs use ISO 8601 UTC
```

---

## Known Issue

```markdown
## Known Issue: [title] — [YYYY-MM-DD]
**Location:** [file or module]
**Description:** [what the issue is]
**Status:** [tracked in #issue / planned for vX / intentional]
**Do not:** [what agent should not do about this without explicit instruction]
```

---

## Session History Entry

```markdown
## [YYYY-MM-DD] — [topic or feature worked on]
**Done:**
- [completed item 1]
- [completed item 2]

**Decisions made:**
- [decision 1 — brief]

**Remaining:**
- [item not finished, if any]
```

---

## Global Knowledge Entry (personal preference)

```markdown
## Preference: [name] — [YYYY-MM-DD]
**Rule:** [what to always do or never do]
**Context:** [when this applies]
```

Example:

```markdown
## Preference: Always run tests after changes — 2026-06-27
**Rule:** Run the full test suite after every change, even if not explicitly asked
**Context:** All projects — make this the default behavior
```
