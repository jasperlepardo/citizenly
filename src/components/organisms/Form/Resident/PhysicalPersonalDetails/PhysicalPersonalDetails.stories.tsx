import type { Meta, StoryObj } from '@storybook/react';
import { PhysicalPersonalDetailsForm } from './PhysicalPersonalDetails';

const meta = {
  title: 'Organisms/Form/Resident/PhysicalPersonalDetails',
  component: PhysicalPersonalDetailsForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive form for collecting physical characteristics, voting information, and mother\'s maiden name details for resident registration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      description: 'Form data object containing all physical and personal detail fields',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function called when form fields change',
      action: 'onChange',
    },
    errors: {
      description: 'Object containing validation errors for form fields',
      control: { type: 'object' },
    },
  },
} satisfies Meta<typeof PhysicalPersonalDetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with empty form
export const Default: Story = {
  args: {
    formData: {},
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story with sample data filled in
export const WithSampleData: Story = {
  args: {
    formData: {
      bloodType: 'O+',
      complexion: 'Medium',
      height: '170',
      weight: '65',
      citizenship: 'Filipino',
      ethnicity: 'tagalog',
      religion: 'roman_catholic',
      isVoter: true,
      isResidentVoter: true,
      lastVotedDate: '2024',
      motherMaidenFirstName: 'Maria',
      motherMaidenMiddleName: 'Santos',
      motherMaidenLastName: 'Cruz',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story with validation errors
export const WithErrors: Story = {
  args: {
    formData: {
      bloodType: '',
      complexion: '',
      height: 'invalid',
      weight: '-10',
      citizenship: '',
      ethnicity: '',
      religion: '',
      isVoter: null,
      isResidentVoter: null,
      lastVotedDate: '',
      motherMaidenFirstName: '',
      motherMaidenMiddleName: '',
      motherMaidenLastName: '',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {
      bloodType: 'Blood type is required',
      complexion: 'Complexion is required',
      height: 'Please enter a valid height',
      weight: 'Weight must be a positive number',
      citizenship: 'Citizenship is required',
      ethnicity: 'Please select ethnicity',
      religion: 'Please select religion',
      isVoter: 'Please specify voter status',
      lastVotedDate: 'Please enter the year you last voted',
      motherMaidenFirstName: 'Mother\'s maiden first name is required',
      motherMaidenLastName: 'Mother\'s maiden last name is required',
    },
  },
};

// Story with "Others" religion selected to show conditional field
export const WithOtherReligion: Story = {
  args: {
    formData: {
      bloodType: 'A+',
      complexion: 'Fair',
      height: '165',
      weight: '55',
      citizenship: 'Filipino',
      ethnicity: 'cebuano',
      religion: 'others',
      religionOthersSpecify: 'Seventh Day Adventist',
      isVoter: false,
      isResidentVoter: false,
      motherMaidenFirstName: 'Ana',
      motherMaidenMiddleName: 'Reyes',
      motherMaidenLastName: 'Lopez',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing voter fields when registered
export const RegisteredVoter: Story = {
  args: {
    formData: {
      bloodType: 'B+',
      complexion: 'Dark',
      height: '175',
      weight: '70',
      citizenship: 'Filipino',
      ethnicity: 'ilocano',
      religion: 'iglesia_ni_cristo',
      isVoter: true,
      isResidentVoter: true,
      lastVotedDate: '2022',
      motherMaidenFirstName: 'Carmen',
      motherMaidenMiddleName: 'Garcia',
      motherMaidenLastName: 'Dela Cruz',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story with international resident data
export const InternationalResident: Story = {
  args: {
    formData: {
      bloodType: 'AB+',
      complexion: 'Fair',
      height: '168',
      weight: '62',
      citizenship: 'American',
      ethnicity: 'other',
      religion: 'christian',
      isVoter: false,
      isResidentVoter: false,
      motherMaidenFirstName: 'Mary',
      motherMaidenMiddleName: 'Jane',
      motherMaidenLastName: 'Smith',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};