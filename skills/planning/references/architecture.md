# System & Component Architecture Diagrams

Use Mermaid.js `graph` or `C4Context` syntax for architecture diagrams.

---

## System Architecture (graph syntax)

```mermaid
graph TD
    Client["Client\n(Browser / Mobile App)"]
    Gateway["API Gateway\n(Auth, Rate Limiting, Routing)"]
    AuthSvc["Auth Service"]
    OrderSvc["Order Service"]
    AuthDB[(Auth DB\nPostgreSQL)]
    OrderDB[(Order DB\nPostgreSQL)]
    Queue["Message Queue\n(Redis / RabbitMQ)"]
    NotifSvc["Notification Service"]

    Client -->|HTTPS REST| Gateway
    Gateway -->|HTTP| AuthSvc
    Gateway -->|HTTP| OrderSvc
    AuthSvc --> AuthDB
    OrderSvc --> OrderDB
    OrderSvc -->|publish event| Queue
    Queue -->|consume| NotifSvc
```

---

## Component Diagram (within a single service)

```mermaid
graph LR
    Router["Router\n(route definitions)"]
    Controller["Controller\n(request handling)"]
    Service["Service\n(business logic)"]
    Repository["Repository\n(data access)"]
    DB[(Database)]

    Router --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant DB

    User->>Frontend: Submit credentials
    Frontend->>API: POST /auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: Validate password hash
    API->>DB: INSERT session token
    DB-->>API: OK
    API-->>Frontend: 200 { token }
    Frontend-->>User: Redirect to dashboard
```

---

## Async Sequence

```mermaid
sequenceDiagram
    actor User
    participant API
    participant DB
    participant Queue
    participant Worker
    participant Email

    User->>API: POST /orders
    API->>DB: INSERT order
    API->>Queue: publish order.created
    API-->>User: 201 { orderId }

    Note over Queue,Worker: Async processing
    Queue->>Worker: consume order.created
    Worker->>Email: Send confirmation
    Worker->>DB: UPDATE order status
```

---

## Rules

```text
✅ Show every external dependency (payment providers, email, SMS, CDN)
✅ Note the communication protocol on each arrow (HTTPS, gRPC, events)
✅ Identify single points of failure
✅ Show where data is stored
✅ Use sequenceDiagram for request flows, graph for topology
❌ Do not design in isolation — review existing architecture first
❌ Do not combine more than one concern in a single diagram
```
