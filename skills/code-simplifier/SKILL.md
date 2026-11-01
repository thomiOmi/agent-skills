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

## Smallest Complete Change

Before simplifying, read the task and the code it touches. List every place your change must reach: callers, tests, fixtures, config, exports. Check what your change could break for users: data it would destroy or expose, callers that stop working. That is scope. Extra features are not.

Take the first option that fully works:

1. Does it need to exist? Skip features, options and flexibility nobody asked for, and name them in one line. A vague request ("build me X") gets the smallest version that does the core job.
2. Already in this codebase (a helper, component, service, pattern)? Use it the way the surrounding code does.
3. Standard library or a platform feature? Use it, unless the project has its own. A house component beats a native widget.
4. An installed dependency? Use it. Never add a dependency for a few lines.
5. Can it be one line a reader gets at a glance? One line.
6. Otherwise: the minimum code that works.

- Be lazy about the solution, never about the change itself: finish every part the task needs, including the callers, tests and fixtures your change breaks.
- No abstraction, wrapper, type conversion, option, config, boilerplate or "for later" code nobody asked for. Keep values in the form the platform already gives you. Deletion beats addition. Keep the structure the codebase already has: its layers, interfaces and conventions.
- The shortest working diff wins, once you know everything it must touch. A one-liner that needs decoding is not short.
- Comment only the why the code cannot show, in one line.
- Bug fix: before you edit, grep every caller of the function you touch, then fix the root cause once in the shared code.
- Code you move or merge keeps its error handling and validation.
- Between options of equal size, take the one that is correct on edge cases.
- Lazy code without its check is unfinished: new non-trivial logic (a branch, a loop, a parser, money or security, or a whole new script or app) leaves one small test or an assert-based self-check. Trivial changes need none.
- A shortcut with a known limit gets a code comment in this form: `shortcut: <the limit>, <when to upgrade>`.

Never cut: validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs, anything the user asked for.

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
    if (order.status === "pending") {
      if (order.total <= 0) {
        throw new Error("Order total must be greater than zero");
      }
      return executePayment(order);
    }
  }
}
```

**After (flattened with guard clauses):**

```ts
function processOrder(order: Order | null) {
  if (!order) {
    return;
  }
  if (order.status !== "pending") {
    return;
  }
  if (order.total <= 0) {
    throw new Error("Order total must be greater than zero");
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
- [ ] Smallest change selected that fully solves the task
- [ ] Existing codebase helpers, stdlib, or dependencies reused before adding new code
- [ ] No new dependency added for a few lines of code
- [ ] Non-trivial logic leaves one small test or assert-based self-check
- [ ] Validation at trust boundaries preserved
- [ ] Error handling that prevents data loss preserved
- [ ] Security and accessibility preserved
- [ ] Comment `shortcut: <limit>, <when to upgrade>` added if a known limit exists
- [ ] Reply ends with what was skipped or not checked, and any risk the user must know
- [ ] Test suite passes before and after the change
```

---

## References

- `tech-debt` - when identifying technical debt to prioritize simplification targets
