# RBI System Component Library

A comprehensive React component library built using Atomic Design principles for the RBI (Records of Barangay Inhabitant) System. This library provides consistent, accessible, and reusable UI components following modern design patterns.

## 🏗️ Architecture

The component library follows **Brad Frost's Atomic Design methodology**:

```
├── tokens/          # Design tokens (colors, spacing, typography)
├── atoms/           # Basic UI elements (Button, Input, Typography)
├── molecules/       # Simple component combinations (InputField, SearchBar)
├── organisms/       # Complex UI sections (DataTable, Navigation, Forms)
├── templates/       # Page layouts (DashboardLayout, MainLayout)
├── providers/       # React context providers
└── types/           # Shared TypeScript interfaces
```

## 🎨 Design System

### Design Tokens

- **Colors**: Semantic color system with theme support
- **Typography**: Consistent font scales and hierarchies
- **Spacing**: Standardized spacing scale
- **Shadows**: Elevation system for depth
- **Layout**: Grid and container systems

### Key Features

- 🌗 **Dark/Light Theme Support**
- ♿ **WCAG 2.1 AA Accessibility**
- 📱 **Responsive Design**
- 🔧 **TypeScript Support**
- 📚 **Storybook Documentation**
- 🧪 **Comprehensive Testing**

## 🧱 Component Categories

### Atoms (Basic Elements)

| Component    | Description                    | Key Features                        |
| ------------ | ------------------------------ | ----------------------------------- |
| `Button`     | Versatile button with variants | 12 variants, icons, loading states  |
| `Input`      | Basic input element            | States, icons, validation           |
| `Typography` | Text display                   | Semantic hierarchy, responsive      |
| `Checkbox`   | Selection control              | Indeterminate state, custom styling |
| `Radio`      | Single selection               | Grouped controls                    |
| `Select`     | Dropdown selection             | Custom styling, searchable          |

### Molecules (Component Combinations)

| Component         | Description               | Key Features                   |
| ----------------- | ------------------------- | ------------------------------ |
| `InputField`      | Complete input with label | Validation, icons, helper text |
| `SearchBar`       | Search interface          | Filtering, suggestions         |
| `StatsCard`       | Metric display            | Trends, icons, variants        |
| `AccessibleModal` | Dialog component          | Focus trap, keyboard nav       |
| `FormSection`     | Semantic form grouping    | Fieldset/legend, accessibility |

### Organisms (Complex Sections)

| Component             | Description        | Key Features                        |
| --------------------- | ------------------ | ----------------------------------- |
| `DataTable`           | Data display table | Sorting, filtering, pagination      |
| `Navigation`          | Main navigation    | Mobile responsive, breadcrumbs      |
| `PersonalInformation` | RBI form section   | Validation, Philippine localization |
| `PopulationPyramid`   | Demographics chart | Interactive, responsive             |

### Templates (Page Layouts)

| Component             | Description        | Key Features                  |
| --------------------- | ------------------ | ----------------------------- |
| `DashboardLayout`     | Main app layout    | Sidebar, header, responsive   |
| `MainLayout`          | Basic page layout  | Navigation, footer            |
| `ResidentFormWizard`  | Multi-step form    | Progress tracking, validation |
| `HouseholdFormWizard` | Household creation | Step-by-step guidance         |

## 🚀 Usage

### Installation

```bash
# Components are internal to the project
import { Button, InputField } from '@/components';
```

### Basic Usage

```tsx
import { Button, InputField, StatsCard } from '@/components';

function MyForm() {
  return (
    <div className="space-y-4">
      <InputField label="Email Address" type="email" placeholder="Enter your email" required />

      <Button variant="primary" size="lg">
        Submit Form
      </Button>
    </div>
  );
}
```

### Advanced Usage

```tsx
import { AccessibleModal, FormSection, DataTable, ResidentFormWizard } from '@/components';

function AdvancedExample() {
  return (
    <AccessibleModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Add New Resident"
      size="lg"
    >
      <ResidentFormWizard onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
    </AccessibleModal>
  );
}
```

## 🎯 Design Principles

### 1. Accessibility First

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- Focus management
- ARIA attributes

