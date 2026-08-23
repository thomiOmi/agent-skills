# SQL Query Patterns & Best Practices

Guidelines for writing maintainable and performant SQL queries.

---

## 1. Aggregations & Window Functions

When computing rankings, moving averages, or cumulative totals:

```sql
SELECT
  user_id,
  order_date,
  total_cents,
  SUM(total_cents) OVER (
    PARTITION BY user_id
    ORDER BY order_date
  ) AS cumulative_spend_cents
FROM orders;
```

---

## 2. Safe Date & Time Handling

Always filter using ISO 8601 UTC bounds rather than string manipulations on date columns:

```sql
-- Good: Index-friendly range filter
WHERE created_at >= '2025-01-01T00:00:00Z'
  AND created_at < '2026-01-01T00:00:00Z'
```

---

## 3. Handling NULLs

Use `COALESCE` to provide deterministic fallbacks for NULL values:

```sql
SELECT
  user_id,
  COALESCE(SUM(total_cents), 0) AS total_spent_cents
FROM orders
GROUP BY user_id;
```
