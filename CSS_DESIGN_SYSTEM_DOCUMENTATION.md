# CSS Design System Documentation

## Overview

This document outlines the comprehensive CSS design system implementation using Tailwind 4's CSS-first approach with custom properties. The system provides consistent sizing, spacing, and component tokens across all UI components.

## Architecture

### Tailwind 4 CSS-First Approach

Our design system leverages Tailwind 4's `@theme` directive to define CSS custom properties that serve as the foundation for all component styling.

```css
@theme {
  /* CSS custom properties defined here become available as Tailwind utilities */
  --spacing-16: 16px;
  --size-button-md: 40px;
}
```

### Design Token Hierarchy

```
Foundation Tokens (Raw Values)
    ↓
Semantic Tokens (Purpose-based)
    ↓
Component Tokens (Component-specific)
    ↓
Utility Classes (Implementation)
```

## Foundation Tokens

### Spacing Scale

1:1 pixel mapping with Tailwind aliases - **intuitive and predictable**:

```css
/* Foundation spacing - Tailwind naming with pixel-perfect values */
--spacing-0: 0px;      /* space-0 */
--spacing-1: 1px;      /* space-1 */
--spacing-2: 2px;      /* space-2 */
--spacing-4: 4px;      /* space-4 */
--spacing-6: 6px;      /* space-6 */
--spacing-8: 8px;      /* space-8 */
--spacing-10: 10px;    /* space-10 */
--spacing-12: 12px;    /* space-12 */
--spacing-14: 14px;    /* space-14 */
--spacing-16: 16px;    /* space-16 */
--spacing-20: 20px;    /* space-20 */
--spacing-24: 24px;    /* space-24 */
--spacing-28: 28px;    /* space-28 */
--spacing-32: 32px;    /* space-32 */
--spacing-36: 36px;    /* space-36 */
--spacing-40: 40px;    /* space-40 */
--spacing-44: 44px;    /* space-44 */
--spacing-48: 48px;    /* space-48 */
--spacing-52: 52px;    /* space-52 */
--spacing-56: 56px;    /* space-56 */
--spacing-60: 60px;    /* space-60 */
--spacing-64: 64px;    /* space-64 */
--spacing-72: 72px;    /* space-72 */
--spacing-80: 80px;    /* space-80 */
--spacing-96: 96px;    /* space-96 */
--spacing-112: 112px;  /* space-112 */
--spacing-128: 128px;  /* space-128 */
--spacing-144: 144px;  /* space-144 */
--spacing-160: 160px;  /* space-160 */
--spacing-192: 192px;  /* space-192 */
--spacing-224: 224px;  /* space-224 */
--spacing-256: 256px;  /* space-256 */
--spacing-288: 288px;  /* space-288 */
--spacing-320: 320px;  /* space-320 */
--spacing-384: 384px;  /* space-384 */
```

### Border Radius Scale

```css
/* Border radius using actual pixel dimensions */
--radius-0: 0px;
--radius-2: 2px;
--radius-4: 4px;
--radius-6: 6px;
--radius-8: 8px;
--radius-12: 12px;
--radius-16: 16px;
--radius-20: 20px;
--radius-24: 24px;
--radius-28: 28px;
--radius-32: 32px;
--radius-full: 9999px;
```

## Semantic Tokens

Purpose-based tokens that reference foundation tokens:

### Spacing Tokens

```css
/* Micro spacing for fine adjustments */
--spacing-none: var(--spacing-0);     /* 0px */
--spacing-micro: var(--spacing-2);    /* 2px */
--spacing-tiny: var(--spacing-4);     /* 4px */

/* Core spacing scale */
--spacing-xs: var(--spacing-8);       /* 8px */
--spacing-sm: var(--spacing-12);      /* 12px */
--spacing-md: var(--spacing-16);      /* 16px (base) */
--spacing-lg: var(--spacing-24);      /* 24px */
--spacing-xl: var(--spacing-32);      /* 32px */
--spacing-2xl: var(--spacing-40);     /* 40px */
--spacing-3xl: var(--spacing-48);     /* 48px */
--spacing-4xl: var(--spacing-64);     /* 64px */
--spacing-5xl: var(--spacing-80);     /* 80px */
--spacing-6xl: var(--spacing-96);     /* 96px */

/* Layout spacing for larger gaps */
--spacing-section: var(--spacing-112); /* 112px */
--spacing-page: var(--spacing-128);    /* 128px */
--spacing-hero: var(--spacing-160);    /* 160px */
```

