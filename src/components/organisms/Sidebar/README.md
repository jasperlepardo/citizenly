# Sidebar Component

A comprehensive sidebar navigation component for the Citizenly Philippine barangay management system. Built following atomic design principles and government UI standards.

## Features

- ✅ **Collapsible Design** - Expand/collapse functionality with smooth animations
- ✅ **Mobile Responsive** - Overlay behavior on mobile devices with backdrop
- ✅ **Dark Mode Support** - Full dark mode theming with proper contrast
- ✅ **Philippine Government Styling** - Compliant with government UI standards
- ✅ **Accessibility** - WCAG 2.1 AA compliant with proper ARIA attributes
- ✅ **TypeScript Support** - Full type safety with comprehensive interfaces
- ✅ **Customizable** - Flexible props for different layouts and behaviors

## Basic Usage

```tsx
import { Sidebar } from '@/components/organisms';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar
        title="Citizenly"
        subtitle="Barangay Management System"
        navigationItems={navigationItems}
        bottomNavigationItems={bottomNavigationItems}
        logo={<YourLogo />}
        footer={<YourFooter />}
      />
      <main className="flex-1">
        {/* Your main content */}
      </main>
    </div>
  );
}
```

## Props

### `SidebarProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigationItems` | `NavigationItem[]` | `[]` | Main navigation items array |
| `bottomNavigationItems` | `NavigationItem[]` | `[]` | Bottom section navigation items |
| `logo` | `ReactNode` | - | Logo component or element |
| `title` | `string` | `'Citizenly'` | Sidebar header title |
| `subtitle` | `string` | `'Barangay Management System'` | Sidebar header subtitle |
| `footer` | `ReactNode` | - | Footer content |
| `collapsible` | `boolean` | `true` | Enable collapse functionality |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state |
| `onCollapsedChange` | `(collapsed: boolean) => void` | - | Callback when collapse state changes |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Sidebar width |
| `position` | `'fixed' \| 'sticky' \| 'relative'` | `'sticky'` | Positioning behavior |
| `mobile` | `'hidden' \| 'overlay' \| 'push'` | `'hidden'` | Mobile display behavior |
| `mobileOpen` | `boolean` | `false` | Mobile sidebar open state |
| `onMobileToggle` | `() => void` | - | Mobile toggle callback |
| `showSubmenu` | `boolean` | `true` | Show navigation submenus |
| `showIcons` | `boolean` | `true` | Show navigation icons |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Custom content (overrides navigation) |

### `NavigationItem`

```tsx
interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  children?: NavigationItem[];
}
```

## Variants

### Size Variants

- **`sm`** (w-16) - Icon-only mode, collapsed state
- **`md`** (w-64) - Standard width, recommended for most use cases
- **`lg`** (w-80) - Wide sidebar for complex navigation
- **`xl`** (w-96) - Extra wide for detailed information

### Position Variants

- **`sticky`** - Sticks to viewport top, scrolls with content
- **`fixed`** - Fixed position, overlays content
- **`relative`** - Normal document flow positioning

### Mobile Variants

- **`hidden`** - Hidden on mobile, visible on desktop (lg+)
- **`overlay`** - Mobile overlay with backdrop
- **`push`** - Pushes content aside on mobile

## Examples

### Philippine Government Theme

```tsx
<Sidebar
  title="Sistema ng Barangay"
  subtitle="Anuling Cerca I, Mendez, Cavite"
  logo={<PhilippineFlagLogo />}
  navigationItems={[
    { name: 'Tablero', href: '/dashboard', icon: DashboardIcon },
    { name: 'Mga Residente', href: '/residents', icon: UsersIcon },
    { name: 'Mga Sambahayan', href: '/households', icon: HomeIcon },
    { name: 'Mga Sertipiko', href: '/certifications', icon: DocumentIcon },
  ]}
  footer={
    <div className="text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Bersyon 2.1.0 | DILG Approved
      </p>
    </div>
  }
/>
```

### Collapsible with Custom Logo

```tsx
<Sidebar
  collapsible
  defaultCollapsed={false}
  onCollapsedChange={(collapsed) => console.log('Sidebar collapsed:', collapsed)}
  logo={
    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
      <Shield className="h-5 w-5 text-white" />
    </div>
  }
  size="lg"
/>
```

### Mobile-First Design

```tsx
function MobileLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Sidebar
        mobile="overlay"
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />
      <main className="flex-1">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2"
        >
          <Menu />
        </button>
        {/* Content */}
      </main>
    </>
  );
}
```

### Custom Content

```tsx
<Sidebar
  logo={<Logo />}
  title="Custom Dashboard"
  children={
    <div className="space-y-6">
      <QuickStats />
      <RecentActivity />
      <CustomNavigation />
    </div>
  }
/>
```

## Accessibility

The sidebar component includes comprehensive accessibility features:

- **Semantic HTML** - Uses `<aside>`, `<nav>`, and proper heading structure
- **ARIA Labels** - Includes `aria-label` for screen readers
- **Keyboard Navigation** - Full keyboard support with proper focus management
- **Focus Indicators** - Visible focus states for all interactive elements
- **Screen Reader Support** - Descriptive labels and proper role attributes

## Styling

The component uses Tailwind CSS with design system tokens:

```css
/* Base sidebar styles */
.sidebar-base {
  @apply relative flex flex-col bg-white dark:bg-gray-900;
  @apply border-r border-gray-200 dark:border-gray-800;
  @apply transition-all duration-300 ease-in-out;
}
```

## Philippine Government Compliance

- ✅ Follows DILG UI standards
- ✅ Supports Filipino language navigation
- ✅ Uses government-approved color schemes
- ✅ Meets accessibility requirements (WCAG 2.1 AA)
- ✅ Responsive design for field work
- ✅ Dark mode for low-light conditions

## Best Practices

1. **Navigation Items** - Use clear, descriptive names in Filipino or English
2. **Icons** - Choose recognizable icons from the Lucide React library
3. **Hierarchy** - Group related items and use submenus appropriately
4. **Mobile** - Always provide mobile navigation for field workers
5. **Performance** - Use lazy loading for complex sidebar content
6. **Testing** - Test with screen readers and keyboard navigation

## Related Components

- [`Navigation`](../Navigation/README.md) - Core navigation logic
- [`Button`](../../atoms/Button/README.md) - Toggle buttons
- [`Icon`](../../atoms/Icon/README.md) - Navigation icons

## Storybook

View comprehensive examples and interactive documentation in Storybook:

```bash
npm run storybook
```

Navigate to `Organisms > Sidebar` to see all variants and use cases.