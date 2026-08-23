---
name: code-simplifier
description: 'Use this skill when simplifying, cleaning, or streamlining code without changing its behavior. Trigger with "simplify code", "clean up logic", "remove dead code", "flatten nested conditions", "make code readable", or after completing a feature implementation. Do not simplify code without verifying tests pass before and after.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Code Simplifier

Guidelines for simplifying code structure, eliminating dead code, and flattening complex logic while keeping behavior 100% identical.

---

## Core Simplification Rules

1. **Preserve Behavior**: Never alter external behavior, API contracts, or return values.
2. **Flatten Control Flow**: Replace nested `if/else` blocks with guard clauses and early returns.
3. **Remove Dead Code**: Delete unused variables, unreachable branches, and redundant comments.
4. **Simplify Expressions**: Replace complex boolean expressions with named helper variables or clean helper methods.
5. **Verify Tests**: Run test suite before and after simplification to confirm zero regressions.

---

## Example: Guard Clauses

**Before (deeply nested):**

```ts
function processOrder(order: Order | null) {
  if (order) {
    if (order.status === 'pending') {
      if (order.total > 0) {
        return executePayment(order);
      } else {
        throw new Error('Order total must be greater than zero');
      }
    }
  }
}
```

**After (flattened with guard clauses):**

```ts
function processOrder(order: Order | null) {
  if (!order) return;
  if (order.status !== 'pending') return;
  if (order.total <= 0) {
    throw new Error('Order total must be greater than zero');
  }

  return executePayment(order);
}
```

---

## Verification Checklist

```markdown
- [ ] Existing unit tests pass before and after simplification
- [ ] Nested conditionals replaced with early return guard clauses
- [ ] Unused variables, imports, and dead code removed
- [ ] Behavior and return types remain 100% identical
```
