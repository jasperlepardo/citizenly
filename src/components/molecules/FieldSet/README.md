# FieldSet Components

A collection of form field wrapper components that provide consistent labeling, error handling, and accessibility features.

## Components

- **InputField** - For text inputs, textareas, and form controls
- **SelectField** - For dropdown selections  
- **ControlField** - For checkboxes, radios, and toggles

## Error Handling Patterns

### Error Prop Precedence

All FieldSet components follow a consistent error handling pattern where the field-level `errorMessage` prop takes precedence over component-specific error props:

```typescript
// InputField
const inputError = errorMessage || inputProps?.error;

// SelectField  
const selectError = errorMessage || selectProps?.error;

// ControlField
const controlError = errorMessage || controlProps?.errorMessage;
```

### Usage Examples

#### Option 1: Field-level error (Recommended)
```tsx
<InputField
  label="Email"
  errorMessage="Please enter a valid email address"
  inputProps={{
    type: "email",
    placeholder: "john@example.com"
  }}
/>
```

#### Option 2: Component-level error
```tsx
<InputField
  label="Email"
  inputProps={{
    type: "email",
    placeholder: "john@example.com",
    error: "Please enter a valid email address"
  }}
/>
```

#### Option 3: Both (field-level takes precedence)
```tsx
<InputField
  label="Email"
  errorMessage="Field-level error" // This will be displayed
  inputProps={{
    type: "email", 
    placeholder: "john@example.com",
    error: "Component-level error" // This will be ignored
  }}
/>
```

### Why Field-level Errors Take Precedence

1. **Consistency**: All FieldSet components behave the same way
2. **Flexibility**: Allows form validation libraries to override component errors
3. **Clarity**: Makes it obvious which error will be displayed
4. **Separation of Concerns**: Field validation separate from component functionality

## Accessibility Features

### Unique ID Generation

All components use secure ID generation with predictable patterns:

- **InputField**: `input-field-{timestamp}-{counter}`
- **SelectField**: `select-field-{timestamp}-{counter}`  
- **ControlField**: `control-field-{timestamp}-{counter}`

### ARIA Relationships

```typescript
// Labels are properly associated
<label id="field-123-label" htmlFor="field-123">Email</label>
<input id="field-123" aria-labelledby="field-123-label" />

// Helper text and errors are described by
<input 
  id="field-123"
  aria-describedby="field-123-helper field-123-error"
/>
<div id="field-123-helper">Helper text</div>
<div id="field-123-error">Error message</div>
```

## Layout Options

### Vertical Layout (Default)
```tsx
<InputField label="Name" orientation="vertical">
  <Input placeholder="Enter name" />
</InputField>
```

### Horizontal Layout
```tsx
<InputField 
  label="Name" 
  orientation="horizontal"
  labelWidth="w-32"
>
  <Input placeholder="Enter name" />
</InputField>
```

## Best Practices

### 1. Use Field-level Errors for Form Validation
```tsx
// ✅ Good
<InputField
  label="Email"
  errorMessage={formErrors.email}
  inputProps={{ type: "email" }}
/>

// ❌ Avoid mixing error sources
<InputField
  label="Email" 
  errorMessage={formErrors.email}
  inputProps={{ 
    type: "email",
    error: componentError // Can cause confusion
  }}
/>
```

### 2. Provide Helper Text for Complex Fields
```tsx
<InputField
  label="Password"
  helperText="Must be at least 8 characters with one uppercase letter"
  inputProps={{ type: "password" }}
/>
```

### 3. Use Consistent Label Sizing
```tsx
<FormGroup>
  <InputField label="First Name" labelSize="md" />
  <InputField label="Last Name" labelSize="md" />
  <InputField label="Email" labelSize="md" />
</FormGroup>
```

### 4. Group Related Fields
```tsx
<FormGroup 
  title="Contact Information"
  description="How we can reach you"
>
  <InputField label="Email" />
  <InputField label="Phone" />
</FormGroup>
```

## Migration from Legacy FieldSet

The `InputField` component is exported as `FieldSet` for backward compatibility:

```tsx
// Both work the same way
import { FieldSet } from '@/components/molecules/FieldSet';
import { InputField } from '@/components/molecules/FieldSet';
```

## Error Boundaries

For production resilience, the FieldSet library includes error boundary components:

### FieldErrorBoundary

Wraps field components to provide graceful fallback when rendering fails:

```tsx
import { FieldErrorBoundary, InputField } from '@/components/molecules/FieldSet';

<FieldErrorBoundary fieldName="Email Address">
  <InputField 
    label="Email"
    inputProps={{ type: "email" }}
  />
</FieldErrorBoundary>
```

### withFieldErrorBoundary HOC

Higher-order component for automatic error boundary wrapping:

```tsx
import { withFieldErrorBoundary, InputField } from '@/components/molecules/FieldSet';

const SafeInputField = withFieldErrorBoundary(InputField, 'Input Field');

// Use SafeInputField anywhere InputField would be used
<SafeInputField label="Email" />
```

### Custom Fallback UI

```tsx
<FieldErrorBoundary 
  fieldName="Email"
  fallback={
    <div className="text-red-500">
      Email field is temporarily unavailable
    </div>
  }
>
  <InputField label="Email" />
</FieldErrorBoundary>
```

## Component Dependencies

- `@/lib/fieldUtils` - Secure ID generation and ARIA helpers
- `@/components/atoms/Field/*` - Label, Input, HelperText, etc.
- `@/lib/utils` - className utility (cn)

## TypeScript Support

All components are fully typed with comprehensive interfaces:

```typescript
interface InputFieldProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  orientation?: 'vertical' | 'horizontal';
  labelWidth?: string;
  htmlFor?: string;
  labelSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  inputProps?: React.ComponentProps<typeof Input>;
  labelProps?: Omit<React.ComponentProps<typeof Label>, 'htmlFor' | 'required' | 'children' | 'size'>;
  className?: string;
  children?: React.ReactNode;
}
```