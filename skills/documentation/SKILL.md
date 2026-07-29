---
name: documentation
description: 'Use this skill whenever documentation needs to be written, updated, reviewed, or audited. This includes README files, CHANGELOGs, ADRs, OpenAPI specs, API documentation, setup guides, and inline code documentation. Load this skill proactively whenever code changes affect public interfaces, configuration, or setup procedures -  do not wait for the user to explicitly ask for docs. Triggers include: "update the README", "write docs", "document this", "changelog entry", "write an ADR", "check what is documented", "audit the docs", "OpenAPI spec", "how to install", "how to configure", "how to use", "API docs", "user guide", "setup instructions", "tutorial", "readme". Also use when a code change clearly requires a documentation update -  adding parameters, changing config, modifying public API.'
license: MIT
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Documentation

Write for the reader who has zero context from this conversation.
If it only makes sense to you right now, it will confuse someone else later.

---

## Examples

**Before (unhelpful docstring):**

```ts
// Gets the user
function getUser(id: string) { ... }
```

**After (helpful docstring):**

```ts
/** Fetches a user by ID.
 * @param id - UUID of the user (not email or username)
 * @returns User object with profile and preferences joined
 * @throws NotFoundError if no user with that ID exists
 */
function getUser(id: string) { ... }
```

---

## References

- `references/readme.md` -  README structure, quick-start rules, what to document vs what not to
- `references/changelog.md` -  Keep a Changelog format with section types and examples
- `references/adr.md` -  Architecture Decision Record template and when to write one
- `references/openapi.md` -  OpenAPI spec minimum requirements per endpoint

See `assets/templates.md` for README skeleton, changelog entry, and ADR templates.

---

## Checklist

```
- [ ] README updated if setup, config, or usage changed
- [ ] CHANGELOG entry added under [Unreleased]
- [ ] OpenAPI spec updated if any REST endpoint changed
- [ ] ADR written if a significant architectural decision was made
- [ ] Code examples in docs are verified to work
- [ ] No "TODO: document this" left behind
- [ ] Written for a reader with zero prior context
```
