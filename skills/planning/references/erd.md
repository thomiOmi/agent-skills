# ERD — Entity Relationship Diagram

Use Mermaid.js `erDiagram` syntax. Renders in GitHub, GitLab, Notion, and most documentation tools.

---

## Key Types

| Symbol | Type | Meaning |
| -------- | ------ | --------- |
| PK | Primary Key | One per entity. Unique, not null. |
| UK | Unique Key | Multiple allowed. Unique. May be nullable. |
| FK | Foreign Key | References PK of another entity. |
| IDX | Index | Not a constraint. For query performance only. |

---

## Mermaid Syntax

```mermaid
erDiagram
    USER {
        uuid id PK
        varchar email UK "NOT NULL"
        varchar username UK "NOT NULL"
        varchar phone UK "nullable"
        timestamptz created_at "NOT NULL DEFAULT now()"
    }

    ORDER {
        uuid id PK
        uuid user_id FK "NOT NULL"
        enum status "pending|paid|shipped|cancelled"
        int total_cents "NOT NULL"
        timestamptz created_at "NOT NULL DEFAULT now()"
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK "NOT NULL"
        uuid product_id FK "NOT NULL"
        int quantity "NOT NULL CHECK > 0"
        int unit_price_cents "NOT NULL"
    }

    PRODUCT {
        uuid id PK
        varchar sku UK "NOT NULL"
        varchar name "NOT NULL"
        int price_cents "NOT NULL"
        int stock "NOT NULL DEFAULT 0"
    }

    USER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included in"
```

---

## Relationship Cardinality

| Notation | Meaning |
| ---------- | --------- |
| \|\|--\|\| | One to one |
| \|\|--o{ | One to many |
| }o--o{ | Many to many |
| \|\|--o\| | One to zero or one |

---

## Rules

```text
✅ Every entity must have exactly one PK (prefer uuid over integer)
✅ Use timestamptz for datetime fields — not timestamp
✅ Monetary values in integer cents — not float or decimal
✅ Add UK for every field with a business uniqueness constraint
✅ Document nullable vs NOT NULL on every field
✅ Add IDX on all FK columns (for join performance)
❌ Do not use generic field names: data, info, record, value
❌ Do not store multiple values in one field — normalize instead
```
