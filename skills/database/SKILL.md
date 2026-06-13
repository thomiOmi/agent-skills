---
name: database
description: Use this skill when designing schemas, reviewing queries, writing migrations, or optimizing database performance. Triggers: "desain schema", "optimasi query", "migration", "tambah index", "N+1", "slow query", "database design", "review schema", "audit queries", "foreign key", "normalization". Works with any relational database (PostgreSQL, MySQL, SQLite, MariaDB).
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Database

Guidelines for designing reliable, performant, and maintainable database schemas and queries.
Works with any relational database — PostgreSQL, MySQL, SQLite, MariaDB, and others.

---

## Clarify Before Designing

If not defined in project AGENTS.md, ask:

1. Which database engine? (PostgreSQL, MySQL, SQLite, MariaDB)
2. What ID format? (UUID, integer auto-increment, ULID, CUID)
3. What datetime format? (timestamptz, timestamp, datetime — ask for timezone handling)
4. Is soft delete used? (deleted_at column or hard delete?)
5. Is multi-tenancy involved? (tenant_id on every table?)

---

## References

- `references/schema-design.md` — normalization, naming, key types, common patterns
- `references/migrations.md` — migration checklist, rollback strategy, zero-downtime
- `references/query-optimization.md` — N+1 detection, EXPLAIN, query patterns
- `references/indexing.md` — when to index, index types, composite indexes

See `assets/templates.md` for migration and query review templates.

---

## Hard Rules

```text
❌ Never modify a migration file after it has been run in any environment
❌ Never drop a column or table without a deprecation period in production
❌ Never store monetary values as float — use integer cents
❌ Never store multiple values in one column — normalize instead
❌ Never skip a migration rollback plan
✅ Every migration must be reversible (or document why it cannot be)
✅ Add indexes on all foreign key columns
✅ Use transactions for multi-step data operations
✅ Test migrations on a copy of production data before running in production
```

---

## Checklist

```markdown
Schema design:
- [ ] Every table has a primary key
- [ ] Foreign key constraints defined and enforced
- [ ] Indexes added on all foreign key columns
- [ ] Correct data types used (no float for money, no varchar for IDs if UUID)
- [ ] NOT NULL constraints applied where field is always required
- [ ] Unique constraints applied for business uniqueness requirements

Migrations:
- [ ] Migration is reversible (down/rollback method exists)
- [ ] No data loss in migration without explicit confirmation
- [ ] Large table migrations are zero-downtime safe
- [ ] Migration tested in staging before production

Queries:
- [ ] No N+1 queries (eager load relationships)
- [ ] Queries use indexed columns in WHERE and JOIN conditions
- [ ] No SELECT * in production queries
- [ ] Pagination applied to queries that return unbounded result sets
```
