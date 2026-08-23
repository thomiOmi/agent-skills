---
name: data-analysis
description: 'Use this skill whenever you write SQL queries, analyze datasets, model data, or generate data insights and reports. Load this skill before writing complex SQL, auditing database queries, or performing data analysis. Triggers include: "write a SQL query", "analyze this dataset", "data modeling", "query optimization", "data visualization", "metrics report", "data analysis", "SQL", "JOIN", "GROUP BY", "aggregation", "analytics", "dashboard metrics". Do not write or audit data analysis queries without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Data Analysis

Guidelines for querying, analyzing, and interpreting datasets accurately and securely.

---

## Examples

### Input: "Find top 5 customers by revenue in 2025"

**Good Query (parameterized, indexed JOIN, aggregated):**

```sql
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  SUM(o.total_cents) AS total_revenue_cents
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE o.created_at >= '2025-01-01T00:00:00Z'
  AND o.created_at < '2026-01-01T00:00:00Z'
  AND o.status = 'completed'
GROUP BY c.id, c.name
ORDER BY total_revenue_cents DESC
LIMIT 5;
```

---

## Core Principles

1. **Parameterization** - Never concatenate raw user input into SQL queries.
2. **Aggregations & Grouping** - Ensure `GROUP BY` includes all non-aggregated SELECT columns.
3. **Null Handling** - Use `COALESCE` or explicit `IS NOT NULL` checks for optional columns.
4. **Performance & Indexing** - Ensure filtering and join columns are properly indexed.
5. **Data Privacy** - Never expose raw PII or unhashed sensitive data in report outputs.

---

## Verification Checklist

```markdown
- [ ] Query uses parameterized inputs (no raw string interpolation)
- [ ] JOINs use indexed foreign key columns
- [ ] Aggregations handle NULL values gracefully (`COALESCE`)
- [ ] Results bounded with explicit `LIMIT` where applicable
- [ ] No PII or credentials exposed in data reports
```