### Border Radius Tokens

```css
/* No radius */
--radius-none: var(--radius-0);    /* 0px */

/* Core radius scale */
--radius-xs: var(--radius-2);      /* 2px - Very subtle */
--radius-sm: var(--radius-4);      /* 4px - Subtle */
--radius-md: var(--radius-6);      /* 6px - Default */
--radius-lg: var(--radius-8);      /* 8px - Prominent */
--radius-xl: var(--radius-12);     /* 12px - Very prominent */
--radius-2xl: var(--radius-16);    /* 16px - Extra prominent */
--radius-3xl: var(--radius-20);    /* 20px - Maximum */
--radius-4xl: var(--radius-24);    /* 24px - Extreme */
--radius-5xl: var(--radius-28);    /* 28px - Ultra */
--radius-6xl: var(--radius-32);    /* 32px - Maximum */

/* Special radius */
--radius-circle: var(--radius-full); /* 9999px - Perfect circle */
```

## Component Tokens

### Button Component

```css
/* Button Component Heights */
--size-button-xs: 24px;      /* var(--spacing-24) */
--size-button-sm: 32px;      /* var(--spacing-32) */
--size-button-md: 40px;      /* var(--spacing-40) */
--size-button-lg: 48px;      /* var(--spacing-48) */
--size-button-xl: 56px;      /* var(--spacing-56) */

/* Button Component Padding */
--button-padding-xs: var(--spacing-4) var(--spacing-8);     /* 4px 8px */
--button-padding-sm: var(--spacing-6) var(--spacing-12);    /* 6px 12px */
--button-padding-md: var(--spacing-8) var(--spacing-16);    /* 8px 16px */
--button-padding-lg: var(--spacing-12) var(--spacing-24);   /* 12px 24px */
--button-padding-xl: var(--spacing-16) var(--spacing-32);   /* 16px 32px */

/* Button Component Gaps */
--button-gap-xs: var(--spacing-4);      /* 4px */
--button-gap-sm: var(--spacing-4);      /* 4px */
--button-gap-md: var(--spacing-6);      /* 6px */
--button-gap-lg: var(--spacing-8);      /* 8px */
--button-gap-xl: var(--spacing-10);     /* 10px */

/* Button Component Min Widths */
--button-min-width-xs: var(--spacing-48);   /* 48px */
--button-min-width-sm: var(--spacing-56);   /* 56px */
--button-min-width-md: var(--spacing-64);   /* 64px */
--button-min-width-lg: var(--spacing-80);   /* 80px */
--button-min-width-xl: var(--spacing-96);   /* 96px */

/* Button Component Icon Sizes */
--button-icon-xs: var(--spacing-12);    /* 12px */
--button-icon-sm: var(--spacing-16);    /* 16px */
--button-icon-md: var(--spacing-20);    /* 20px */
--button-icon-lg: var(--spacing-24);    /* 24px */
--button-icon-xl: var(--spacing-28);    /* 28px */
```

### Input Component

```css
/* Input Component Heights */
--size-input-xs: 28px;       /* var(--spacing-28) */
--size-input-sm: 36px;       /* var(--spacing-36) */
--size-input-md: 44px;       /* var(--spacing-44) */
--size-input-lg: 52px;       /* var(--spacing-52) */
--size-input-xl: 60px;       /* var(--spacing-60) */

/* Input Component Padding */
--input-padding-xs: var(--spacing-6) var(--spacing-10);    /* 6px 10px */
--input-padding-sm: var(--spacing-8) var(--spacing-12);    /* 8px 12px */
--input-padding-md: var(--spacing-10) var(--spacing-16);   /* 10px 16px */
--input-padding-lg: var(--spacing-12) var(--spacing-20);   /* 12px 20px */
--input-padding-xl: var(--spacing-16) var(--spacing-24);   /* 16px 24px */

/* Input Component Text Sizes */
--input-text-xs: 12px;      /* Extra small input text */
--input-text-sm: 14px;      /* Small input text */
--input-text-md: 16px;      /* Medium input text */
--input-text-lg: 18px;      /* Large input text */
--input-text-xl: 20px;      /* Extra large input text */
```

