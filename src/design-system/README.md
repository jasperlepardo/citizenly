# Citizenly RBI Design System

A comprehensive design system for the Records of Barangay Inhabitants (RBI) system, designed specifically for Philippine government digital services.

## 🎨 Design Philosophy

This design system is built on the principles of:

- **Accessibility**: WCAG 2.1 AA compliance by default
- **Consistency**: Unified visual language across all interfaces
- **Philippine Identity**: Colors and patterns inspired by Philippine government standards
- **Scalability**: Modular tokens that grow with the system
- **Developer Experience**: Type-safe tokens with excellent tooling

## 🚀 Quick Start

```tsx
import { designTokens, getColor, getRBIColor } from '@/design-system';

// Use design tokens directly
const primaryBlue = designTokens.colors.primary[500]; // #3b82f6

// Use utility functions
const textColor = getColor('neutral.800'); // #262626
const sectoralColor = getRBIColor('laborForce'); // #059669
```

## 🎨 Color System

### Core Color Palette

| Color Family       | Base Token      | Usage                                       |
| ------------------ | --------------- | ------------------------------------------- |
| Primary (Blue)     | `primary.500`   | Government actions, links, primary CTAs     |
| Secondary (Purple) | `secondary.700` | Administrative functions, secondary actions |
| Success (Emerald)  | `success.600`   | Positive states, completed actions          |
| Warning (Orange)   | `warning.600`   | Caution states, pending actions             |
| Danger (Red)       | `danger.600`    | Error states, destructive actions           |
| Neutral (Gray)     | `neutral.700`   | Text, borders, backgrounds                  |

### RBI-Specific Colors

Special colors for Philippine government and sectoral classifications:

```tsx
// Philippine flag colors
bg - rbi - flag - blue; // #0038a8
bg - rbi - flag - red; // #ce1126
bg - rbi - flag - yellow; // #fcd116

// Sectoral classification colors
text - rbi - labor - force; // Green for employed residents
text - rbi - senior; // Purple for senior citizens
text - rbi - youth; // Blue for youth demographics
text - rbi - pwd; // Orange for PWD classification
text - rbi - migrant; // Indigo for migrant status
```

### Usage Examples

```tsx
// Tailwind classes (recommended)
<div className="bg-blue-500 text-gray-50">
<button className="bg-green-600 hover:bg-green-700">
<span className="text-rbi-labor-force">Employed</span>

// Utility functions
const styles = {
  backgroundColor: getColor('primary.500'),
  color: getRBIColor('seniorCitizen')
};
```

## ✍️ Typography

### Font Stack

- **Primary**: Inter (with system fallbacks)
- **Display**: Inter (for headings)
- **Monospace**: System monospace stack

### Type Scale

| Size | Token  | Usage                           |
| ---- | ------ | ------------------------------- |
| 72px | `7xl`  | Statistical displays (StatCard) |
| 36px | `4xl`  | Page headers (H1)               |
| 24px | `2xl`  | Section headers (H2)            |
| 18px | `lg`   | Subsection headers (H3)         |
| 16px | `base` | Body text (default)             |
| 14px | `sm`   | Helper text, captions           |
| 12px | `xs`   | Fine print, labels              |

### Usage Examples

```tsx
// Tailwind classes
<h1 className="text-4xl font-bold text-gray-800">
<p className="text-base leading-6 text-gray-700">
<span className="text-xs text-gray-500">

// Utility functions
const headingStyle = getHeadingStyle(1); // Returns complete H1 config
const fontSize = getFontSize('lg');      // Returns ['18px', { lineHeight: '28px' }]
```

## 📏 Spacing System

Based on a **4px grid system** for consistent layout:

| Token | Value | Usage                           |
| ----- | ----- | ------------------------------- |
| `1`   | 4px   | Minimal spacing, borders        |
| `2`   | 8px   | Small gaps, tight padding       |
| `4`   | 16px  | **Base unit** - default spacing |
| `6`   | 24px  | Medium spacing, card padding    |
| `8`   | 32px  | Large spacing, section gaps     |
| `12`  | 48px  | Extra large spacing             |
| `20`  | 80px  | Page-level spacing              |

### Usage Examples

```tsx
// Tailwind classes
<div className="p-4 m-6 gap-2">        // 16px padding, 24px margin, 8px gap
<div className="space-y-8">             // 32px vertical spacing

// Utility functions
const spacing = getSpacing('4');                    // '16px'
const responsive = getResponsiveSpacing('4');       // Responsive spacing object
```

