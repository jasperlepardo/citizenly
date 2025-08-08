import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormField, FormGroup, Form } from './FormField';
import Input from '../../atoms/Input/Input';
import { Textarea } from '../../atoms/Textarea/Textarea';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { Radio, RadioGroup } from '../../atoms/Radio/Radio';
import { Toggle } from '../../atoms/Toggle/Toggle';
import { Button } from '../../atoms/Button/Button';

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
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
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <div className="w-80">
      <FormField {...args}>
        <Input placeholder="Enter your name" />
      </FormField>
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
      <FormField label="Email Address" required errorMessage="Please enter a valid email address">
        <Input
          placeholder="Enter your email"
          type="email"
          value="invalid-email"
          className="border-red-300 focus:border-red-500"
        />
      </FormField>
    </div>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <FormField
        label="First Name"
        orientation="horizontal"
        labelWidth="w-32"
        required
        helperText="Your given name"
      >
        <Input placeholder="John" />
      </FormField>

      <FormField label="Email" orientation="horizontal" labelWidth="w-32" required>
        <Input placeholder="john@example.com" type="email" />
      </FormField>

      <FormField
        label="Phone"
        orientation="horizontal"
        labelWidth="w-32"
        helperText="Include country code"
      >
        <Input placeholder="+1 (555) 123-4567" type="tel" />
      </FormField>
    </div>
  ),
};

export const DifferentInputTypes: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <FormField label="Text Input" required>
        <Input placeholder="Enter text" />
      </FormField>

      <FormField label="Textarea" helperText="Provide additional details">
        <Textarea placeholder="Enter description..." />
      </FormField>

      <FormField label="Checkbox">
        <Checkbox label="I agree to the terms and conditions" />
      </FormField>

      <FormField label="Radio Group" required>
        <RadioGroup name="size" orientation="vertical">
          <Radio value="small" label="Small" />
          <Radio value="medium" label="Medium" />
          <Radio value="large" label="Large" />
        </RadioGroup>
      </FormField>

      <FormField label="Toggle Switch" helperText="Enable notifications">
        <Toggle label="Email notifications" />
      </FormField>
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
        <FormField label="First Name" required>
          <Input placeholder="John" />
        </FormField>

        <FormField label="Last Name" required>
          <Input placeholder="Doe" />
        </FormField>

        <FormField label="Date of Birth">
          <Input type="date" />
        </FormField>
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
          description="We'll use this information to get back to you"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="First Name" required errorMessage={errors.firstName}>
              <Input
                placeholder="John"
                value={formData.firstName}
                onChange={e => updateField('firstName', e.target.value)}
              />
            </FormField>

            <FormField label="Last Name" required errorMessage={errors.lastName}>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={e => updateField('lastName', e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label="Email Address"
            required
            errorMessage={errors.email}
            helperText="We'll never share your email with anyone"
          >
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={e => updateField('email', e.target.value)}
            />
          </FormField>

          <FormField label="Phone Number" helperText="Optional - for urgent matters only">
            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
            />
          </FormField>
        </FormGroup>

        <FormGroup title="Additional Details" description="Help us understand your needs better">
          <FormField label="Company/Organization">
            <Input
              placeholder="Acme Corp"
              value={formData.company}
              onChange={e => updateField('company', e.target.value)}
            />
          </FormField>

          <FormField
            label="Message"
            required
            errorMessage={errors.message}
            helperText="Tell us how we can help you"
          >
            <Textarea
              placeholder="I'm interested in..."
              value={formData.message}
              onChange={e => updateField('message', e.target.value)}
              showCharCount
              maxLength={500}
            />
          </FormField>

          <FormField label="Priority Level">
            <RadioGroup
              name="priority"
              value={formData.priority}
              onChange={value => updateField('priority', value)}
            >
              <Radio value="low" label="Low - General inquiry" />
              <Radio value="medium" label="Medium - Business inquiry" />
              <Radio value="high" label="High - Urgent support needed" />
            </RadioGroup>
          </FormField>
        </FormGroup>

        <FormGroup title="Preferences">
          <FormField helperText="Stay updated with our latest news and offers">
            <Checkbox
              label="Subscribe to newsletter"
              checked={formData.newsletter}
              onChange={e => updateField('newsletter', e.target.checked)}
            />
          </FormField>
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
          <FormField label="Field 1">
            <Input placeholder="Input 1" />
          </FormField>
          <FormField label="Field 2">
            <Input placeholder="Input 2" />
          </FormField>
          <FormField label="Field 3">
            <Input placeholder="Input 3" />
          </FormField>
        </FormGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Medium Spacing (Default)</h3>
        <FormGroup spacing="md">
          <FormField label="Field 1">
            <Input placeholder="Input 1" />
          </FormField>
          <FormField label="Field 2">
            <Input placeholder="Input 2" />
          </FormField>
          <FormField label="Field 3">
            <Input placeholder="Input 3" />
          </FormField>
        </FormGroup>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Spacing</h3>
        <FormGroup spacing="lg">
          <FormField label="Field 1">
            <Input placeholder="Input 1" />
          </FormField>
          <FormField label="Field 2">
            <Input placeholder="Input 2" />
          </FormField>
          <FormField label="Field 3">
            <Input placeholder="Input 3" />
          </FormField>
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
          <FormField label="First Name" required>
            <Input placeholder="John" />
          </FormField>

          <FormField label="Last Name" required>
            <Input placeholder="Doe" />
          </FormField>
        </div>

        <FormField label="Email Address" required>
          <Input type="email" placeholder="john@example.com" />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField label="City">
            <Input placeholder="New York" />
          </FormField>

          <FormField label="State">
            <Input placeholder="NY" />
          </FormField>

          <FormField label="ZIP Code">
            <Input placeholder="10001" />
          </FormField>
        </div>

        <FormField label="Additional Notes">
          <Textarea placeholder="Any additional information..." />
        </FormField>
      </FormGroup>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-blue-800">Accessibility Features</h3>
        <ul className="space-y-1 text-sm text-blue-700">
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
          <FormField label="Username" required helperText="Must be 3-20 characters long">
            <Input placeholder="Enter username" />
          </FormField>

          <FormField label="Password" required helperText="Must contain at least 8 characters">
            <Input type="password" placeholder="Enter password" />
          </FormField>

          <FormField>
            <Checkbox label="I agree to the terms of service and privacy policy" />
          </FormField>
        </FormGroup>
      </div>
    </div>
  ),
};
