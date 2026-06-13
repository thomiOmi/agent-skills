# Database Templates

## Migration Template

```markdown
Migration: [NNN]_[descriptive_name]

Up:
  [describe what this migration does]
  - Add table / column / index / constraint
  - Modify column type or constraint
  - Backfill data

Down (rollback):
  [describe how to reverse the up migration]
  - Drop the added table / column / index
  - Revert the modified type or constraint
  - Note: if irreversible, explain why and what manual recovery is needed

Estimated duration: [fast / seconds / minutes on production table size]
Zero-downtime safe: Yes / No
  If No: [explain what downtime or locking is expected]
```

---

## Schema Review Checklist

```markdown
Table: [table name]

Primary key:
- [ ] PK defined and using appropriate type (uuid / integer)

Foreign keys:
- [ ] All FK columns reference the correct parent table
- [ ] All FK columns have an index

Data types:
- [ ] Monetary values use integer cents (not float)
- [ ] Datetime columns use timezone-aware type
- [ ] Enum or CHECK constraint on status/type columns

Constraints:
- [ ] NOT NULL applied where field is always required
- [ ] UNIQUE constraint on columns with business uniqueness
- [ ] CHECK constraints on columns with range or set restrictions

Audit:
- [ ] created_at column present
- [ ] updated_at column present
- [ ] soft delete column (deleted_at) if soft delete is used
```

---

## Query Review Template

```markdown
Query: [description of what the query does]

Table size estimate: [small / medium / large / very large]

Checks:
- [ ] No SELECT * — specific columns listed
- [ ] WHERE clause uses indexed columns
- [ ] ORDER BY column is indexed (if on large table)
- [ ] Result set is paginated
- [ ] No N+1 — related data is eagerly loaded
- [ ] EXPLAIN reviewed and no sequential scans on large tables
- [ ] Transaction used if multiple writes
```
