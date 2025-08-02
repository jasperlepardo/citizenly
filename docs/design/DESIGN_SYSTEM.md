# RBI System - Design System Integration
## Frontend Implementation Guide with Figma Design System

---

## 📐 **Design References**

### **Primary App Design (Implementation Priority #1)**
**Citizenly App Layout**: [Citizenly Design](https://www.figma.com/design/srcDxfJEqx3qfPiQRrSR52/Citizenly?node-id=1-829&t=OndQULNKpeMqYE59-4)
- **Contains**: Complete RBI System interface design
- **Use for**: Page layouts, navigation, form structures, responsive behavior
- **Screens**: Dashboard, residents list, resident details, registration forms, household management

### **Component Design System (Implementation Priority #2)**
**JSPR Design System**: [Component Library](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)
- **Contains**: Base components, design tokens, interaction states
- **Use for**: Buttons, inputs, cards, modals, typography, colors, spacing

### **Iconography Library (Implementation Priority #3)**
**JSPR Iconography**: [Icon Library](https://www.figma.com/design/CYygNIegdzFYCkeIh8tema/JSPR-%7C-Iconography---Tailwind?node-id=2098-10628&t=CS8rjlKi6yUeTQ8M-0)
- **Contains**: Complete icon set with Tailwind integration
- **Use for**: Navigation icons, action buttons, status indicators, form icons
- **Format**: SVG icons optimized for web implementation

### **Implementation Strategy**
1. **Start with Citizenly layout** - Extract page structures and navigation patterns
2. **Apply JSPR components** - Use design system components within the layouts  
3. **Integrate JSPR icons** - Use consistent iconography throughout the app
4. **Maintain design consistency** - Ensure all three references work together harmoniously

**Access Requirements:**
- Figma account with access to all three design files
- Developer handoff permissions for inspecting components
- Export permissions for assets and icons

---

## 🏗️ **App Layout Structure (From Citizenly Figma)**

### **Navigation & Layout Analysis**
Based on the Citizenly Figma design, implement this layout structure:

```
App Layout:
├── 📱 Top Navigation Bar
│   ├── Logo/Brand
│   ├── Search Bar (global)
│   ├── Notifications
│   └── User Profile Menu
│
├── 🔧 Sidebar Navigation
│   ├── Dashboard
│   ├── Residents
│   │   ├── Browse Residents
│   │   ├── Add New Resident
│   │   └── Resident Reports
│   ├── Households
│   │   ├── Browse Households
│   │   ├── Create Household
│   │   └── Household Analytics
│   ├── Analytics & Reports
│   └── Settings
│
└── 📄 Main Content Area
    ├── Page Header (Title + Actions)
    ├── Content Sections
    │   ├── Summary Cards (Dashboard)
    │   ├── Data Tables (Lists)
    │   ├── Form Wizards (Registration)
    │   └── Detail Views (Profiles)
    └── Footer Actions
```

### **Key Layout Components to Extract from Figma**
1. **Sidebar Navigation Component** - Fixed/collapsible sidebar
2. **Top Navigation Bar** - Search, notifications, user menu
3. **Page Header Template** - Consistent title and action areas
4. **Dashboard Card Grid** - Statistics and quick actions layout
5. **Data Table Layout** - List views with filters and pagination
6. **Form Wizard Container** - Multi-step form progression
7. **Modal/Overlay Components** - Details views, confirmations

---

## 🎨 **Implementation Strategy**

### **1. Component Library Priority**
```
Implementation Order:
1. Foundation (Colors, Typography, Spacing)
2. Base Components (Button, Input, Card, Modal)
3. Form Components (Dropdown, Checkbox, Radio, Search)
4. Complex Components (Data Table, Navigation, Dashboard Cards)
5. RBI-specific Components (PSOC Search, Sectoral Info, Household Summary)
```

### **2. Design Token Extraction**
```typescript
// Extract from Figma and implement as CSS custom properties
:root {
  /* Colors (from Figma design tokens) */
  --color-primary: #YOUR_PRIMARY_COLOR;
  --color-secondary: #YOUR_SECONDARY_COLOR;
  --color-success: #YOUR_SUCCESS_COLOR;
  --color-warning: #YOUR_WARNING_COLOR;
  --color-error: #YOUR_ERROR_COLOR;
  
  /* Typography (from Figma text styles) */
  --font-family-primary: 'YOUR_FONT_FAMILY';
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  
  /* Spacing (from Figma spacing system) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  
  /* Shadows (from Figma effects) */
  --shadow-sm: YOUR_SMALL_SHADOW;
  --shadow-md: YOUR_MEDIUM_SHADOW;
  --shadow-lg: YOUR_LARGE_SHADOW;
}
```

---

## 📱 **Responsive Implementation**

### **Breakpoints (Reference Figma Grid System)**
```css
/* Extract exact breakpoints from Figma design system */
:root {
  --breakpoint-mobile: 320px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1440px;
}

/* Grid system (from Figma layout grid) */
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* Mobile-first responsive approach */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## 🧩 **RBI-Specific Component Mapping**

### **Core UI Components (Three-Source Integration)**
| RBI Component | Layout Source | Component Source | Icon Source | Customization Needed |
|---------------|---------------|------------------|-------------|---------------------|
| **Resident Search Bar** | Citizenly | JSPR Search Input | JSPR Icons | PSOC autocomplete functionality |
| **Sectoral Info Checkboxes** | Citizenly | JSPR Checkbox Group | JSPR Icons | Auto-calculation logic |
| **Household Type Selector** | Citizenly | JSPR Radio Group | JSPR Icons | Custom descriptions |
| **Income Class Badge** | Citizenly | JSPR Badge/Tag | JSPR Icons | Color coding by income level |
| **Data Tables** | Citizenly | JSPR Table | JSPR Icons | Sorting, pagination, bulk actions |
| **Dashboard Cards** | Citizenly | JSPR Card | JSPR Icons | Statistics display formatting |

### **Icon Usage Mapping for RBI System**
| UI Element | Icon Category | Specific Icons Needed |
|------------|---------------|----------------------|
| **Navigation** | Navigation Icons | Dashboard, Users, Home, Settings, Reports |
| **Actions** | Action Icons | Add, Edit, Delete, Save, Cancel, Search |
| **Status** | Status Icons | Active, Pending, Inactive, Warning, Success, Error |
| **Data Types** | Content Icons | Person, Family, House, Document, Chart |
| **Sectoral Info** | Special Icons | OFW, PWD, Senior Citizen, Migrant, Labor Force |
| **Forms** | Form Icons | Required field, Optional, Validation error, Help |
| **Form Wizards** | Stepper Component | 5-step resident, 4-step household |
| **PSGC Address Cascade** | Select/Dropdown | Hierarchical data loading |

### **Custom Components (Extend Figma Components)**
```typescript
// Example: Extend Figma Button for RBI-specific actions
interface RBIButtonProps extends FigmaButtonProps {
  variant: 'resident-add' | 'household-create' | 'certificate-print';
  loading?: boolean;
  icon?: ReactNode;
}

// Example: Extend Figma Input for PSOC search
interface PSOCSearchProps extends FigmaInputProps {
  onOccupationSelect: (occupation: PSOCOccupation) => void;
  showHierarchy?: boolean;
  enableCrossReferences?: boolean;
}
```

---

## 🎨 **Color System Implementation**

### **Semantic Colors (Map to RBI Use Cases)**
```css
/* Status indicators for residents */
.status-active { color: var(--color-success); }
.status-pending { color: var(--color-warning); }
.status-inactive { color: var(--color-error); }
.status-draft { color: var(--color-neutral); }

/* Income class color coding */
.income-rich { color: var(--color-success-dark); }
.income-high { color: var(--color-primary); }
.income-upper-middle { color: var(--color-info); }
.income-middle { color: var(--color-purple); }
.income-lower-middle { color: var(--color-warning); }
.income-low { color: var(--color-warning-light); }
.income-poor { color: var(--color-error); }

/* Sectoral information badges */
.sectoral-ofw { background: var(--color-blue-light); }
.sectoral-pwd { background: var(--color-orange-light); }
.sectoral-senior { background: var(--color-green-light); }
.sectoral-migrant { background: var(--color-purple-light); }
```

---

## 📋 **Component Development Checklist**

### **Phase 1: Layout Foundation (From Citizenly Figma)**
- [ ] Extract app layout structure and navigation patterns
- [ ] Create main layout component with sidebar and top navigation
- [ ] Implement responsive behavior for mobile/desktop
- [ ] Set up routing structure matching Figma screens
- [ ] Extract design tokens from JSPR design system
- [ ] Set up icon library from JSPR iconography
- [ ] Configure CSS custom properties and typography system

### **Phase 2: Base Components**
- [ ] Button (all variants from Figma)
- [ ] Input fields (text, email, phone, number)
- [ ] Select/Dropdown components
- [ ] Checkbox and Radio button groups
- [ ] Card and Modal components

### **Phase 3: Form Components**
- [ ] Form wizard/stepper component
- [ ] Validation message display
- [ ] Form section containers
- [ ] Progress indicators
- [ ] Success/error state handling

### **Phase 4: Data Components**
- [ ] Data table with sorting/pagination
- [ ] Search bar with filters
- [ ] Statistics/metric cards
- [ ] Charts and graphs (if applicable)
- [ ] Export/print functionality

### **Phase 5: RBI-Specific Components**
- [ ] PSOC occupation search
- [ ] Sectoral information display
- [ ] Household composition viewer
- [ ] Income classification badge
- [ ] Address hierarchy display
- [ ] Certificate/document generators

---

## 🔧 **Development Setup**

### **Recommended Tech Stack Integration**
```json
// package.json dependencies
{
  "@figma/code-connect": "^latest",
  "figma-tokens": "^latest", 
  "design-tokens": "^latest",
  
  // For React implementation
  "styled-components": "^latest",
  "tailwindcss": "^latest",
  "@headlessui/react": "^latest",
  
  // For icon handling
  "lucide-react": "^latest",
  "@heroicons/react": "^latest"
}
```

### **Figma-to-Code Workflow**
```bash
# 1. Export design tokens
npx figma-tokens export --file-id=UqZjAbFtUqskUKPkZIB8lx

# 2. Generate component boilerplate
npx @figma/code-connect create --component=Button

# 3. Sync with design updates
npx figma-tokens sync
```

---

## 📚 **Documentation Standards**

### **Component Documentation Template**
```typescript
/**
 * RBI Component: [ComponentName]
 * 
 * @figma https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/component-link
 * @description Brief description of component purpose in RBI system
 * @example <ComponentName prop="value" />
 */
interface ComponentNameProps {
  // Props definition with JSDoc comments
}
```

### **Storybook Integration**
```typescript
// ComponentName.stories.tsx
export default {
  title: 'RBI System/ComponentName',
  component: ComponentName,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/component-link'
    }
  }
};
```

---

## 🎯 **Quality Assurance**

### **Design System Compliance Checklist**
- [ ] **Visual Consistency**: Components match Figma designs exactly
- [ ] **Spacing Accuracy**: Uses design system spacing tokens
- [ ] **Typography Compliance**: Follows Figma text styles
- [ ] **Color Accuracy**: Uses exact color values from design system
- [ ] **Responsive Behavior**: Matches Figma responsive variants
- [ ] **Interaction States**: Implements all component states (hover, active, disabled)
- [ ] **Accessibility**: Meets WCAG 2.1 standards
- [ ] **Performance**: Components are optimized for mobile devices

### **Testing Strategy**
```typescript
// Visual regression testing
describe('Component Visual Tests', () => {
  it('matches Figma design', () => {
    cy.visit('/storybook/component');
    cy.matchImageSnapshot('component-default');
  });
});

// Accessibility testing
describe('Component A11y Tests', () => {
  it('meets accessibility standards', () => {
    cy.visit('/component');
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

---

## 🚀 **Implementation Timeline**

| Week | Focus | Deliverables |
|------|-------|-------------|
| **Week 1** | Foundation | Design tokens, base components |
| **Week 2** | Forms | Input components, validation, wizards |
| **Week 3** | Data Display | Tables, cards, search, filters |
| **Week 4** | Integration | RBI-specific components, testing |

---

**Design System Integration Status**: ✅ **Ready for Implementation**  
**Figma Link**: [JSPR | Design System](https://www.figma.com/design/UqZjAbFtUqskUKPkZIB8lx/JSPR-%7C-Design-System?t=5AC2fFPemOImA5UD-0)

This guide ensures consistent implementation of the RBI System frontend using the established design system as the foundation for all UI components.