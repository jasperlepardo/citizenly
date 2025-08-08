import type { Meta, StoryObj } from '@storybook/react';
import FormSection from './FormSection';
import { InputField } from '@/components/molecules';
import { Button, Checkbox, Radio } from '@/components/atoms';

const meta = {
  title: 'Molecules/FormSection',
  component: FormSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Semantic form section using fieldset and legend for better accessibility. Groups related form controls with proper ARIA relationships.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
      description: 'Show required indicator (*) in legend',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    legend: 'Personal Information',
    description: 'Enter your basic personal details below',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="First Name" placeholder="Enter your first name" required />
          <InputField label="Last Name" placeholder="Enter your last name" required />
        </div>
        <InputField label="Email Address" type="email" placeholder="Enter your email" required />
        <InputField label="Phone Number" type="tel" placeholder="Enter your phone number" />
      </div>
    ),
  },
};

export const Required: Story = {
  args: {
    legend: 'Account Security',
    description: 'All fields in this section are required for account verification',
    required: true,
    children: (
      <div className="space-y-4">
        <InputField
          label="Password"
          type="password"
          placeholder="Enter a secure password"
          required
        />
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          required
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium">Two-Factor Authentication</label>
          <div className="space-y-2">
            <Checkbox label="Enable SMS verification" />
            <Checkbox label="Enable email verification" />
            <Checkbox label="Enable authenticator app" />
          </div>
        </div>
      </div>
    ),
  },
};

export const WithRadioButtons: Story = {
  args: {
    legend: 'Preferences',
    description: 'Choose your communication and display preferences',
    children: (
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Email Frequency</label>
          <div className="space-y-2">
            <Radio name="frequency" label="Daily" />
            <Radio name="frequency" label="Weekly" />
            <Radio name="frequency" label="Monthly" />
            <Radio name="frequency" label="Never" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Theme Preference</label>
          <div className="space-y-2">
            <Radio name="theme" label="Light mode" />
            <Radio name="theme" label="Dark mode" />
            <Radio name="theme" label="System default" />
          </div>
        </div>
      </div>
    ),
  },
};

export const CompactLayout: Story = {
  args: {
    legend: 'Contact Details',
    className: 'max-w-md',
    children: (
      <div className="space-y-3">
        <InputField label="Email" type="email" placeholder="your@email.com" required />
        <InputField label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
        <InputField label="Website" type="url" placeholder="https://yourwebsite.com" />
      </div>
    ),
  },
};

export const MultipleFormSections: Story = {
  render: () => (
    <div className="max-w-2xl space-y-8">
      <FormSection legend="Basic Information" description="Your personal details" required>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField label="First Name" required />
          <InputField label="Last Name" required />
        </div>
        <InputField label="Date of Birth" type="date" required />
      </FormSection>

      <FormSection legend="Contact Information" description="How we can reach you">
        <div className="space-y-4">
          <InputField label="Email" type="email" required />
          <InputField label="Phone" type="tel" />
          <div>
            <label className="mb-2 block text-sm font-medium">Preferred Contact Method</label>
            <div className="space-y-2">
              <Radio name="contact-method" label="Email" defaultChecked />
              <Radio name="contact-method" label="Phone" />
              <Radio name="contact-method" label="Text message" />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        legend="Additional Information"
        description="Optional details to help us serve you better"
      >
        <div className="space-y-4">
          <InputField label="Company" placeholder="Your organization" />
          <InputField label="Job Title" placeholder="Your role" />
          <div className="space-y-2">
            <label className="block text-sm font-medium">Areas of Interest</label>
            <div className="space-y-2">
              <Checkbox label="Product updates" />
              <Checkbox label="Technical blog" />
              <Checkbox label="Event invitations" />
              <Checkbox label="Community news" />
            </div>
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="secondary-outline">Cancel</Button>
        <Button variant="primary">Save Information</Button>
      </div>
    </div>
  ),
};

export const AccessibilityShowcase: Story = {
  args: {
    legend: 'Accessibility Features Demo',
    description: 'This form section demonstrates proper semantic HTML and ARIA relationships',
    required: true,
    children: (
      <div className="space-y-6">
        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">Accessibility Features:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Uses semantic &lt;fieldset&gt; and &lt;legend&gt; elements</li>
            <li>• Proper ARIA relationships with aria-describedby</li>
            <li>• Screen reader announces section purpose</li>
            <li>• Visual and semantic grouping of related controls</li>
            <li>• Required indicator with proper aria-label</li>
          </ul>
        </div>

        <div className="space-y-4">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            required
            helpText="This field is required and announced by screen readers"
          />
          <InputField
            label="Accessibility Preference"
            placeholder="Any accessibility needs?"
            helpText="Optional: Let us know how we can better accommodate you"
          />
        </div>
      </div>
    ),
  },
};
