# Accessibility Testing Checklist

## 🎯 WCAG 2.1 Level AA Compliance Checklist

This checklist helps ensure your Citizenly application meets accessibility standards.

---

## ⌨️ Keyboard Navigation

- [ ] **Tab Navigation**: All interactive elements are reachable via Tab key
- [ ] **Focus Indicators**: Clear visual focus indicators on all interactive elements
- [ ] **Skip Links**: "Skip to main content" link available and functional
- [ ] **Focus Trap**: Modals and dropdowns trap focus appropriately
- [ ] **Escape Key**: Modals and dropdowns close with Escape key
- [ ] **No Keyboard Traps**: Users can navigate away from all elements

## 🖥️ Screen Reader Support

- [ ] **Semantic HTML**: Proper use of heading hierarchy (h1-h6)
- [ ] **ARIA Labels**: All interactive elements have accessible names
- [ ] **Alt Text**: All images have appropriate alt text
- [ ] **Form Labels**: All form inputs have associated labels
- [ ] **Error Messages**: Form errors are announced to screen readers
- [ ] **Live Regions**: Dynamic content updates are announced

## 🎨 Visual Design

- [ ] **Color Contrast**: Text meets WCAG contrast ratios (4.5:1 for normal text, 3:1 for large text)
- [ ] **Text Resize**: Page remains usable at 200% zoom
- [ ] **Focus Indicators**: Visible focus indicators with sufficient contrast
- [ ] **Error Identification**: Errors not identified by color alone
- [ ] **Responsive Design**: Content reflows properly on mobile devices

## 📝 Forms

- [ ] **Labels**: All inputs have visible labels or placeholders
- [ ] **Required Fields**: Required fields clearly marked
- [ ] **Error Messages**: Clear, specific error messages
- [ ] **Fieldsets**: Related fields grouped with fieldset and legend
- [ ] **Instructions**: Clear instructions for complex forms
- [ ] **Success Messages**: Form submission confirmations provided

## 🔗 Navigation

- [ ] **Consistent Navigation**: Navigation location and order consistent across pages
- [ ] **Breadcrumbs**: Breadcrumb navigation where appropriate
- [ ] **Active Page**: Current page clearly indicated in navigation
- [ ] **Link Purpose**: Link text describes destination or purpose
- [ ] **Focus Order**: Logical tab order through navigation

## 📊 Tables

- [ ] **Headers**: All tables have appropriate headers
- [ ] **Scope Attributes**: Complex tables use scope attributes
- [ ] **Captions**: Tables have descriptive captions
- [ ] **Summary**: Complex tables have summaries

## 🎭 Interactive Components

### Modals/Dialogs

- [ ] Focus moves to modal when opened
- [ ] Focus trapped within modal
- [ ] Focus returns to trigger element when closed
- [ ] Closes with Escape key
- [ ] Has appropriate ARIA attributes

### Dropdowns

- [ ] Arrow keys navigate options
- [ ] Enter/Space selects option
- [ ] Escape closes dropdown
- [ ] Selected option is announced

### Accordions/Collapsibles

- [ ] Expanded state announced
- [ ] Enter/Space toggles state
- [ ] Arrow keys navigate between headers

## 🔧 Testing Tools

### Automated Testing

- [ ] **axe DevTools**: Run and fix all issues
- [ ] **WAVE**: Run Web Accessibility Evaluation Tool
- [ ] **Lighthouse**: Run accessibility audit in Chrome DevTools
- [ ] **ESLint**: jsx-a11y plugin configured and passing

### Manual Testing

- [ ] **Keyboard Only**: Navigate entire app without mouse
- [ ] **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Browser Zoom**: Test at 200% zoom level
- [ ] **Color Filters**: Test with grayscale/color blind filters

## 📋 Component-Specific Checks

### DashboardLayout

- [x] Skip navigation link present
- [x] Sidebar marked as `<aside>`
- [x] Main content marked as `<main>`
- [x] User dropdown has proper ARIA attributes
- [x] Search has proper labels

### Navigation

- [x] Current page has `aria-current="page"`
- [x] Navigation wrapped in `<nav>`
- [x] Proper list structure with `role="list"`

### Forms

- [x] Inputs have proper labels
- [x] Errors connected with `aria-describedby`
- [x] Invalid inputs have `aria-invalid="true"`
- [x] Required fields marked appropriately

### Tables

- [x] Headers have `scope` attributes
- [x] Tables have proper `<thead>` and `<tbody>`

## 🚀 Implementation Status

### Completed

- ✅ Accessibility utilities module (`/src/lib/accessibility.ts`)
- ✅ Skip navigation component (`/src/components/atoms/SkipNavigation.tsx`)
- ✅ Accessible modal with focus trap (`/src/components/molecules/AccessibleModal.tsx`)
- ✅ Keyboard navigable list (`/src/components/atoms/KeyboardNavigableList.tsx`)
- ✅ Form section with fieldset/legend (`/src/components/molecules/FormSection.tsx`)
- ✅ Error message component (`/src/components/atoms/ErrorMessage.tsx`)
- ✅ Live region component (`/src/components/atoms/LiveRegion.tsx`)
- ✅ Semantic HTML improvements in layouts
- ✅ ARIA attributes on navigation
- ✅ Focus management for dropdowns

### Testing Commands

```bash
# Run ESLint with accessibility rules
npm run lint

# Run tests including accessibility tests
npm test

# Check Tailwind class order
npm run format:check
```

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## 📝 Notes

- Test with real users including those with disabilities
- Consider cognitive accessibility (clear language, consistent layouts)
- Document any accessibility decisions or trade-offs
- Regular audits as new features are added
