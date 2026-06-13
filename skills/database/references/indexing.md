# Indexing Strategy

## When to Add an Index

Add an index when:

- A column is used frequently in WHERE clauses
- A column is used in JOIN ON conditions (always index foreign keys)
- A column is used in ORDER BY on large tables
- A column has a UNIQUE constraint (the constraint creates an index automatically)

Do not add an index when:

- The table is small (full scan is fast enough)
- The column has very low cardinality (boolean, status with 2-3 values — the index may not be used)
- The column is rarely queried
- The table has very high write volume (every index slows down INSERT, UPDATE, DELETE)

---

## Index Types

| Type | Use for |
| ------ | --------- |
| B-tree (default) | Equality (`=`), range (`<`, `>`, `BETWEEN`), ORDER BY, most queries |
| Hash | Equality only — faster for exact match, no range support |
| GIN | Full-text search, array columns, JSONB containment |
| GiST | Geometric data, full-text search (PostgreSQL) |
| Partial | Indexes a subset of rows — use with a WHERE condition |
| Composite | Multiple columns — column order matters |

---

## Composite Index Column Order

The order of columns in a composite index matters.

```text
Index on (tenant_id, user_id, created_at):

Usable for:
  WHERE tenant_id = ?
  WHERE tenant_id = ? AND user_id = ?
  WHERE tenant_id = ? AND user_id = ? AND created_at > ?

Not usable for:
  WHERE user_id = ?  (leading column missing)
  WHERE created_at > ?  (leading columns missing)
```

Rule: put the most selective and most frequently filtered column first.

---

## Partial Indexes

A partial index only indexes rows that match a condition.
Smaller and faster than a full index when most rows are excluded.

```text
Example use cases:
  Active records only:
    CREATE INDEX idx_users_active ON users (email) WHERE deleted_at IS NULL;

  Unprocessed jobs:
    CREATE INDEX idx_jobs_pending ON jobs (created_at) WHERE status = 'pending';

  Non-null values:
    CREATE INDEX idx_orders_invoice ON orders (invoice_number) WHERE invoice_number IS NOT NULL;
```

---

## Indexing Checklist

```markdown
- [ ] Index added on every foreign key column
- [ ] Index added on every column used in WHERE clauses on large tables
- [ ] Index added on ORDER BY columns for large result sets
- [ ] Composite index column order optimized for actual query patterns
- [ ] Partial indexes used where only a subset of rows is queried
- [ ] Duplicate or unused indexes identified and removed
- [ ] Index creation on large tables done concurrently (no table lock)
- [ ] Index size reviewed — overly large indexes may indicate wrong approach
```
