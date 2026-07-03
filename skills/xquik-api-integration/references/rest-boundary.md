# REST Boundary

Use a server route, backend job, or agent connector to call Xquik. The frontend should call your app, not Xquik directly.

## Pattern

1. Load the Xquik API key from a secret store or runtime environment.
2. Accept only the target and filters needed for the task.
3. Call the Xquik REST endpoint documented in the public OpenAPI spec.
4. Normalize the response into a small contract.
5. Return source-linked rows to the UI or agent.

## Error Handling

Handle:

- missing API key
- invalid target
- empty results
- rate limits
- upstream unavailable responses
- stale cached data

Report a user-actionable message. Do not expose credentials or raw upstream internals.
