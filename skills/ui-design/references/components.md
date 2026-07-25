# Component Anatomy

Every UI component should be designed with clear state coverage, accessible semantics, and consistent structure.

---

## Required States

| State | Visual | Accessibility |
| ----- | ------ | ------------- |
| default | Normal rendering | Proper role, label, and focusable if interactive |
| hover | Visual feedback on mouse over | No change (hover is pointer-only) |
| focus | Visible focus ring | `:focus-visible` outline, never `outline: none` |
| active | Pressed/selected state | `aria-pressed` for toggleable elements |
| disabled | Reduced opacity, no interaction | `aria-disabled="true"`, skip in tab order |
| loading | Spinner or skeleton | `aria-busy="true"` while loading |
| error | Error indicator | `aria-invalid="true"`, `aria-describedby` for error message |
| empty | Empty state content | Visible message, not just hidden |

---

## Common Components

### Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  children: ReactNode
  onClick: () => void
}
```

States to handle:

- default, hover, focus, active, disabled, loading
- Loading replaces children with spinner, button becomes disabled
- Icon-only variant needs `aria-label`

### Text Input

```tsx
interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}
```

States to handle:

- default, focus, disabled, error, filled
- Error state shows `aria-invalid` + error message via `aria-describedby`
- Required fields marked with `*` and `aria-required="true"`
- Hint text below input, not placeholder

### Modal / Dialog

```tsx
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}
```

Rules:

- Focus trap inside the modal when open
- Close on Escape key
- Close on backdrop click (unless confirmation needed)
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby` on title
- Prevent body scroll when open
- Return focus to trigger element on close

---

## Anti-Patterns

| Pattern | Problem | Fix |
| ------- | ------- | --- |
| `outline: none` without replacement | Keyboard users cannot see focus | Use `:focus-visible` with visible ring |
| Placeholder as label | Disappears on input, bad for a11y | Use `<label>` element |
| Single div for everything | No semantic structure | Use proper HTML elements + ARIA roles |
| Only happy path tested | Loading/error states break in production | Render all states in Storybook |
| Hardcoded pixel values | Not responsive, breaks at different sizes | Use CSS custom properties or design tokens |