### 2. Consistency

- Standardized prop interfaces
- Semantic color system
- Consistent spacing scale
- Predictable behavior patterns

### 3. Flexibility

- Variant-based styling (CVA)
- Comprehensive prop APIs
- Theme customization
- Responsive design

### 4. Performance

- Tree-shakable exports
- Optimized bundle size
- Lazy loading support
- Minimal re-renders

## 📝 Component Standards

### Prop Interface Standards

All form components implement standardized interfaces:

```tsx
interface BaseFieldSetProps {
  label?: string; // Field label
  helperText?: string; // Helper text
  errorMessage?: string; // Error message
  required?: boolean; // Required indicator
  disabled?: boolean; // Disabled state
  className?: string; // Custom styles
}
```

### Icon Standards

Consistent icon prop naming:

- `leftIcon` / `rightIcon` - Icon positioning
- `leftAddon` / `rightAddon` - Addon content (currency, units)

### Validation Standards

- `errorMessage` overrides `helperText`
- Visual error states with appropriate colors
- ARIA error announcements

### Accessibility Standards

- Semantic HTML elements
- Proper ARIA attributes
- Focus management
- Screen reader support
- Keyboard navigation

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Visual Regression

```bash
npm run test:visual
```

### Accessibility Tests

```bash
npm run test:a11y
```

### Storybook

```bash
npm run storybook
```

## 📚 Documentation

### Storybook

All components include comprehensive Storybook documentation with:

- Interactive examples
- Prop controls
- Code snippets
- Accessibility notes
- Design guidelines

### JSDoc Comments

All components include detailed JSDoc with:

- Component description
- Usage examples
- Prop documentation
- Accessibility notes

## 🔧 Development

### Adding New Components

1. **Choose the correct category** (atoms/molecules/organisms/templates)
2. **Create component directory** with consistent structure:

   ```
   ComponentName/
   ├── ComponentName.tsx      # Main component
   ├── ComponentName.stories.tsx  # Storybook stories
   ├── index.ts              # Exports
   └── __tests__/            # Tests (optional)
   ```

3. **Follow naming conventions**:
   - PascalCase for components
   - camelCase for props
   - Descriptive, not verbose names

4. **Include required documentation**:
   - JSDoc comments
   - Storybook stories
   - Usage examples

5. **Update exports**:
   ```tsx
   // Add to atoms/index.ts, molecules/index.ts, etc.
   export * from './ComponentName';
   ```

### Component Template

````tsx
'use client';

/**
 * ComponentName
 *
 * Brief description of what the component does.
 *
 * @example
 * ```tsx
 * <ComponentName prop="value">
 *   Content
 * </ComponentName>
 * ```
 */
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ComponentName props
 */
interface ComponentNameProps {
  /** Prop description */
  propName?: string;

  /** Additional CSS classes */
  className?: string;
}

export default function ComponentName({ propName, className }: ComponentNameProps) {
  return <div className={cn('base-classes', className)}>{/* Component content */}</div>;
}

// Named export for consistency
export { ComponentName };
````

## 🤝 Contributing

1. **Follow established patterns** - Look at existing components for consistency
2. **Write comprehensive tests** - Include unit tests and accessibility tests
3. **Document everything** - JSDoc, Storybook, and README updates
4. **Consider accessibility** - Follow WCAG guidelines and test with screen readers
5. **Performance matters** - Optimize for bundle size and runtime performance

## 📖 Resources

- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Class Variance Authority](https://cva.style/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🏷️ Component Status

✅ **Complete**: Well-documented, tested, and stable
🚧 **In Progress**: Functional but needs improvement
❌ **Deprecated**: Use alternative component

| Component          | Status | Notes                          |
| ------------------ | ------ | ------------------------------ |
| Button             | ✅     | Complete with all variants     |
| InputField         | ✅     | Full feature set               |
| StatsCard          | ✅     | Preferred over StatCard        |
| AccessibleModal    | ✅     | Full accessibility support     |
| DataTable          | 🚧     | Needs pagination improvements  |
| ResidentFormWizard | ✅     | Philippine-specific validation |
