# RBI System - Design Reference

## Unified Design System, UX Patterns, and Visual Guidelines

---

## 📐 Design System Overview

### Core Design Resources

- **[JSPR Design System](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)** - Complete component library
- **[RBI Mobile App Design](https://www.figma.com/design/bUrCGYXnqbJMZ0QOzVXKFn/RBI-Mobile-App?t=5AC2fFPemOImA5UD-0)** - Mobile patterns
- **[RBI Web App Design](https://www.figma.com/design/J6oQCLT0PBzc8vUoKdD0Gv/RBI-Web-App?t=5AC2fFPemOImA5UD-0)** - Desktop patterns

### Design Philosophy

- **Government-compliant** - Follows Philippine government digital standards
- **Accessibility-first** - WCAG 2.1 AA compliance
- **Mobile-responsive** - Mobile-first approach for field workers
- **Culturally appropriate** - Philippine context and language considerations

---

## 🎨 Visual Design System

### Color Palette

#### Primary Colors (Philippine Flag Inspired)

```css
--color-primary-blue: #00208d; /* Royal Blue - Headers, primary actions */
--color-primary-red: #ff0026; /* Flag Red - Alerts, important notices */
--color-primary-yellow: #fdd000; /* Sun Yellow - Highlights, accents */
--color-primary-white: #ffffff; /* Pure White - Backgrounds */
```

#### Semantic Colors

```css
--color-success: #16a34a; /* Green - Success states */
--color-warning: #eab308; /* Amber - Warning states */
--color-error: #dc2626; /* Red - Error states */
--color-info: #0ea5e9; /* Sky Blue - Information */
```

#### Neutral Scale

```css
--color-gray-50: #f9fafb; /* Lightest backgrounds */
--color-gray-100: #f3f4f6; /* Light backgrounds */
--color-gray-200: #e5e7eb; /* Borders light */
--color-gray-300: #d1d5db; /* Borders default */
--color-gray-400: #9ca3af; /* Disabled text */
--color-gray-500: #6b7280; /* Placeholder text */
--color-gray-600: #4b5563; /* Secondary text */
--color-gray-700: #374151; /* Body text */
--color-gray-800: #1f2937; /* Headings */
--color-gray-900: #111827; /* Darkest text */
```

### Typography

#### Font Stack

```css
--font-primary: 'Montserrat', -apple-system, system-ui, sans-serif;
--font-secondary: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

#### Type Scale

```css
--text-xs: 0.75rem; /* 12px - Captions */
--text-sm: 0.875rem; /* 14px - Small text */
--text-base: 1rem; /* 16px - Body text */
--text-lg: 1.125rem; /* 18px - Large body */
--text-xl: 1.25rem; /* 20px - Small headings */
--text-2xl: 1.5rem; /* 24px - Headings */
--text-3xl: 1.875rem; /* 30px - Large headings */
--text-4xl: 2.25rem; /* 36px - Display */
```

### Spacing System

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

---

## 🧩 Component Patterns

### Atomic Design Structure

```
atoms/          # Basic building blocks
├── Button      # Primary, secondary, danger variants
├── Input       # Text, number, date inputs
├── Label       # Form labels
└── Icon        # Icon components

molecules/      # Composed components
├── FormField   # Label + Input + Error
├── SearchBar   # Input + Button + Icon
├── Card        # Container with styling
└── Modal       # Overlay dialog

organisms/      # Complex components
├── DataTable   # Sortable, filterable tables
├── ResidentForm # Multi-step form wizard
├── Dashboard   # Stats and charts
└── Navigation  # Header + Sidebar

templates/      # Page layouts
├── DashboardLayout
├── FormLayout
└── ListLayout
```

### Component Design Principles

1. **Consistent spacing** - Use spacing tokens
2. **Clear hierarchy** - Visual weight guides attention
3. **Touch-friendly** - 44px minimum touch targets
4. **Loading states** - Skeleton screens and spinners
5. **Error handling** - Clear, actionable error messages

---

## 📱 UX Workflows

### Core User Flows

#### 1. Resident Registration Flow

```
Dashboard → Add Resident → Multi-Step Form → Review → Submit
    ↓           ↓              ↓              ↓         ↓
Quick Action  Validation   Auto-Calculate  Confirm   Success
```

**Key UX Considerations:**

- Progress indicator shows current step
- Auto-save draft functionality
- Inline validation with helpful messages
- Review screen before submission
- Success confirmation with next actions

#### 2. Search & Filter Flow

```
Search Bar → Results List → Detail View → Actions
     ↓           ↓             ↓           ↓
Auto-complete  Pagination   Quick View   Edit/Print
```

**Key UX Considerations:**

- Search-as-you-type with debouncing
- Clear filter badges
- Persistent search state
- Bulk selection for batch operations

#### 3. Dashboard Information Architecture

```
Overview Tab
├── Population Statistics (Card)
├── Demographics Chart (Visual)
├── Recent Activities (List)
└── Quick Actions (Buttons)

Management Tabs
├── Residents (CRUD)
├── Households (CRUD)
├── Reports (Generate)
└── Settings (Config)
```

### Mobile-First Patterns

#### Touch Interactions

- **Swipe gestures** for navigation
- **Pull-to-refresh** for data updates
- **Long press** for context menus
- **Pinch-to-zoom** for charts

#### Responsive Breakpoints

```css
--mobile: 320px-767px; /* Single column */
--tablet: 768px-1023px; /* Two columns */
--desktop: 1024px+; /* Multi-column */
```

---

## 🎯 Design Implementation Guide

### Development Workflow

1. **Check Figma** → Latest designs
2. **Use tokens** → Design system values
3. **Component first** → Check existing components
4. **Test responsive** → Mobile, tablet, desktop
5. **Verify a11y** → Screen reader, keyboard nav

### Design Token Usage

```typescript
// ✅ Good - Uses design tokens
<Button className="bg-primary-blue text-white px-4 py-2">

// ❌ Bad - Hardcoded values
<Button style={{ background: '#00208D', padding: '8px 16px' }}>
```

### Accessibility Checklist

- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Touch targets ≥ 44x44px
- [ ] Error messages clear
- [ ] Loading states announced

---

## 📊 Design Metrics

### Performance Targets

- **First Contentful Paint**: <1.8s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Usability Metrics

- **Task Success Rate**: >95%
- **Error Rate**: <3%
- **Time on Task**: <2 min average
- **User Satisfaction**: >4.5/5

---

## 🔗 Resources

### Design Files

- [Figma Component Library](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System)
- [Mobile App Designs](https://www.figma.com/design/bUrCGYXnqbJMZ0QOzVXKFn/RBI-Mobile-App)
- [Web App Designs](https://www.figma.com/design/J6oQCLT0PBzc8vUoKdD0Gv/RBI-Web-App)

### Development Resources

- [Component Library Docs](./COMPONENT_LIBRARY.md)
- [Frontend Architecture](../architecture/FRONTEND_ARCHITECTURE.md)
- [Implementation Guide](../development/IMPLEMENTATION_GUIDE.md)

### External References

- [Philippine Government Design Standards](https://www.gov.ph/design-standards)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)

---

**Design Reference Status**: ✅ **Production Ready**  
This unified reference consolidates all design system documentation, providing a single source of truth for visual design, UX patterns, and implementation guidelines.
