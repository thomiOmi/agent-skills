# GraphQL Conventions

## Schema Design

- Types: **nouns, singular, PascalCase** — `User`, `Order`
- Queries: **camelCase** — `user(id)`, `orders(filter)`
- Mutations: describe the action — `createUser`, `updateOrder`

```graphql
type Query {
  user(id: ID!): User
  orders(filter: OrderFilter, page: Int, perPage: Int): OrderConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
}
```

## Mutation Payload Pattern

Every mutation returns a payload type — never a bare resource:

```graphql
type CreateUserPayload {
  user: User
  errors: [UserError!]!
}

type UserError {
  field: String
  message: String!
}
```

## Rules

```
✅ Every mutation returns a payload type
✅ Paginated lists use connection types: UserConnection
✅ Use input types for mutations: CreateUserInput
❌ Do not return HTTP 4xx for GraphQL validation failures — use errors field
❌ Do not use generic names: Data, Result, Response
```