## 🌟 Shadows & Elevation

Consistent shadow system for elevation and focus states:

| Token                  | Usage                             |
| ---------------------- | --------------------------------- |
| `shadow-sm`            | Subtle cards, input borders       |
| `shadow-md`            | **Default cards**, dropdown menus |
| `shadow-lg`            | Modal overlays, important cards   |
| `shadow-xl`            | Major modals, toast notifications |
| `shadow-soft`          | Custom subtle elevation           |
| `shadow-primary-focus` | Primary button/input focus        |

## 🧩 Component Tokens

Pre-configured tokens for common UI patterns:

### Buttons

```tsx
const buttonStyles = getButtonStyles('primary', 'md');
// Returns complete button configuration including:
// - Height, padding, border radius
// - Colors, hover states, focus rings
// - Typography, transitions
```

### Form Inputs

```tsx
const inputStyles = getInputStyles('focus');
// Returns complete input configuration for different states:
// - default, focus, error, success, disabled
```

## 🔍 RBI-Specific Features

### Sectoral Classification Colors

Semantic colors for different resident classifications:

```tsx
import { getSectoralBadgeColor } from '@/design-system';

// Get badge colors for sectoral groups
const laborForceBadge = getSectoralBadgeColor('laborForce', 'solid');
const seniorBadge = getSectoralBadgeColor('seniorCitizen', 'outline');
const youthBadge = getSectoralBadgeColor('youth', 'subtle');
```

### Household Type Styling

Visual indicators for different household compositions:

```tsx
import { getHouseholdTypeStyle } from '@/design-system';

const nuclearFamily = getHouseholdTypeStyle('nuclear'); // { icon: '👪', color: '#3b82f6' }
const singleParent = getHouseholdTypeStyle('single_parent'); // { icon: '👩‍👧‍👦', color: '#7c3aed' }
```

## 🛠️ Development Tools

### Design Token Validation

```tsx
import { validateDesignTokenUsage } from '@/design-system';

const componentStyles = {
  backgroundColor: '#ff0000', // ❌ Hardcoded color
  padding: '15px', // ❌ Non-standard spacing
  borderRadius: '6px', // ✅ Uses design token
};

const validation = validateDesignTokenUsage(componentStyles);
// Returns warnings and suggestions for better token usage
```

### Accessibility Checking

```tsx
import { checkContrast, getFocusRing } from '@/design-system';

// Check if color combination meets WCAG standards
const isAccessible = checkContrast(textColor, backgroundColor, 'AA');

// Get proper focus ring styles
const focusStyles = getFocusRing('primary');
```

## 📱 Responsive Design

All tokens work seamlessly with Tailwind's responsive prefixes:

```tsx
<div className="p-2 md:p-4 lg:p-6">           // Responsive padding
<h1 className="text-2xl md:text-4xl">         // Responsive typography
<div className="bg-blue-500 md:bg-blue-600"> // Responsive colors
```

## 🎯 Best Practices

### ✅ Do

- Use design tokens instead of hardcoded values
- Use semantic colors (success, warning, danger) for states
- Follow the 4px spacing grid
- Use RBI-specific colors for sectoral classifications
- Test with all color variants and states
- Use utility functions for complex styling logic

### ❌ Don't

- Hardcode colors, spacing, or typography values
- Create custom shadows or border radius values
- Use non-standard spacing (not on 4px grid)
- Mix different color families inconsistently
- Skip accessibility contrast checks

## 🔗 Related Files

- [`tokens.ts`](./tokens.ts) - Core design token definitions
- [`utils.ts`](./utils.ts) - Utility functions and helpers
- [`index.ts`](./index.ts) - Main exports and quick reference
- [`../app/globals.css`](../app/globals.css) - CSS custom properties
- [`../../tailwind.config.js`](../../tailwind.config.js) - Tailwind configuration

## 📚 Examples

### Complete Component Example

```tsx
import { getButtonStyles, getSectoralBadgeColor, getSpacing } from '@/design-system';

function ResidentCard({ resident }) {
  const badgeColor = getSectoralBadgeColor(resident.classification, 'subtle');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{resident.name}</h3>
        <span className="rounded px-2 py-1 text-xs font-medium" style={badgeColor}>
          {resident.classification}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>Age: {resident.age}</div>
        <div>Household: {resident.householdCode}</div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          View Details
        </button>
        <button className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
          Edit
        </button>
      </div>
    </div>
  );
}
```

This design system provides everything needed to build consistent, accessible, and beautiful interfaces for the Philippine government's RBI system.
