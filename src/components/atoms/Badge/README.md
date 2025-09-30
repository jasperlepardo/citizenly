# Badge Component

A versatile badge component for displaying status, counts, labels, and other short pieces of information.

## Usage

```tsx
import { Badge } from '@/components/atoms';

// Basic usage
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>

// With icons (SVG icons should have w-full h-full classes)
<Badge
  variant="info"
  icon={
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path d="..." />
    </svg>
  }
>
  Information
</Badge>

// Different sizes and shapes
<Badge size="sm" shape="pill">Small</Badge>
<Badge size="lg" variant="error">Large Error</Badge>

// Outlined style
<Badge variant="warning" outlined>Warning</Badge>
```

## Props

| Prop           | Type                                                                      | Default     | Description                          |
| -------------- | ------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| `children`     | `React.ReactNode`                                                         | -           | Badge content                        |
| `variant`      | `'default' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'secondary'` | `'default'` | Visual style variant                 |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                    | `'md'`      | Badge size                           |
| `shape`        | `'rounded' \| 'pill'`                                                     | `'rounded'` | Badge shape                          |
| `outlined`     | `boolean`                                                                 | `false`     | Use outlined style instead of filled |
| `icon`         | `React.ReactNode`                                                         | -           | Optional icon element                |
| `iconPosition` | `'left' \| 'right'`                                                       | `'left'`    | Icon position relative to text       |
| `className`    | `string`                                                                  | -           | Additional CSS classes               |

## Icon Guidelines

When using icons with the Badge component:

1. **Always include `className="w-full h-full"`** on SVG elements to ensure proper sizing
2. Icons automatically scale based on the badge size (sm, md, lg)
3. Use `currentColor` for fill/stroke to inherit the badge's text color

## Examples

### Status Badges

```tsx
<Badge variant="success" shape="pill">Active</Badge>
<Badge variant="warning" shape="pill">Pending</Badge>
<Badge variant="error" shape="pill">Inactive</Badge>
```

### Count Badges

```tsx
<Badge variant="error" size="sm" shape="pill">3</Badge>
<Badge variant="info" size="sm" shape="pill">12</Badge>
```

### With Custom Styling

```tsx
<Badge
  variant="info"
  className="cursor-pointer transition-opacity hover:opacity-80"
  onClick={handleClick}
>
  Clickable Badge
</Badge>
```
