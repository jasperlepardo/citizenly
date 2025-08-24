import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InputField, FormGroup, Form } from '@/components/molecules/InputField';
import { Input, Textarea } from '@/components/../../atoms/Field';
import { Checkbox, Radio, RadioGroup, Toggle } from '@/components/../../atoms/Field';
import { Button } from '@/components';

const meta = {
  title: 'Molecules/InputField/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A container component for form fields that provides consistent labeling, error handling, and layout. Includes FormGroup and Form components for organizing complex forms.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    required: {
      control: { type: 'boolean' },
    },
    labelWidth: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <div className="w-80">
      <InputField {...args}>
        <Input placeholder="Enter your name" />
      </InputField>
    </div>
  ),
  args: {
    label: 'Full Name',
    required: true,
    helperText: 'Enter your full legal name as it appears on official documents',
  },
};

export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <InputField label="Email Address" required errorMessage="Please enter a valid email address">
        <Input
          placeholder="Enter your email"
          type="email"
          value="invalid-email"
          className="border-red-300 focus:border-red-500"
        />
      </InputField>
    </div>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <InputField
        label="First Name"
        orientation="horizontal"
        labelWidth="w-32"
        required
        helperText="Your given name"
      >
        <Input placeholder="John" />
      </InputField>

      <InputField label="Email" orientation="horizontal" labelWidth="w-32" required>
        <Input placeholder="john@example.com" type="email" />
      </InputField>

      <InputField
        label="Phone"
        orientation="horizontal"
        labelWidth="w-32"
        helperText="Include country code"
      >
        <Input placeholder="+1 (555) 123-4567" type="tel" />
      </InputField>
    </div>
  ),
};

export const DifferentInputTypes: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <InputField label="Text Input" required>
        <Input placeholder="Enter text" />
      </InputField>

      <InputField label="Textarea" helperText="Provide additional details">
        <Textarea placeholder="Enter description..." />
      </InputField>

      <InputField label="Checkbox">
        <Checkbox label="I agree to the terms and conditions" />
      </InputField>

      <InputField label="Radio Group" required>
        <RadioGroup name="size" orientation="vertical">
          <Radio value="small" label="Small" />
          <Radio value="medium" label="Medium" />
          <Radio value="large" label="Large" />
        </RadioGroup>
      </InputField>

      <InputField label="Toggle Switch" helperText="Enable notifications">
        <Toggle label="Email notifications" />
      </InputField>
    </div>
  ),
};

export const FormGroupExample: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <FormGroup
        title="Personal Information"
        description="Basic information about yourself"
        spacing="md"
      >
        <InputField label="First Name" required>
          <Input placeholder="John" />
        </InputField>

        <InputField label="Last Name" required>
          <Input placeholder="Doe" />
        </InputField>

        <InputField label="Date of Birth">
          <Input type="date" />
        </InputField>
      </FormGroup>
    </div>
  ),
};

export const CompleteForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      newsletter: false,
      priority: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.message) newErrors.message = 'Message is required';

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!');
        console.log('Form data:', formData);
      }
    };

    const updateField = (field: string, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    return (
      <Form onSubmit={handleSubmit} spacing="lg" className="w-full max-w-2xl">
        <FormGroup
          title="Contact Information"
          description="We&rsquo;ll use this information to get back to you"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="First Name" required errorMessage={errors.firstName}>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={e => updateField('firstName', e.target.value)}
              />
            </InputField>

            <InputField label="Last Name" required errorMessage={errors.lastName}>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
              />
            </InputField>
          </div>

          <InputField
            label="Email Address"
            required
            errorMessage={errors.email}
            helperText="We&rsquo;ll never share your email with anyone"
          >
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
            />
          </InputField>

          <InputField label="Phone Number" helperText="Optional - for urgent matters only">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
            />
          </InputField>
        </FormGroup>

        <FormGroup title="Additional Details" description="Help us understand your needs better">
          <InputField label="Company/Organization">
            <Input
              placeholder="Acme Corp"
              value={formData.company}
              onChange={e => updateField('company', e.target.value)}
            />
          </InputField>

          <InputField
            label="Message"
            required
            errorMessage={errors.message}
            helperText="Tell us how we can help you"
          >
            <Textarea
              placeholder="I&rsquo;m interested in..."
              value={formData.message}
              onChange={e => updateField('message', e.target.value)}
              showCharCount
              maxLength={500}
            />
          </InputField>

          <InputField label="Priority Level">
            <RadioGroup
              name="priority"
              value={formData.priority}
              onChange={value => updateField('priority', value)}
            >
              <Radio value="low" label="Low - General inquiry" />
              <Radio value="medium" label="Medium - Business inquiry" />
              <Radio value="high" label="High - Urgent support needed" />
            </RadioGroup>
          </InputField>
        </FormGroup>

        <FormGroup title="Preferences">
          <InputField helperText="Stay updated with our latest news and offers">
            <Checkbox
              label="Subscribe to newsletter"
              checked={formData.newsletter}
              onChange={e => updateField('newsletter', e.target.checked)}
            />
          </InputField>
        </FormGroup>

        <div className="flex justify-end space-x-4 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                company: '',
                message: '',
                newsletter: false,
                priority: '',
              });
              setErrors({});
            }}
          >
            Reset
          </Button>
          <Button type="submit" variant="primary">
            Send Message
          </Button>
        </div>
      </Form>
    );
  },
};

