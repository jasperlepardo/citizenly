# Citizenly Component Library Documentation

A comprehensive guide to all React components in the Citizenly application, organized by atomic design principles.

## 🏗️ Architecture Overview

The component library follows **Atomic Design** principles:
- **Atoms**: Basic building blocks (buttons, inputs, labels)
- **Molecules**: Simple component groups (form fields, modals)  
- **Organisms**: Complex UI sections (forms, tables, navigation)
- **Templates**: Page-level components (layouts, wizards)

---

## 🔷 Atoms - Basic Building Blocks

| Component | Purpose | Key Props | Usage Example | Use Cases |
|-----------|---------|-----------|---------------|-----------|
| **Button** | Primary interactive element | `variant`, `size`, `disabled`, `loading`, `onClick` | `<Button variant="primary" onClick={handleClick}>Save</Button>` | Form submissions, navigation, modal triggers |
| **Input** | Basic text input field | `type`, `placeholder`, `value`, `onChange`, `disabled` | `<Input type="text" placeholder="Enter name" />` | Text entry, search fields, forms |
| **Select** | Dropdown selection | `value`, `onChange`, `children`, `disabled` | `<Select value={selected} onChange={handleSelect}>` | Single-choice selections, dropdowns |
| **Checkbox** | Boolean input | `checked`, `onChange`, `label`, `disabled` | `<Checkbox checked={isChecked} label="Accept terms" />` | Agreements, toggles, multi-select |
| **Radio** | Single selection from options | `name`, `value`, `checked`, `onChange`, `label` | `<Radio name="gender" value="male" label="Male" />` | Single-choice selections, form options |
| **Textarea** | Multi-line text input | `rows`, `placeholder`, `value`, `onChange`, `disabled` | `<Textarea rows={4} placeholder="Description..." />` | Long text entry, comments |
| **Toggle** | Switch-style boolean input | `checked`, `onChange`, `label`, `disabled` | `<Toggle checked={isEnabled} label="Notifications" />` | Settings toggles, feature switches |
| **Typography** | Standardized text elements | `variant`, `color`, `align`, `children` | `<Typography variant="h1" color="primary">Title</Typography>` | Headings, body text, captions |
| **IconButton** | Clickable icon-only button | `icon`, `onClick`, `aria-label`, `size` | `<IconButton icon="close" onClick={handleClose} />` | Close buttons, compact interfaces |
| **ErrorMessage** | Display validation errors | `message`, `visible` | `<ErrorMessage message="Field required" />` | Form validation, error states |

---

## 🔶 Molecules - Simple Component Groups

| Component | Purpose | Key Props | Usage Example | Use Cases |
|-----------|---------|-----------|---------------|-----------|
| **InputField** | Input with label and error handling | `label`, `type`, `value`, `onChange`, `errorMessage`, `required` | `<InputField label="Full Name" value={name} errorMessage={errors.name} />` | Form fields, labeled inputs |
| **SelectField** | Select with label and options | `label`, `value`, `onChange`, `options`, `errorMessage` | `<SelectField label="Province" options={provinces} />` | Dropdown selections, option lists |
| **FormField** | Generic form field wrapper | `label`, `required`, `error`, `children` | `<FormField label="Birth Date" required><DatePicker /></FormField>` | Custom form controls, wrappers |
| **FormSection** | Groups related form fields | `title`, `description`, `children` | `<FormSection title="Personal Info">...</FormSection>` | Form organization, grouped fields |
| **PhilSysNumberInput** | Philippine National ID input | `value`, `onChange`, `error`, `label` | `<PhilSysNumberInput value={philsys} label="ID Number" />` | National ID entry, government forms |
| **SearchBar** | Search input with suggestions | `placeholder`, `onSearch`, `suggestions`, `loading` | `<SearchBar placeholder="Search residents..." />` | Data search, filtering interfaces |
| **ButtonGroup** | Related action buttons | `children`, `align` | `<ButtonGroup><Button>Cancel</Button><Button>Save</Button></ButtonGroup>` | Form actions, dialog buttons |
| **AccessibleModal** | ARIA-compliant modal | `isOpen`, `onClose`, `title`, `size`, `children` | `<AccessibleModal isOpen={show} title="Confirm">...</AccessibleModal>` | Confirmations, forms, detailed views |
| **FileUpload** | Drag-and-drop file upload | `accept`, `multiple`, `onFilesSelected`, `maxSize` | `<FileUpload accept="image/*" multiple />` | Document upload, image selection |
| **ThemeToggle** | Dark/light mode switcher | None (uses theme context) | `<ThemeToggle />` | User preferences, accessibility |
| **StatsCard** | Display statistical info | `title`, `value`, `trend`, `icon`, `color` | `<StatsCard title="Total Residents" value={1250} trend="+5.2%" />` | Dashboard metrics, KPI display |

