# OpenAPI Spec Requirements

For REST APIs, maintain an OpenAPI spec (`openapi.yaml` or `openapi.json`).

Minimum required per endpoint:

```yaml
/users/{id}:
  get:
    summary: Get a user by ID
    security:
      - bearerAuth: []
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
    responses:
      "200":
        description: User found
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserResponse"
      "404":
        description: User not found
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ErrorResponse"
```

Rules:
- Every endpoint must have: summary, security, all parameters, all response codes.
- Define reusable schemas in `components/schemas` — do not inline the same shape twice.
- Keep spec and implementation in sync — validate in CI if possible.
- Breaking changes to the spec = bump the API version.
