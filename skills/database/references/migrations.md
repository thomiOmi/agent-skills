# Migrations

Migration process (rollback rule, expand-contract zero-downtime pattern,
safe patterns per change type, pre-flight checklist) is owned by the
`database-migration` skill - load that skill for schema-change execution.
Do not duplicate it here.

This file previously held the full zero-downtime pattern catalog and
rollback strategy table. `database-migration/SKILL.md` covers the same
ground in more depth (e.g. backfill batching, FK handling) - nothing of
value is lost.