---

## 🔸 Organisms - Complex UI Sections

| Component | Purpose | Key Props | Special Features | Use Cases |
|-----------|---------|-----------|------------------|-----------|
| **PSGCSelector** ⭐️ | Philippine location selector | `searchLevels`, `maxLevel`, `minLevel`, `value`, `onSelect`, `error` | Smart positioning, arrow navigation, responsive, API-driven | Address selection, birth place entry |
| **PSOCSelector** ⭐️ | Philippine occupation selector | `searchLevels`, `maxLevel`, `minLevel`, `value`, `onSelect`, `error` | Hierarchical search, smart positioning, mobile-optimized | Employment forms, job classification |
| **PersonalInformation** | Personal details form | `value`, `onChange`, `errors` | Comprehensive personal data fields | Resident registration, profile editing |
| **DataTable** | Advanced data table | `data`, `columns`, `sortable`, `filterable`, `pagination` | Sorting, filtering, pagination | Resident listings, admin interfaces |
| **Navigation** | Main app navigation | `user`, `currentPath`, `onLogout` | User context, route highlighting | App navigation, user context |
| **UserProfile** | User account management | `user`, `onUpdate`, `onPasswordChange` | Profile editing, password change | Profile management, account settings |
| **LoginForm** | Authentication form | `onLogin`, `loading`, `error` | Secure authentication | User authentication, secure access |
| **CreateHouseholdModal** | Household creation | `isOpen`, `onClose`, `onSubmit` | Multi-step workflow | Household management, data entry |
| **PopulationPyramid** | Age-sex visualization | `data`, `title`, `height`, `width` | Interactive demographic charts | Demographics display, analysis |
| **HouseholdSelector** | Household selection | `value`, `onChange`, `households`, `error` | Search and select households | Resident assignment, household linking |
| **AddressSelector** | Address selection | `value`, `onChange`, `searchLevels`, `error` | Geographic address search | Address forms, location selection |
| **BarangaySelector** | Barangay-specific selector | `value`, `onChange`, `barangayId`, `error` | Barangay-scoped address selection | Local address selection |

---

## 🔹 Templates - Page-Level Components

| Component | Purpose | Key Props | Features | Use Cases |
|-----------|---------|-----------|----------|-----------|
| **ResidentFormWizard** | Multi-step resident registration | `initialData`, `onSubmit`, `onCancel` | 5-step wizard, validation, PSGCSelector/PSOCSelector integration | New resident registration, profile editing |
| **HouseholdFormWizard** | Household registration workflow | `onSubmit`, `onCancel` | Multi-step household creation | Household creation, family registration |
| **MainLayout** | Main application wrapper | `children` | Consistent layout structure | Page wrapper, layout consistency |
| **DashboardLayout** | Dashboard-specific layout | `title`, `subtitle`, `children` | Dashboard-optimized structure | Dashboard pages, analytics views |
| **AppShell** | Root application shell | `navigation`, `header`, `children` | App-wide layout container | App root, layout container |
| **Header** | Application header | `user`, `title`, `actions` | Responsive header with user context | App header, navigation |

---

## 🎨 Design Tokens

| Token Type | Purpose | Values | Usage |
|------------|---------|---------|--------|
| **Colors** | Standardized palette | Primary (Blue), Secondary (Gray), Success (Green), Warning (Yellow), Error (Red) | `text-blue-600`, `bg-gray-100`, `border-red-500` |
| **Typography** | Font scale and styling | Display (32px+), Headings (24-28px), Body (16-18px), Caption (14px) | `text-3xl`, `text-xl`, `text-base`, `text-sm` |
| **Spacing** | Consistent spacing scale | xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px) | `p-2`, `m-4`, `gap-6`, `space-x-8` |
| **Layout** | Grid and container standards | Max widths, breakpoints, grid systems | `max-w-7xl`, `grid-cols-12`, `lg:grid-cols-6` |
| **Shadows** | Elevation system | sm, md, lg, xl variants | `shadow-sm`, `shadow-lg`, `shadow-2xl` |

