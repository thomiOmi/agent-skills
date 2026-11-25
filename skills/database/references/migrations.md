# Migrations

Load this reference when planning or reviewing a schema change that touches live or production-shaped data. It covers how a change is shipped; `database/SKILL.md` covers schema design and query performance.

## When this matters

| Situation | Use this reference | Stay in the main skill |
| --- | --- | --- |
| Add a column without downtime | Yes | |
| Design the order tables | | Yes |
| Backfill a large table | Yes | |
| Diagnose a slow query | | Yes |
| Rename a column in production | Yes | |

## The rollback rule

A migration is not done until its reverse path exists and has been tested:

- Every migration has a documented `down`/rollback that is actually executed in a staging or scratch environment.
- Destructive steps (DROP, type narrowing, data deletion) are only reversible via backup restore. Confirm a fresh backup **before** the migration runs, and get explicit user approval.
- If a rollback cannot exist (irreversible data transformation), say so explicitly in the plan and get sign-off before proceeding.

## Expand-contract (zero-downtime default)

Never deploy a breaking schema change in one step. Use three deployments and two migrations:

1. **Expand**: add the new column, table, or index alongside the old one. Old code stays unaffected.
2. **Migrate**: code reads and writes both shapes (dual-write or feature flag). Backfill in batches, then readers use only the new shape.
3. **Contract**: in a later release, after confirming nothing references the old shape, drop it.

The contract step happens only after the expanded version has run in production for a full release cycle with monitoring.

## Safe patterns for common changes

| Change | Safe pattern |
| --- | --- |
| Add nullable column | Direct in most engines; avoid high-fillfactor defaults on huge tables |
| Add column with default (older engines) | Add nullable, backfill in batches, then set the default |
| Add NOT NULL constraint | Add nullable, backfill, add constraint as NOT VALID, VALIDATE, then enforce |
| Add index | `CREATE INDEX CONCURRENTLY` on PostgreSQL or online DDL equivalent; never inside a transaction that locks writes |
| Rename column | Expand-contract: add new, dual-write, migrate readers, drop old |
| Drop column | Contract last, after code stops referencing it |
| Change column type | Expand-contract with dual-write or a cast-in-view transition |
| Add FK on large table | Add NOT VALID, VALIDATE separately, or expand-contract |

## Backfills

- Batch them (thousands of rows per batch with pauses), never one monolithic UPDATE on a large table.
- Throttle by replication lag or lock wait metrics, not by feel.
- Make them resumable by tracking progress by key range so a failed run continues instead of restarting.
- Run long backfills as a monitored job, not as a migration that holds a deploy hostage.

## Pre-flight checklist

```markdown
- [ ] Rollback path exists and was executed in staging or scratch
- [ ] Backup confirmed before destructive steps; user approved
- [ ] Breaking changes split into expand and contract releases
- [ ] Locks estimated; concurrent/online DDL used where the engine supports it
- [ ] Backfills batched, resumable, and monitored
- [ ] Post-migration verification query prepared (row counts, constraint checks)
```

## References

- For deployment sequencing around migrations, use `devops-deployment`. If it cannot be loaded, confirm the deploy order and rollback command with the user before applying the migration.
