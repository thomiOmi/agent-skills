# UI Design Templates

## Component Template

```tsx
interface ComponentProps {
  // Props here
}

export function Component({ ...props }: ComponentProps) {
  // State: loading, empty, error, populated
  return (/* JSX */);
}
```

## Design Token Template

```css
:root {
  /* Colors */
  --color-primary: #...;
  --color-primary-hover: #...;
  --color-bg: #...;
  --color-text: #...;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;

  /* Typography */
  --font-body: 16px;
  --font-h1: 32px;
  --font-h2: 24px;

  /* Border */
  --radius-sm: 4px;
  --radius-md: 8px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```
