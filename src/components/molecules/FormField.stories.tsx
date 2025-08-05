import type { Meta, StoryObj } from '@storybook/react'
import { FormField, FormGroup, Form } from './FormField'
import { InputField } from './InputField'
import { DropdownSelect } from './DropdownSelect'
import { Button } from '../atoms/Button'

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible form field wrapper that provides consistent labeling, error handling, and layout options. Includes FormGroup for organizing fields and Form container for complete forms.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal']
    },
    labelWidth: {
      control: 'text'
    },
    required: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

// Sample dropdown options for examples
const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' }
]

export const Default: Story = {
  args: {
    label: 'Full Name',
    children: <InputField placeholder="Enter your full name" />
  }
}

export const Required: Story = {
  args: {
    label: 'Email Address',
    required: true,
    children: <InputField placeholder="Enter your email" type="email" />
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    helperText: 'Must be at least 8 characters long',
    children: <InputField placeholder="Enter password" type="password" />
  }
}

export const WithError: Story = {
  args: {
    label: 'Username',
    errorMessage: 'Username is already taken',
    children: <InputField placeholder="Enter username" />
  }
}

export const HorizontalLayout: Story = {
  args: {
    label: 'First Name',
    orientation: 'horizontal',
    children: <InputField placeholder="Enter first name" />
  }
}

export const HorizontalWithCustomWidth: Story = {
  args: {
    label: 'Date of Birth',
    orientation: 'horizontal',
    labelWidth: 'w-40',
    children: <InputField placeholder="MM/DD/YYYY" />
  }
}

export const WithDropdown: Story = {
  args: {
    label: 'Country',
    required: true,
    helperText: 'Select your country of residence',
    children: <DropdownSelect options={sampleOptions} placeholder="Select country" />
  }
}

export const LongLabel: Story = {
  args: {
    label: 'Emergency Contact Information and Additional Details',
    required: true,
    helperText: 'Please provide a contact person in case of emergency',
    children: <InputField placeholder="Contact name and phone number" />
  }
}

export const NoLabel: Story = {
  args: {
    helperText: 'This field has no label but includes helper text',
    children: <InputField placeholder="Field without label" />
  }
}

// FormGroup Stories
export const SimpleFormGroup: Story = {
  render: () => (
    <FormGroup title="Personal Information" description="Please provide your basic personal details">
      <FormField label="First Name" required>
        <InputField placeholder="Enter first name" />
      </FormField>
      <FormField label="Last Name" required>
        <InputField placeholder="Enter last name" />
      </FormField>
      <FormField label="Email" helperText="We'll use this to contact you">
        <InputField placeholder="Enter email address" type="email" />
      </FormField>
    </FormGroup>
  )
}

export const FormGroupWithSpacing: Story = {
  render: () => (
    <div className="space-y-8">
      <FormGroup title="Small Spacing" spacing="sm">
        <FormField label="Field 1">
          <InputField placeholder="Input 1" />
        </FormField>
        <FormField label="Field 2">
          <InputField placeholder="Input 2" />
        </FormField>
      </FormGroup>
      
      <FormGroup title="Large Spacing" spacing="lg">
        <FormField label="Field 1">
          <InputField placeholder="Input 1" />
        </FormField>
        <FormField label="Field 2">
          <InputField placeholder="Input 2" />
        </FormField>
      </FormGroup>
    </div>
  )
}

// Complete Form Example
export const CompleteForm: Story = {
  render: () => (
    <Form spacing="md">
      <FormGroup title="Account Information" description="Create your RBI System account">
        <FormField label="Username" required errorMessage="Username must be unique">
          <InputField placeholder="Choose a username" />
        </FormField>
        <FormField label="Email Address" required>
          <InputField placeholder="Enter your email" type="email" />
        </FormField>
        <FormField label="Password" required helperText="Must be at least 8 characters">
          <InputField placeholder="Create password" type="password" />
        </FormField>
      </FormGroup>

      <FormGroup title="Personal Details">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" required>
            <InputField placeholder="First name" />
          </FormField>
          <FormField label="Last Name" required>
            <InputField placeholder="Last name" />
          </FormField>
        </div>
        <FormField label="Role" required>
          <DropdownSelect 
            options={[
              { value: 'admin', label: 'Administrator' },
              { value: 'clerk', label: 'Barangay Clerk' },
              { value: 'captain', label: 'Barangay Captain' }
            ]} 
            placeholder="Select your role" 
          />
        </FormField>
      </FormGroup>

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Create Account</Button>
      </div>
    </Form>
  )
}

export const HorizontalFormLayout: Story = {
  render: () => (
    <Form>
      <FormGroup title="Profile Settings" description="Update your profile information">
        <FormField label="Display Name" orientation="horizontal" labelWidth="w-32">
          <InputField placeholder="Your display name" />
        </FormField>
        <FormField label="Email" orientation="horizontal" labelWidth="w-32" helperText="Primary contact email">
          <InputField placeholder="email@example.com" type="email" />
        </FormField>
        <FormField label="Role" orientation="horizontal" labelWidth="w-32">
          <DropdownSelect 
            options={sampleOptions} 
            placeholder="Select role" 
          />
        </FormField>
        <FormField label="Bio" orientation="horizontal" labelWidth="w-32" helperText="Brief description about yourself">
          <InputField placeholder="Tell us about yourself..." />
        </FormField>
      </FormGroup>
    </Form>
  )
}