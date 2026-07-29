---
name: database
description: 'Use this skill whenever you design schemas, write migrations, review queries, or optimize database performance. Works with any relational database -  PostgreSQL, MySQL, SQLite, MariaDB. Load this skill proactively when the user mentions database design, SQL queries, performance issues, schema changes, or data modeling -  even if they phrase it informally. Triggers include: "desain schema", "optimasi query", "migration", "tambah index", "N+1", "slow query", "database design", "review schema", "audit queries", "foreign key", "normalization", "table design", "column type", "index", "join", "subquery", "transaction", "connection pool", "connection timeout", "query plan", "EXPLAIN", "deadlock", "race condition", "data integrity", "constraint". Do not write DDL, DML, or query-related code without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Database

Guidelines for designing reliable, performant, and maintainable database schemas and queries.
Works with any relational database -  PostgreSQL, MySQL, SQLite, MariaDB, and others.

---

## Clarify Before Designing

If not defined in project AGENTS.md, ask:

1. Which database engine? (PostgreSQL, MySQL, SQLite, MariaDB)
2. What ID format? (UUID, integer auto-increment, ULID, CUID)
3. What datetime format? (timestamptz, timestamp, datetime -  ask for timezone handling)
4. Is soft delete used? (deleted_at column or hard delete?)
5. Is multi-tenancy involved? (tenant_id on every table?)

---

## Examples

**N+1 query problem:**

```
Input:  GET /orders -  returns 50 orders with customer names
Bad:    One query for orders + 50 queries for customer details (51 total)
Fix:    SELECT orders.* JOIN customers ON orders.customer_id = customers.id (1 query)
```

**Migration design:**

```
Input:  Adding a stripe_subscription_id column to the users table
Bad:    ALTER TABLE users ADD stripe_subscription_id TEXT;
        (Irreversible -  no DOWN, no default on an existing not-null column)
Good:   ALTER TABLE users ADD stripe_subscription_id TEXT;
        UPDATE users SET stripe_subscription_id = '' WHERE stripe_subscription_id IS NULL;
        ALTER TABLE users ALTER COLUMN stripe_subscription_id SET NOT NULL;
        (Fill existing rows first, THEN add NOT NULL)
```

---

## References

- `references/schema-design.md` -  normalization, naming, key types, common patterns
- `references/migrations.md` -  migration checklist, rollback strategy, zero-downtime
- `references/query-optimization.md` -  N+1 detection, EXPLAIN, query patterns
- `references/indexing.md` -  when to index, index types, composite indexes

See `assets/templates.md` for migration and query review templates.

---

## Hard Rules

```text
Never modify a migration file after it has been run in any environment
   Why: Team members who already ran the migration locally will have diverging schemas. In CI/CD, a modified migration re-runs and may silently destroy or corrupt data.

Never drop a column or table without a deprecation period in production
   Why: Deployed code may still reference the column. Dropping immediately causes runtime errors. Deprecate first, remove after confirming zero references.

Never store monetary values as float -  use integer cents
   Why: Floating-point arithmetic produces rounding errors (0.1 + 0.2 ≠ 0.3). Integer cents are exact and deterministic for accounting.

Never store multiple values in one column -  normalize instead
   Why: Arrays or comma-separated values in a single column break joins, indexes, constraints, and queryability. Normalization ensures referential integrity.

Never skip a migration rollback plan
   Why: A failed migration without a rollback path can leave the database in an inconsistent state, requiring manual intervention or restore from backup.

Every migration must be reversible (or document why it cannot be)
   Why: Irreversible migrations block rollbacks and create downtime risk. If truly irreversible, document the manual steps.

Add indexes on all foreign key columns
   Why: Foreign key columns are used in JOINs and cascading operations. Without indexes, every FK operation triggers a full table scan.

Use transactions for multi-step data operations
   Why: Without transactions, a partial failure leaves data inconsistent. Transactions ensure atomicity -  all steps succeed or none are applied.

Test migrations on a copy of production data before running in production
   Why: Migrations that pass on an empty local database often fail on production data volume and distribution. Testing on a production copy catches slow queries, locks, and data type issues.
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
