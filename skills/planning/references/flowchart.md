# Flowchart & User Flow

Use Mermaid.js `flowchart` syntax. Renders in GitHub, GitLab, Notion, and most documentation tools.

---

## Basic Syntax

```mermaid
flowchart TD
    A[Start] --> B[Step or Action]
    B --> C{Decision?}
    C -- Yes --> D[Action A]
    C -- No --> E[Action B]
    D --> F[End]
    E --> F
```

---

## Node Types

| Syntax | Shape | Use for |
| -------- | ------- | --------- |
| `[Text]` | Rectangle | Action or step |
| `{Text}` | Diamond | Decision or condition |
| `(Text)` | Rounded | Start or end |
| `([Text])` | Stadium | Terminal event |
| `[[Text]]` | Subroutine | Sub-process |

---

## Example: User Login Flow

```mermaid
flowchart TD
    Start([User submits login form])
    Start --> ValidateCredentials{Credentials valid?}

    ValidateCredentials -- No --> ShowError[Show error message]
    ShowError --> Start

    ValidateCredentials -- Yes --> CheckMFA{MFA enabled?}

    CheckMFA -- No --> IssueToken[Issue session token]
    IssueToken --> Dashboard([Redirect to dashboard])

    CheckMFA -- Yes --> SendOTP[Send OTP to user]
    SendOTP --> EnterOTP[User enters OTP]
    EnterOTP --> ValidateOTP{OTP valid?}

    ValidateOTP -- No --> OTPError[Show error, allow retry]
    OTPError --> EnterOTP

    ValidateOTP -- Yes --> IssueToken
```

---

## Example: Async Order Flow

```mermaid
flowchart TD
    Start([User places order])
    Start --> CreateOrder[Create order in DB]
    CreateOrder --> PublishEvent[Publish order.created event]
    PublishEvent --> ReturnResponse([Return 201 to client])

    PublishEvent --> ProcessPayment[Worker: charge card]
    ProcessPayment --> PaymentResult{Payment successful?}

    PaymentResult -- Yes --> UpdateOrder[Update order status to paid]
    UpdateOrder --> SendConfirmation[Send confirmation email]

    PaymentResult -- No --> MarkFailed[Mark order as failed]
    MarkFailed --> NotifyUser[Notify user of failure]
```

---

## Rules

```text
✅ Every flow must have a clear start and end node
✅ Every decision node must have all possible branches
✅ Include error paths — they are as important as happy paths
✅ One diagram per concern — split complex flows into sub-diagrams
✅ Use TD (top-down) for process flows, LR (left-right) for state machines
❌ Do not exceed 3 levels of nesting — split into sub-diagrams instead
```
