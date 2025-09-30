import type { Meta, StoryObj } from '@storybook/react';
import { ContactInformationForm } from '@/components/organisms/ContactInformation';

const meta: Meta<typeof ContactInformationForm> = {
  title: 'Organisms/Form/Resident/ContactInformation',
  component: ContactInformationForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ContactInformationForm is a form organism that handles contact information for residents.

## Features
- **Mobile Number**: Mobile phone number input with validation
- **Telephone Number**: Landline phone number input
- **Email Address**: Email input with built-in validation
- **Responsive Layout**: Grid layout that adapts to screen size
- **Error Handling**: Displays validation errors for each field
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      description: 'Form data object containing contact information field values',
    },
    onChange: {
      description: 'Callback function called when form fields change',
    },
    errors: {
      description: 'Object containing validation errors keyed by field name',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample form data
const sampleFormData = {
  mobileNumber: '',
  telephoneNumber: '',
  email: '',
};

const sampleErrors = {};

export const Default: Story = {
  args: {
    formData: sampleFormData,
    onChange: (field: string, value: string | number | boolean | null) => {
      console.log('Field changed:', field, value);
    },
    errors: sampleErrors,
  },
};

export const WithData: Story = {
  args: {
    formData: {
      mobileNumber: '+639171234567',
      telephoneNumber: '(02) 1234-5678',
      email: 'juan.delacruz@example.com',
    },
    onChange: (field: string, value: string | number | boolean | null) => {
      console.log('Field changed:', field, value);
    },
    errors: sampleErrors,
  },
};

export const WithErrors: Story = {
  args: {
    formData: sampleFormData,
    onChange: (field: string, value: string | number | boolean | null) => {
      console.log('Field changed:', field, value);
    },
    errors: {
      mobileNumber: 'Mobile number is required',
      email: 'Please enter a valid email address',
    },
  },
};
