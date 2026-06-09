# Naming Conventions

Name things by what they **are** or **do** — not by how they are implemented.
Every name must be readable without additional context.

---

## Core Principles

**Be explicit, not clever.**
A longer descriptive name is always better than a short ambiguous one.

**No abbreviations unless universally known.**
Acceptable: `id`, `url`, `db`, `ctx`, `api`, `http`
Not acceptable: `usr`, `cfg`, `tmp`, `mgr`, `util`, `hlpr`, `req`, `res`

**No single-letter names** — except mathematical loop indices (`i`, `j`, `k`).
Every other variable must have a name that explains what it holds.

**Consistency takes priority.**
Before naming something new, search the codebase for similar patterns.

---

## Variables

The name must answer: what does this variable hold?

| Avoid | Use instead |
|-------|------------|
| `data`, `info`, `result`, `obj`, `val` | The actual concept: `invoice`, `parsed_response`, `user_id` |
| `temp`, `tmp`, `foo`, `bar` | What it actually holds: `retry_count`, `filtered_orders` |
| `x`, `n`, `e`, `s`, `v` | Full name: `retry_attempt`, `error_count`, `user_email` |
| `flag`, `check`, `status` | Specific state: `is_authenticated`, `has_permission`, `can_export` |
| `list`, `array`, `items` | Named collection: `active_users`, `pending_orders`, `uploaded_files` |

---

## Functions and Methods

Use a verb or verb phrase that describes the action and its subject.

| Avoid | Use instead |
|-------|------------|
| `doStuff()`, `process()`, `handle()` | Specific action: `calculate_retry_delay()`, `send_invoice_email()` |
| `get()`, `fetch()` without subject | Named subject: `fetch_active_orders()`, `get_user_by_email()` |
| `check()`, `validate()` without subject | Specific: `validate_email_format()`, `check_quota_limit()` |
| `update()`, `save()` without subject | Specific: `update_user_profile()`, `save_payment_record()` |

---

## Boolean Variables and Properties

Use a question form that reads as true or false.

| Avoid | Use instead |
|-------|------------|
| `active`, `enabled`, `valid` | `is_active`, `is_enabled`, `is_valid` |
| `permission`, `access`, `auth` | `has_permission`, `has_access`, `is_authenticated` |
| `done`, `complete`, `finish` | `is_complete`, `has_finished`, `is_done` |

---

## Event Handlers and Callbacks

Use the prefix `handle` followed by the specific event.

| Avoid | Use instead |
|-------|------------|
| `onClick()`, `onFail()`, `cb()` | `handle_button_click()`, `handle_payment_failure()` |
| `trigger()`, `fire()`, `run()` | Specific: `trigger_invoice_generation()` |

---

## Classes and Types

Use a singular noun representing one instance of the concept.

| Avoid | Use instead |
|-------|------------|
| `UserManager`, `DataHandler` | `UserSession`, `PaymentGateway` |
| `Util`, `Helper`, `Service` (generic) | Named responsibility: `EmailDispatcher`, `TokenValidator` |
| `UserData`, `OrderInfo` | `UserProfile`, `OrderSummary` |

---

## Constants

Use a noun or noun phrase describing what the value represents.

| Avoid | Use instead |
|-------|------------|
| `LIMIT`, `TIMEOUT`, `URL` | `MAX_RETRIES`, `REQUEST_TIMEOUT_MS`, `BASE_API_URL` |
| `NUM`, `COUNT`, `VAL` | `MAX_EXPORT_COUNT`, `DEFAULT_PAGE_SIZE` |

---

## Loop Variables

Use the singular of the collection name, not single letters.

```
for order in orders         — not: for x in orders
for user in active_users    — not: for i in active_users
for chunk in file_chunks    — not: for c in file_chunks
```

Exception: pure mathematical index loops where `i`, `j`, `k` are conventional.

---

## Anti-Pattern Summary

| Pattern | Problem |
|---------|---------|
| Single letters: `e`, `x`, `n`, `s` | Requires context to understand |
| Abbreviations: `usr`, `cfg`, `tmp` | Not self-explanatory |
| Generic: `data`, `info`, `result` | Says nothing about content |
| Vague verbs: `doStuff()`, `process()` | No indication of what is done |
| Wrong boolean form: `active`, `valid` | Does not read as true/false |