---

## ⭐️ Featured Smart Components

### PSGCSelector & PSOCSelector Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Smart Positioning** | Automatically flips dropdown above when at page bottom | Prevents dropdown cutoff, better UX |
| **Arrow Key Navigation** | Smooth scrolling during keyboard navigation | Full accessibility, keyboard-friendly |
| **Responsive Design** | Mobile-optimized touch targets and layouts | Works on all devices |
| **Configurable Search** | `searchLevels`, `maxLevel`, `minLevel` props | Flexible for different use cases |
| **Debounced Search** | 300ms delay on API calls | Performance optimization |
| **API Integration** | Real-time search with Philippine gov data | Accurate, up-to-date information |

### Usage Examples

| Use Case | Configuration | Example |
|----------|---------------|---------|
| **Birth Place** | Cities only | `<PSGCSelector searchLevels={['city']} maxLevel="city" />` |
| **Full Address** | All levels | `<PSGCSelector searchLevels={['region','province','city','barangay']} />` |
| **Specific Job** | Occupations only | `<PSOCSelector searchLevels={['occupation']} />` |
| **Job Category** | All PSOC levels | `<PSOCSelector searchLevels={['major_group','occupation']} />` |

---

## 🚀 Usage Best Practices

| Category | Best Practice | Example |
|----------|---------------|---------|
| **Smart Selectors** | Use appropriate search levels | `<PSGCSelector searchLevels={['city']} />` for birth place |
| **Form Composition** | Group related fields in FormSection | `<FormSection title="Personal Info">...</FormSection>` |
| **Responsive Design** | All components are mobile-responsive by default | 48px minimum touch targets, adaptive layouts |
| **Accessibility** | Components follow WCAG 2.1 AA standards | ARIA labels, keyboard navigation, screen reader support |
| **Performance** | Use debounced inputs and lazy loading | 300ms debounce on search, optimized re-renders |

---

## 🔧 Development Guidelines

| Aspect | Guideline | Details |
|--------|-----------|---------|
| **Component Structure** | Follow standard folder pattern | `ComponentName.tsx`, `ComponentName.stories.tsx`, `index.ts` |
| **Import Patterns** | Use categorical imports | `import { Button, Input } from '@/components/atoms'` |
| **TypeScript** | Include proper type definitions | All props typed, interfaces exported |
| **Accessibility** | Implement ARIA patterns | Labels, roles, keyboard support |
| **Testing** | Add Storybook stories | Interactive examples and documentation |

---

## 📊 Component Status & Recent Updates

### Latest Enhancements (2024)

| Enhancement | Components | Description |
|-------------|------------|-------------|
| **Smart Positioning** | PSGCSelector, PSOCSelector | Auto-flip dropdown above when at page bottom |
| **Arrow Key Navigation** | PSGCSelector, PSOCSelector | Smooth scrolling during keyboard navigation |
| **Responsive Design** | All components | Mobile-optimized dropdowns and layouts |
| **Performance Fixes** | PSOCSelector | Resolved infinite loading issues |
| **API Integration** | PSGCSelector, PSOCSelector | Real-time search with Philippine gov data |

### Component Maturity Status

| Status | Components | Description |
|--------|------------|-------------|
| ✅ **Production Ready** | PSGCSelector, PSOCSelector, InputField, SelectField, Button, DataTable | Stable, fully tested, feature-complete |
| ✅ **Stable** | Navigation, LoginForm, PersonalInformation, FormSection | Reliable, minor updates only |
| 🚧 **In Development** | Advanced filtering, bulk operations | Active development, frequent changes |
| 📋 **Planned** | Enhanced analytics, reporting components | Future roadmap items |

---

## 📞 Support & Contribution

### Quick Reference

| Need | Resource | Action |
|------|----------|--------|
| **Interactive Examples** | Storybook | Run `npm run storybook` |
| **Implementation Details** | Component source code | Check `/src/components/` directory |
| **New Components** | Development guidelines | Follow atomic design principles |
| **Bug Reports** | GitHub Issues | Create issue with reproduction steps |
| **Feature Requests** | GitHub Discussions | Propose new features or enhancements |

---

*This documentation serves as the single source of truth for all Citizenly components. Keep it updated as components evolve and new ones are added.*