---
name: web-accessibility
description: 'Use this skill when auditing or implementing web accessibility (WCAG 2.1), ARIA roles, keyboard navigation, or screen reader support. Trigger with "accessibility", "WCAG", "a11y", "keyboard navigation", "screen reader", "ARIA", "color contrast", or when auditing UI accessibility. Do not implement UI accessibility without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
---

# Web Accessibility (WCAG 2.1)

Guidelines for building accessible user interfaces that work for all users.

---

## Core WCAG Checklist

1. **Perceivable**: Text contrast ratio >= 4.5:1 (large text >= 3:1). Alt text for all images.
2. **Operable**: All interactive elements operable via keyboard (`Tab`, `Space`, `Enter`, `Escape`). Visible focus rings (`focus-visible`). Touch targets >= 44x44px.
3. **Understandable**: Form inputs have associated `<label>` elements. Error messages announced via `aria-live`.
4. **Robust**: Semantic HTML tags (`<nav>`, `<main>`, `<button>`) with proper ARIA attributes (`aria-expanded`, `aria-label`).

---

## Verification Checklist

```markdown
- [ ] Keyboard navigation tested (Tab, Enter, Space, Escape)
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Focus indicators visible on interactive elements
- [ ] Form inputs linked to labels via `for`/`id`
- [ ] Motion respects `prefers-reduced-motion`
```