### Control Component (Checkbox, Radio)

```css
/* Control Component Sizes */
--size-control-xs: 14px;     /* var(--spacing-14) */
--size-control-sm: 16px;     /* var(--spacing-16) */
--size-control-md: 20px;     /* var(--spacing-20) */
--size-control-lg: 24px;     /* var(--spacing-24) */
--size-control-xl: 28px;     /* var(--spacing-28) */

/* Control Component Icon Sizes */
--control-icon-xs: 10px;     /* Icon size for xs controls */
--control-icon-sm: 12px;     /* Icon size for sm controls */
--control-icon-md: 14px;     /* Icon size for md controls */
--control-icon-lg: 16px;     /* Icon size for lg controls */
--control-icon-xl: 20px;     /* Icon size for xl controls */
```

### Card Component

```css
/* Card Component Tokens */
--card-padding-xs: var(--spacing-8);     /* 8px */
--card-padding-sm: var(--spacing-12);    /* 12px */
--card-padding-md: var(--spacing-24);    /* 24px */
--card-padding-lg: var(--spacing-32);    /* 32px */
--card-padding-xl: var(--spacing-40);    /* 40px */

--card-gap-xs: var(--spacing-8);         /* 8px */
--card-gap-sm: var(--spacing-12);        /* 12px */
--card-gap-md: var(--spacing-16);        /* 16px */
--card-gap-lg: var(--spacing-24);        /* 24px */
--card-gap-xl: var(--spacing-32);        /* 32px */
```

### Modal Component

```css
/* Modal Component Tokens */
--modal-padding-xs: var(--spacing-24);   /* 24px */
--modal-padding-sm: var(--spacing-32);   /* 32px */
--modal-padding-md: var(--spacing-40);   /* 40px */
--modal-padding-lg: var(--spacing-48);   /* 48px */
--modal-padding-xl: var(--spacing-64);   /* 64px */

--modal-gap-xs: var(--spacing-16);       /* 16px */
--modal-gap-sm: var(--spacing-24);       /* 24px */
--modal-gap-md: var(--spacing-32);       /* 32px */
--modal-gap-lg: var(--spacing-40);       /* 40px */
--modal-gap-xl: var(--spacing-48);       /* 48px */
```

### Table Component

```css
/* Table Component Tokens */
--table-cell-padding-xs: var(--spacing-4) var(--spacing-8);   /* 4px 8px */
--table-cell-padding-sm: var(--spacing-6) var(--spacing-12);  /* 6px 12px */
--table-cell-padding-md: var(--spacing-8) var(--spacing-16);  /* 8px 16px */
--table-cell-padding-lg: var(--spacing-12) var(--spacing-24); /* 12px 24px */
--table-cell-padding-xl: var(--spacing-16) var(--spacing-32); /* 16px 32px */

--table-text-xs: 12px;      /* Extra small table text */
--table-text-sm: 14px;      /* Small table text */
--table-text-md: 16px;      /* Medium table text */
--table-text-lg: 18px;      /* Large table text */
--table-text-xl: 20px;      /* Extra large table text */
```

## Utility Classes

### Button Size Classes

```css
@layer components {
  .btn-xs {
    height: var(--size-button-xs);
    padding: var(--button-padding-xs);
    min-width: var(--button-min-width-xs);
    gap: var(--button-gap-xs);
    @apply text-xs;
  }

  .btn-sm {
    height: var(--size-button-sm);
    padding: var(--button-padding-sm);
    min-width: var(--button-min-width-sm);
    gap: var(--button-gap-sm);
    @apply text-sm;
  }

  .btn-md {
    height: var(--size-button-md);
    padding: var(--button-padding-md);
    min-width: var(--button-min-width-md);
    gap: var(--button-gap-md);
    @apply text-base;
  }

  .btn-lg {
    height: var(--size-button-lg);
    padding: var(--button-padding-lg);
    min-width: var(--button-min-width-lg);
    gap: var(--button-gap-lg);
    @apply text-lg;
  }

  .btn-xl {
    height: var(--size-button-xl);
    padding: var(--button-padding-xl);
    min-width: var(--button-min-width-xl);
    gap: var(--button-gap-xl);
    @apply text-xl;
  }
}
```

