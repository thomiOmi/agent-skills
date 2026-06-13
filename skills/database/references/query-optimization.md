# Query Optimization

## N+1 Query Detection

An N+1 query occurs when code executes 1 query to fetch a list,
then N additional queries — one per item — to fetch related data.

**Symptom:**

```textt
Total queries = 1 + N  (where N = number of rows in the first result)
```

**Detection:**

- Enable query logging and look for repeated queries with different ID values
- Use database profiling tools or APM (Application Performance Monitoring)
- Look for loops that contain database calls

**Fix:**
Use eager loading to fetch related data in one query instead of N queries.

```text
Wrong pattern:
  FETCH all orders
  FOR EACH order:
    FETCH user for this order   ← 1 query per order = N+1

Right pattern:
  FETCH all orders JOIN users   ← 1 query total
  OR
  FETCH all orders
  FETCH all users WHERE id IN (order.user_ids)   ← 2 queries total
```

---

## EXPLAIN / Query Analysis

Run EXPLAIN (or EXPLAIN ANALYZE) on any slow query before optimizing.

**What to look for:**

| Term | Meaning | Action |
| ------ | --------- | -------- |
| Sequential scan (Seq Scan) | Reading the entire table | Add an index |
| Index scan | Using an index efficiently | Good |
| Nested loop with high rows | N+1 or missing join index | Add index or restructure |
| Sort with high cost | ORDER BY on unindexed column | Add index on sort column |
| High actual rows vs estimated rows | Statistics out of date | Run ANALYZE |

---

## Query Patterns

**Always:**

- Paginate queries that return unbounded result sets
- Use indexed columns in WHERE, JOIN ON, and ORDER BY
- Select only the columns needed — avoid SELECT *
- Use COUNT(1) or COUNT(id) instead of COUNT(*) where supported

**Watch for:**

- Functions applied to indexed columns in WHERE clause (defeats the index)
- OR conditions that prevent index use — consider UNION instead
- Leading wildcard in LIKE (`LIKE '%term'`) — cannot use B-tree index; use full-text search
- Implicit type conversion in comparisons — always compare same types

---

## Query Review Checklist

```markdown
- [ ] No N+1 queries — relationships are eagerly loaded where needed
- [ ] EXPLAIN reviewed for any query on a large table
- [ ] No SELECT * in queries that go to production
- [ ] Pagination applied (LIMIT + OFFSET or cursor-based) on unbounded results
- [ ] ORDER BY columns are indexed
- [ ] WHERE clause columns are indexed
- [ ] No functions applied to indexed columns in WHERE clause
- [ ] Transactions used for multi-step writes
- [ ] Long-running queries identified and given a timeout
```
