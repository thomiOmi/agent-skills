# Naming Conventions

Name things by what they **are** or **do** — not by how they are implemented.

---

## Principles

**Be explicit, not clever.**
A longer descriptive name is always better than a short ambiguous one.
The person reading your code six months from now may not have your context.

**Consistency takes priority.**
Before naming something new, search the codebase for similar patterns.
Match the naming style and vocabulary already used in the project.

**Avoid abbreviations.**
Abbreviate only when the short form is universally understood in the domain.
Acceptable: `id`, `url`, `db`, `ctx`, `api`, `http`, `html`, `css`
Not acceptable: `usr`, `cfg`, `tmp`, `mgr`, `util`, `hlpr`

---

## By Category

**Functions and methods**
Use a verb or verb phrase that describes the action.
`calculateRetryDelay` not `retryDelay` · `validateEmailAddress` not `checkEmail` · `fetchActiveOrders` not `getOrders`

**Boolean variables and properties**
Use a question form that reads naturally as true or false.
`isAuthenticated` not `authenticated` · `hasPermission` not `permission` · `canExport` not `export`

**Collections**
Use a plural noun that describes the items in the collection.
`activeUsers` not `list` · `pendingOrders` not `data` · `uploadedFiles` not `items`

**Event handlers and callbacks**
Use the prefix `handle` followed by the event name.
`handlePaymentFailure` not `onFail` · `handleSessionExpiry` not `sessionCheck`

**Loop variables**
Use the singular of the collection name, not single letters.
`for order in orders` not `for x in orders` · `for user in active_users` not `for i in active_users`
Exception: mathematical index loops where `i`, `j`, `k` are conventional.

**Constants**
Use a noun or noun phrase that describes what the value represents.
`MAX_RETRIES` not `LIMIT` · `DEFAULT_TIMEOUT_MS` not `TIMEOUT` · `BASE_API_URL` not `URL`

**Classes and types**
Use a singular noun that represents one instance of the concept.
`UserSession` not `UserSessions` · `OrderPayload` not `OrderData` · `RetryPolicy` not `RetryConfig`

---

## Anti-Patterns

| Pattern | Problem | Fix |
| --------- | --------- | ----- |
| `data`, `info`, `result`, `obj`, `thing` | Says nothing about content | Use the actual concept: `invoice`, `parsed_response`, `product_id` |
| `temp`, `tmp`, `foo`, `bar` | Signals unfinished thinking | Name it by what it actually holds |
| `doStuff()`, `handleIt()`, `process()` | Too vague | Name the specific action and subject |
| `flag`, `check`, `status` | Ambiguous boolean | Use `isValid`, `hasExpired`, `canRetry` |
| `manager`, `handler`, `helper`, `util` | Over-broad class names | Name by specific responsibility: `SessionStore`, `PaymentGateway` |