### Input Size Classes

```css
@layer components {
  .input-xs {
    height: var(--size-input-xs);
    padding: var(--input-padding-xs);
    font-size: var(--input-text-xs);
  }

  .input-sm {
    height: var(--size-input-sm);
    padding: var(--input-padding-sm);
    font-size: var(--input-text-sm);
  }

  .input-md {
    height: var(--size-input-md);
    padding: var(--input-padding-md);
    font-size: var(--input-text-md);
  }

  .input-lg {
    height: var(--size-input-lg);
    padding: var(--input-padding-lg);
    font-size: var(--input-text-lg);
  }

  .input-xl {
    height: var(--size-input-xl);
    padding: var(--input-padding-xl);
    font-size: var(--input-text-xl);
  }
}
```

### Control Size Classes

```css
@layer components {
  .control-xs {
    width: var(--size-control-xs);
    height: var(--size-control-xs);
  }

  .control-sm {
    width: var(--size-control-sm);
    height: var(--size-control-sm);
  }

  .control-md {
    width: var(--size-control-md);
    height: var(--size-control-md);
  }

  .control-lg {
    width: var(--size-control-lg);
    height: var(--size-control-lg);
  }

  .control-xl {
    width: var(--size-control-xl);
    height: var(--size-control-xl);
  }
}
```

### Card Size Classes

```css
@layer components {
  .card-xs {
    padding: var(--card-padding-xs);
    gap: var(--card-gap-xs);
  }

  .card-sm {
    padding: var(--card-padding-sm);
    gap: var(--card-gap-sm);
  }

  .card-md {
    padding: var(--card-padding-md);
    gap: var(--card-gap-md);
  }

  .card-lg {
    padding: var(--card-padding-lg);
    gap: var(--card-gap-lg);
  }

  .card-xl {
    padding: var(--card-padding-xl);
    gap: var(--card-gap-xl);
  }
}
```

### Table Size Classes

```css
@layer components {
  .table-xs {
    font-size: var(--table-text-xs);
  }

  .table-xs .table-cell {
    padding: var(--table-cell-padding-xs);
  }

  .table-sm {
    font-size: var(--table-text-sm);
  }

  .table-sm .table-cell {
    padding: var(--table-cell-padding-sm);
  }

  .table-md {
    font-size: var(--table-text-md);
  }

  .table-md .table-cell {
    padding: var(--table-cell-padding-md);
  }

  .table-lg {
    font-size: var(--table-text-lg);
  }

  .table-lg .table-cell {
    padding: var(--table-cell-padding-lg);
  }

  .table-xl {
    font-size: var(--table-text-xl);
  }

  .table-xl .table-cell {
    padding: var(--table-cell-padding-xl);
  }
}
```

### Modal Size Classes

```css
@layer components {
  .modal-xs {
    padding: var(--modal-padding-xs);
    gap: var(--modal-gap-xs);
    width: var(--spacing-320);
  }

  .modal-sm {
    padding: var(--modal-padding-sm);
    gap: var(--modal-gap-sm);
    width: var(--spacing-384);
  }

  .modal-md {
    padding: var(--modal-padding-md);
    gap: var(--modal-gap-md);
    width: var(--spacing-448);
  }

  .modal-lg {
    padding: var(--modal-padding-lg);
    gap: var(--modal-gap-lg);
    width: var(--spacing-512);
  }

  .modal-xl {
    padding: var(--modal-padding-xl);
    gap: var(--modal-gap-xl);
    width: var(--spacing-640);
  }
}
```

## Component Usage Examples

### Button Component

```tsx
// Using size variants
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (Default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// Icon-only buttons
<Button size="md" iconOnly aria-label="Settings">
  <SettingsIcon />
</Button>
```

### Input Component

```tsx
// Using size variants
<Input size="xs" placeholder="Extra small input" />
<Input size="sm" placeholder="Small input" />
<Input size="md" placeholder="Medium input (default)" />
<Input size="lg" placeholder="Large input" />
<Input size="xl" placeholder="Extra large input" />
```

### DataTable Component

```tsx
// Using size variants
<DataTable 
  data={tableData} 
  columns={columns} 
  size="sm" // Compact table
/>

<DataTable 
  data={tableData} 
  columns={columns} 
  size="lg" // Spacious table
/>
```

