# What to Record in Knowledge Files

## Record these — they save time in future sessions

**Architectural decisions**
A choice between two or more approaches where the reason is not obvious from the code.
Examples:

- Chose Sanctum over JWT — record why
- Chose ULID over UUID — record why
- Chose Repository pattern over direct Eloquent — record why

**Project-specific conventions that deviate from the norm**
Things an agent would not guess from reading the code.
Examples:

- "This project uses MySQL datetime format, not ISO 8601"
- "All new modules must have a dedicated ServiceProvider"
- "Soft delete is used on User but NOT on Order"

**Known issues and tech debt**
Issues the agent should not accidentally "fix" in future sessions.
Examples:

- "DeviceResource is not used anywhere — do not delete, it will be used in v2"
- "MeController loads roles/permissions unnecessarily — known, tracked in #112"

**Cross-project preferences (global knowledge only)**
Personal preferences that apply everywhere.
Examples:

- "Always run tests after any change, even if not asked"
- "Prefer explicit over implicit code"
- "Use early returns to reduce nesting"

---

## Do NOT record these

```text
❌ Routine bug fixes — these are in git history
❌ Completed tasks — these are in git history
❌ Things readable directly from the code
❌ Temporary decisions that will change soon
❌ Anything the agent fabricated or guessed
❌ Information already in AGENTS.md or project docs
```

---

## Size guidelines

- One entry per decision — do not bundle multiple decisions into one entry
- Maximum 5–7 lines per entry
- If an entry is getting long, link to a doc file instead
- Total KNOWLEDGE.md should stay under 200 lines — beyond that, archive old entries
