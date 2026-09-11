---
name: frontend-patterns
description: 'Use this skill when making structural frontend decisions - component architecture, client state vs server state, data fetching patterns, rendering strategy, and frontend performance patterns. Load when the question is not "build this component" but "how should this part of the app be structured". For visual design and component implementation, use ui-design instead. Triggers include: "component architecture", "state management", "data fetching pattern", "which state library", "rendering strategy", "frontend performance", "folder structure frontend", "server state vs client state".'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Frontend Patterns

Structural decision patterns for frontend applications. Complements `ui-design` (which owns visual design and component implementation): this skill owns *how the frontend is architected*.

---

## When to Use This Skill

| Situation | Use this skill | Use ui-design instead |
|---|---|---|
| "How do I structure state for this feature?" | Yes | |
| "Build this component per the mockup" | | Yes |
| "Where does data fetching live?" | Yes | |
| "Is this layout accessible?" | | Yes |
| "Split app or server components?" | Yes | |

---

## State Ownership

Classify every piece of state before choosing a home:

1. **Server state** (data owned by the backend): lives in a data-fetching layer (React Query, SWR, or framework-native caching). Never copied into local state as a duplicate source of truth.
2. **Shared client state** (UI state needed across distant components): context or a small store. Keep the surface minimal; do not move server data here.
3. **Local state** (one component's concern): `useState`/component-local. Default choice - escalate only when proven insufficient.

Rule: duplicated sources of truth are a defect. If the same data exists in two places, one must derive from the other.

---

## Data Fetching

- Fetch in the layer closest to the rendering boundary the framework recommends (server components/RSC, route loaders, or top-of-tree effects with a query library).
- Every data-driven view implements loading, empty, and error states explicitly.
- Prefer cache invalidation over manual refetching; understand staleness rules before fighting them.

---

## Rendering Strategy Decision

| Requirement | Strategy |
|---|---|
| Content changes rarely, needs SEO | Static generation |
| Content per-user or per-request | Server rendering |
| App-like, behind auth, speed over SEO | Client rendering / SPA shell |
| Mixed marketing + app | Hybrid (static shell + islands/client components) |

---

## Component Architecture

- Smart/split rule: containers orchestrate data; leaf components are presentational and prop-driven.
- Co-locate: component, its styles, its tests, and its types live together in one folder.
- Prop drilling beyond 2 levels is a signal: lift, compose children, or introduce context - not a global store.

---

## Folder Structure (framework-agnostic)

```text
src/
  features/<feature>/   # feature-first: components, hooks, api for one feature
  shared/components/    # cross-feature reusable, no domain logic
  shared/lib/           # framework utilities
```

Feature-first beats layer-first once the app has more than ~3 pages; layer-first scatters one feature across many folders.

---

## Performance Patterns (order of impact)

1. Ship less JavaScript: server rendering, code splitting by route.
2. Avoid waterfall fetches: parallelize independent requests.
3. Memoize expensive derivations and stabilize object/function props passed to memoized children.
4. Virtualize long lists only after measuring.

Measure before optimizing: render profiling or bundle analysis first, changes after.

---

## Checklist

```markdown
- [ ] Every state item classified: server, shared client, or local
- [ ] No duplicated sources of truth
- [ ] Loading, empty, and error states implemented per view
- [ ] Fetches not waterfalled; staleness/invalidation understood
- [ ] Rendering strategy chosen deliberately, not by default
- [ ] Feature-first folder structure for multi-page apps
```

---

## References

- For component and visual implementation: use `ui-design`
- For styling systems and tokens: use `ui-design`
- For API shape behind the fetch layer: use `api-conventions`