### StatsCard Component

```tsx
// Using size variants
<StatsCard 
  title="Users" 
  value="1,234" 
  icon={<UsersIcon />} 
  size="sm" 
/>

<StatsCard 
  title="Revenue" 
  value="$45,678" 
  icon={<DollarIcon />} 
  size="lg" 
/>
```

## Benefits of This Approach

### 1. **Consistency**
- All components use the same foundation tokens
- Proportional scaling ensures visual harmony
- Single source of truth for all sizing decisions

### 2. **Maintainability**
- Easy to update sizing globally by changing CSS custom properties
- Clear separation between foundation, semantic, and component tokens
- Type-safe component interfaces

### 3. **Performance**
- CSS custom properties are native browser features
- No JavaScript runtime overhead for styling
- Efficient caching and rendering

### 4. **Flexibility**
- Easy to extend with new size variants
- Theme customization through CSS variable overrides
- Runtime adjustments possible through JavaScript

### 5. **Developer Experience**
- Intuitive size naming convention (xs, sm, md, lg, xl)
- Comprehensive TypeScript support
- Clear documentation and examples

## Migration Guide

### From Hardcoded Classes

```tsx
// Before
<button className="h-10 px-4 py-2 text-base">Button</button>

// After
<Button size="md">Button</Button>
```

### From Inline Styles

```tsx
// Before
<div style={{ padding: '24px', gap: '16px' }}>Card Content</div>

// After
<div className="card-md">Card Content</div>
```

## Best Practices

### 1. **Use Semantic Tokens**
Prefer semantic tokens over foundation tokens for better maintainability:

```css
/* Good */
padding: var(--spacing-md);

/* Avoid */
padding: var(--spacing-16);
```

### 2. **Component Token Consistency**
Use component-specific tokens for component styling:

```css
/* Good */
.custom-button {
  height: var(--size-button-md);
  padding: var(--button-padding-md);
}

/* Avoid mixing systems */
.custom-button {
  height: 40px;
  padding: var(--button-padding-md);
}
```

### 3. **Size Variant Naming**
Follow consistent size naming across all components:
- `xs` - Extra Small
- `sm` - Small  
- `md` - Medium (Default)
- `lg` - Large
- `xl` - Extra Large

### 4. **Proportional Scaling**
Ensure all size variants maintain proportional relationships:

```css
/* Good - Proportional scaling */
--button-padding-xs: 4px 8px;   /* 1:2 ratio */
--button-padding-sm: 6px 12px;  /* 1:2 ratio */
--button-padding-md: 8px 16px;  /* 1:2 ratio */

/* Avoid - Inconsistent ratios */
--button-padding-xs: 4px 8px;   /* 1:2 ratio */
--button-padding-sm: 6px 15px;  /* 2:5 ratio - inconsistent */
```

## Troubleshooting

### Custom Properties Not Working

1. **Check Browser Support**: Ensure CSS custom properties are supported
2. **Verify Syntax**: Make sure variable names start with `--`
3. **Check Cascade**: Verify the property is defined in the correct scope

### Size Classes Not Applying

1. **Check Import Order**: Ensure component styles load after Tailwind base
2. **Verify Class Names**: Confirm the exact class name matches the definition
3. **Check Specificity**: Ensure no other styles are overriding

### TypeScript Errors

1. **Update Interfaces**: Ensure component props include the new size variants
2. **Import Types**: Verify all necessary types are imported
3. **Check Variant Props**: Confirm variant props match the defined options

## Future Considerations

### Responsive Sizing
Consider implementing responsive size variants:

```tsx
<Button size={{ base: 'sm', md: 'md', lg: 'lg' }}>
  Responsive Button
</Button>
```

### Theme Variations
Implement theme-specific sizing adjustments:

```css
[data-theme="compact"] {
  --spacing-md: 12px; /* Reduced from 16px */
}

[data-theme="spacious"] {
  --spacing-md: 20px; /* Increased from 16px */
}
```

### Animation Support
Add transition support for size changes:

```css
.btn-xs, .btn-sm, .btn-md, .btn-lg, .btn-xl {
  transition: all 150ms ease-in-out;
}
```

This CSS design system provides a robust, scalable foundation for consistent UI component sizing across the entire application.