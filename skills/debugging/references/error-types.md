# Common Error Types and Root Causes

| Error type | Usually means |
|-----------|---------------|
| `NullPointerException` / `TypeError: Cannot read property of undefined` | Something is null/undefined that should not be |
| `KeyError` / `IndexError` | Accessing a key or index that does not exist |
| `ECONNREFUSED` | Service or port is not running |
| `ETIMEDOUT` | Network call took too long |
| `PermissionError` | File or resource access denied |
| `SyntaxError` | Code cannot be parsed — check recent edits |
| HTTP 401 | Auth token missing, expired, or invalid |
| HTTP 403 | Authenticated but not authorized |
| HTTP 500 | Server-side error — check server logs |

## Common Root Cause Patterns

| Symptom | Common root cause |
|---------|------------------|
| Wrong value in DB | Bug in write path (creation/update logic) |
| Intermittent failures | Race condition, timeout, or flaky network |
| Works locally, fails in prod | Environment difference (env vars, versions, data) |
| Works for one user, fails for another | Permission or data isolation bug |
| Fails after recent deploy | Regression — check the diff |
| Fails after dependency update | Breaking change in upstream library |
