# Migrations

## Principles

1. Every migration must be versioned and tracked by the migration tool.
2. Every migration must be reversible — write the rollback method.
3. Never modify a migration file after it has been committed and run.
4. Migrations are code — review them as carefully as application code.

---

## Migration Checklist

```markdown
Before writing:
- [ ] Migration is for one logical change only
- [ ] Rollback (down) method is planned before writing the up method

Before committing:
- [ ] Up method tested locally
- [ ] Down method tested locally — confirm it actually reverses the change
- [ ] No application code in the migration file
- [ ] No hardcoded data beyond necessary seed values
- [ ] Large table changes are zero-downtime safe (see below)

Before running in production:
- [ ] Migration tested on a recent copy of production data
- [ ] Rollback plan documented and tested
- [ ] Estimated duration verified — long migrations need a maintenance window or online migration strategy
- [ ] Application code that depends on the new schema is deployed first (if adding) or after (if removing)
```

---

## Zero-Downtime Migration Patterns

Dropping a column or renaming a column requires a multi-step process to avoid downtime.

### Adding a column (safe)

```text
Step 1: Add the column as nullable with no default
Step 2: Deploy application code that writes to the new column
Step 3: Backfill existing rows
Step 4: Add NOT NULL constraint and default if needed
```

### Removing a column (multi-step)

```text
Step 1: Deploy application code that stops reading/writing the column
Step 2: Remove the column in a migration
```

### Renaming a column (multi-step)

```text
Step 1: Add the new column
Step 2: Deploy application code to write to both columns
Step 3: Backfill old column values to new column
Step 4: Deploy application code to read from new column only
Step 5: Remove the old column
```

### Adding an index to a large table

```text
Use CREATE INDEX CONCURRENTLY (PostgreSQL) or the equivalent online DDL
to avoid locking the table during index creation.
```

---

## Rollback Strategy

Every migration must have a documented rollback approach:

| Migration type | Rollback approach |
| --------------- | ------------------ |
| Add column | Drop column |
| Drop column | Cannot restore data — require confirmation before proceeding |
| Add table | Drop table |
| Drop table | Cannot restore data — require confirmation |
| Add index | Drop index |
| Modify column type | Revert to original type (may require data conversion) |
| Backfill data | Document how to reverse if needed |

For irreversible migrations, add a comment explaining why and what manual steps are needed to recover.