export const VariousSpacing: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Small Spacing</h3>
        <FormGroup spacing="sm">
          <InputField label="Field 1">
            <Input placeholder="Input 1" />
          </InputField>
          <InputField label="Field 2">
            <Input placeholder="Input 2" />
          </InputField>
          <InputField label="Field 3">
            <Input placeholder="Input 3" />
          </InputField>
        </FormGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Medium Spacing (Default)</h3>
        <FormGroup spacing="md">
          <InputField label="Field 1">
            <Input placeholder="Input 1" />
          </InputField>
          <InputField label="Field 2">
            <Input placeholder="Input 2" />
          </InputField>
          <InputField label="Field 3">
            <Input placeholder="Input 3" />
          </InputField>
        </FormGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Spacing</h3>
        <FormGroup spacing="lg">
          <InputField label="Field 1">
            <Input placeholder="Input 1" />
          </InputField>
          <InputField label="Field 2">
            <Input placeholder="Input 2" />
          </InputField>
          <InputField label="Field 3">
            <Input placeholder="Input 3" />
          </InputField>
        </FormGroup>
      </div>
    </div>
  ),
};

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <FormGroup
        title="Responsive Form Layout"
        description="This form adapts to different screen sizes"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="First Name" required>
            <Input placeholder="John" />
          </InputField>

          <InputField label="Last Name" required>
            <Input placeholder="Doe" />
          </InputField>
        </div>

        <InputField label="Email Address" required>
          <Input type="email" placeholder="john@example.com" />
        </InputField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InputField label="City">
            <Input placeholder="New York" />
          </InputField>

          <InputField label="State">
            <Input placeholder="NY" />
          </InputField>

          <InputField label="ZIP Code">
            <Input placeholder="10001" />
          </InputField>
        </div>

        <InputField label="Additional Notes">
          <Textarea placeholder="Any additional information..." />
        </InputField>
      </FormGroup>
    </div>
  ),
};

export const DirectInputUsage: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Direct Input Integration</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          FieldSet can now directly integrate with Input components using the `inputProps` prop,
          providing automatic label association and error handling.
        </p>
      </div>

      {/* Using inputProps for direct Input integration */}
      <InputField
        label="Email Address"
        required
        errorMessage="Please enter a valid email address"
        inputProps={{
          type: 'email',
          placeholder: 'john@example.com',
          clearable: true,
        }}
      />

      <InputField
        label="Password"
        required
        helperText="Must be at least 8 characters"
        inputProps={{
          type: 'password',
          placeholder: 'Enter password',
          showPasswordToggle: true,
        }}
      />

      <InputField
        label="Search"
        inputProps={{
          placeholder: 'Search...',
          leftIcon: (
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
          clearable: true,
        }}
      />

      <InputField
        label="Phone Number"
        inputProps={{
          type: 'tel',
          placeholder: '+1 (555) 123-4567',
          disabled: false,
        }}
        labelProps={{
          variant: 'muted',
          size: 'sm',
        }}
      />
    </div>
  ),
};

export const HelperTextIntegration: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Centralized Helper Text</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          All helper text and error handling is now managed by FieldSet using the dedicated HelperText component.
          This provides consistent styling and accessibility features.
        </p>
      </div>

      {/* Helper text only */}
      <InputField
        label="Username"
        helperText="Must be 3-20 characters and contain only letters, numbers, and underscores"
        inputProps={{
          placeholder: 'john_doe123',
        }}
      />

      {/* Error message only */}
      <InputField
        label="Email"
        required
        errorMessage="This email address is already in use"
        inputProps={{
          type: 'email',
          placeholder: 'john@example.com',
          value: 'existing@email.com',
        }}
      />

      {/* Both helper text and error message */}
      <InputField
        label="Password"
        required
        helperText="Password must contain at least 8 characters, one uppercase letter, and one number"
        errorMessage="Password is too weak"
        inputProps={{
          type: 'password',
          placeholder: 'Enter a strong password',
          value: '123',
        }}
      />

      {/* With Textarea */}
      <InputField
        label="Description"
        helperText="Provide a detailed description of your project or needs"
      >
        <Textarea 
          placeholder="Tell us about your project..."
          showCharCount
          maxLength={500}
        />
      </InputField>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Accessibility Features</h3>
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>
            • <strong>Proper labeling</strong>: All form fields have associated labels
          </li>
          <li>
            • <strong>Required field indicators</strong>: Visual and semantic marking
          </li>
          <li>
            • <strong>Error handling</strong>: Clear, descriptive error messages
          </li>
          <li>
            • <strong>Helper text</strong>: Additional context for complex fields
          </li>
          <li>
            • <strong>Keyboard navigation</strong>: All interactive elements are keyboard accessible
          </li>
          <li>
            • <strong>Screen reader support</strong>: Semantic HTML and ARIA attributes
          </li>
        </ul>
      </div>

      <div className="w-80">
        <FormGroup title="Accessible Form Example">
          <InputField label="Username" required helperText="Must be 3-20 characters long">
            <Input placeholder="Enter username" />
          </InputField>

          <InputField label="Password" required helperText="Must contain at least 8 characters">
            <Input type="password" placeholder="Enter password" />
          </InputField>

          <InputField>
            <Checkbox label="I agree to the terms of service and privacy policy" />
          </InputField>
        </FormGroup>
      </div>
    </div>
  ),
};
