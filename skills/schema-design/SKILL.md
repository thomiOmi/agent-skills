---
name: schema-design
description: 'Use this skill when designing database schemas, ERDs, primary/foreign key constraints, or DDL migrations. Trigger with "schema design", "database schema", "ERD", "foreign key", "primary key", "normalization", "migration DDL", or when modeling relational data. Do not write DDL schema migrations without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Database Schema Design

Guidelines for designing normalized, performant relational database schemas.

---

## Core Rules

1. **Primary Keys**: Every table must have a primary key (`UUID`, `ULID`, or integer `id`).
2. **Foreign Keys**: Enforce referential integrity with explicit foreign key constraints.
3. **Data Types**: Use exact data types (integer cents for monetary values, `timestamptz` for timestamps).
4. **Constraints**: Apply `NOT NULL` and `UNIQUE` constraints based on business rules.

---

## Verification Checklist

```markdown
- [ ] Every table has a primary key
- [ ] Foreign keys explicitly defined and indexed
- [ ] Monetary values stored as integer cents
- [ ] `NOT NULL` applied to mandatory fields
```
