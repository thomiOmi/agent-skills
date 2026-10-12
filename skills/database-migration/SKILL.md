---
name: database-migration
description: 'Use this skill when planning, writing, or reviewing schema migrations - additive and breaking changes, rollback paths, zero-downtime expand-contract patterns, backfills, and data migrations. Load before running or generating any migration that touches production-shaped data. For general schema design and query optimization, use database instead. Triggers include: "migration plan", "rollback", "zero-downtime migration", "add column safely", "rename column", "backfill", "expand and contract", "drop column".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Database Migration

Patterns for changing schema safely on live systems. Complements `database` (which owns schema design and query performance): this skill owns *how schema changes are shipped*.

---

## When to Use This Skill

| Situation | Use this skill | Use database instead |
|---|---|---|
| "Add a column without downtime" | Yes | |
| "Design the order tables" | | Yes |
| "Backfill 10 million rows" | Yes | |
| "This query is slow" | | Yes |
| "Rename a column in production" | Yes | |

---

## The Rollback Rule

A migration is not done until its reverse path exists and is tested:

- Every migration has a documented `down`/rollback that is actually executed in a staging or scratch environment.
- Destructive steps (DROP, type narrowing, data deletion) are only ever reversible via backup restore - so a fresh backup is confirmed **before** the migration runs, and the user explicitly approves the run.
- If a rollback cannot exist (irreversible data transformation), the migration plan says so explicitly and gets sign-off before proceeding.

---

## Expand-Contract (zero-downtime default)

Never deploy a breaking schema change in one step. Three deployments, two migrations:

1. **Expand**: add the new column/table/index alongside the old one. Old code unaffected.
2. **Migrate**: code reads/writes both (dual-write or feature-flagged), backfill runs in batches, then code reads only the new shape.
3. **Contract**: in a later release, after confirming nothing references the old shape, drop it.

The contract step happens only after the expanded version has run in production for a full release cycle with monitoring.

---

## Safe Patterns for Common Changes

| Change | Safe pattern |
|---|---|
| Add nullable column | Direct; instant in most engines. Avoid high-fillfactor defaults on huge tables |
| Add column with default (old engines) | Add nullable, backfill in batches, then set default |
| Add NOT NULL constraint | Add nullable, backfill, add constraint as NOT VALID, VALIDATE, then enforce |
| Add index | `CREATE INDEX CONCURRENTLY` (PostgreSQL) or online DDL equivalent; never inside a transaction that locks writes |
| Rename column | Expand-contract: add new, dual-write, migrate readers, drop old |
| Drop column | Contract last, after code stops referencing it |
| Change column type | Expand-contract with dual-write or cast-in-view transition |
| Add FK on large table | Add NOT VALID, VALIDATE separately, or expand-contract |

---

## Backfills

- Batched (thousands of rows per batch, pause between batches), never one monolithic UPDATE on a big table.
- Throttle by replication lag or lock wait metrics, not by feel.
- Resumable: track progress by key range so a failed backfill continues instead of restarting.
- Long backfills run as a job with monitoring, not as a migration that holds a deploy hostage.

---

## Pre-Flight Checklist

```markdown
- [ ] Rollback path exists and was executed in staging/scratch
- [ ] Backup confirmed before destructive steps; user approved
- [ ] Breaking changes split into expand and contract releases
- [ ] Locks estimated; concurrent/online DDL used where the engine supports it
- [ ] Backfills batched, resumable, and monitored
- [ ] Post-migration verification query prepared (row counts, constraint checks)
```

---

## References

- For schema design and normalization decisions: use `database`
- For query performance after the migration: use `database`
- For the deployment sequencing around migrations: use `devops-deployment`

`database/references/migrations.md` now points back here - this skill is
the single source for migration execution patterns.