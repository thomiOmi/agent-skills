---
name: query-optimization
description: 'Use this skill when auditing slow SQL queries, analyzing EXPLAIN plans, creating indexes, or fixing N+1 query patterns. Trigger with "query optimization", "slow query", "EXPLAIN plan", "add index", "N+1 query", "composite index", or when optimizing SQL performance. Do not optimize queries without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# SQL Query & Index Optimization

Guidelines for diagnosing slow queries, indexing strategy, and eliminating N+1 query bottlenecks.

---

## N+1 Prevention & Indexing Rules

1. **Eliminate N+1**: Replace loops containing queries with single `JOIN` or `WHERE IN (...)` queries.
2. **Index Foreign Keys**: Add indexes on all columns used in `JOIN` conditions or `WHERE` filters.
3. **Composite Indexes**: Place high-cardinality equality columns first, followed by range/sort columns.
4. **Avoid `SELECT *`**: Fetch only necessary columns to reduce memory and I/O overhead.

---

## Verification Checklist

```markdown
- [ ] No N+1 queries in loop iterations
- [ ] EXPLAIN query plan verified for large dataset queries
- [ ] Indexes added on foreign key and filter columns
- [ ] `SELECT *` replaced with explicit column lists
```
