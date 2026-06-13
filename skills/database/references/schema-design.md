# Schema Design

## Naming Conventions

| Object | Convention | Example |
| -------- | ----------- | --------- |
| Tables | lowercase, snake_case, plural | `users`, `order_items`, `payment_methods` |
| Columns | lowercase, snake_case | `created_at`, `user_id`, `total_cents` |
| Primary keys | `id` | `id` |
| Foreign keys | `{table_singular}_id` | `user_id`, `order_id` |
| Junction tables | both table names, alphabetical | `permission_role`, `product_tag` |
| Indexes | `idx_{table}_{columns}` | `idx_orders_user_id` |
| Unique constraints | `uq_{table}_{column}` | `uq_users_email` |

---

## Key Types

| Type | Symbol | Rule |
| ------ | -------- | ------ |
| Primary Key | PK | One per table. Unique, not null. |
| Unique Key | UK | Multiple allowed. Unique. May be nullable. |
| Foreign Key | FK | References PK of another table. Always indexed. |
| Index | IDX | For query performance. Not a constraint. |

---

## Data Types

| Data | Use | Avoid |
| ------ | ----- | ------- |
| Monetary values | Integer cents (`total_cents INT`) | Float, decimal (precision issues) |
| Dates with time | `TIMESTAMPTZ` (PostgreSQL) or `DATETIME` with UTC | `TIMESTAMP` without timezone |
| Dates only | `DATE` | `VARCHAR`, `DATETIME` |
| IDs | UUID or integer auto-increment | Storing as string if using integer |
| Boolean | `BOOLEAN` | `TINYINT(1)`, `CHAR(1)` |
| Enums | Database ENUM or a lookup table | Open VARCHAR with no constraint |
| JSON | `JSONB` (PostgreSQL) or `JSON` | `TEXT` for structured data |

---

## Normalization

### 1NF — First Normal Form

- Each column holds a single value (no comma-separated lists)
- Each row is unique (has a primary key)

### 2NF — Second Normal Form

- Every non-key column depends on the whole primary key
- No partial dependencies in composite-key tables

### 3NF — Third Normal Form

- Every non-key column depends only on the primary key
- No transitive dependencies (column A → column B → column C)

When to denormalize:

- Only when a normalized query is proven to be a performance bottleneck
- Document the denormalization decision in an ADR

---

## Common Patterns

### Soft Delete

```text
Table includes: deleted_at TIMESTAMPTZ NULL

NULL  = active record
value = deleted at this time

Always filter WHERE deleted_at IS NULL in application queries.
Add a partial index: CREATE INDEX idx_users_active ON users (id) WHERE deleted_at IS NULL;
```

### Audit Columns

```text
Every table that stores business data should have:
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  created_by  UUID FK → users.id (optional)
  updated_by  UUID FK → users.id (optional)
```

### Multi-Tenancy

```text
Option A — tenant_id on every table (row-level isolation)
  Every query must include WHERE tenant_id = ?
  Add tenant_id to all indexes on tenant-scoped tables

Option B — separate schema per tenant
  Each tenant gets their own database schema
  Higher isolation, harder to maintain

Option C — separate database per tenant
  Maximum isolation, highest operational cost
```

### Status / State Columns

```text
Use an ENUM or lookup table — not a bare VARCHAR:
  status ENUM('pending', 'active', 'suspended', 'deleted') NOT NULL DEFAULT 'pending'

Add a CHECK constraint if ENUM is not available:
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'deleted'))
```
