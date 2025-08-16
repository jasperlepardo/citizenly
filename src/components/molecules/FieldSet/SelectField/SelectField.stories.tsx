import type { Meta, StoryObj } from '@storybook/react';
import { SelectField } from './SelectField';
import { SelectOption } from '../../Select';

const meta: Meta<typeof SelectField> = {
  title: 'Molecules/FieldSet/SelectField',
  component: SelectField,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
    required: {
      control: 'boolean',
    },
    selectProps: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

// Sample options for all stories
const sampleOptions: SelectOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const civilStatusOptions: SelectOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

const educationOptions: SelectOption[] = [
  { value: 'elementary', label: 'Elementary', description: 'Grade 1-6' },
  { value: 'high_school', label: 'High School', description: 'Grade 7-12' },
  { value: 'college', label: 'College', description: 'Bachelor\'s degree' },
  { value: 'graduate', label: 'Graduate', description: 'Master\'s or Doctorate' },
  { value: 'vocational', label: 'Vocational', description: 'Technical or trade school' },
];

export const Basic: Story = {
  args: {
    label: 'Sex',
    required: true,
    selectProps: {
      placeholder: 'Select sex...',
      options: sampleOptions,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Civil Status',
    helperText: 'Select your current civil status',
    selectProps: {
      placeholder: 'Select civil status...',
      options: civilStatusOptions,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Education Level',
    required: true,
    errorMessage: 'Education level is required',
    selectProps: {
      placeholder: 'Select education level...',
      options: educationOptions,
      error: 'Education level is required',
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const HorizontalLayout: Story = {
  args: {
    label: 'Sex',
    orientation: 'horizontal',
    labelWidth: 'w-24',
    selectProps: {
      placeholder: 'Select sex...',
      options: sampleOptions,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const Searchable: Story = {
  args: {
    label: 'Education Level',
    helperText: 'Start typing to search education levels',
    selectProps: {
      placeholder: 'Search education level...',
      options: educationOptions,
      searchable: true,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const WithEnumData: Story = {
  args: {
    label: 'Status',
    selectProps: {
      placeholder: 'Select status...',
      enumData: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        suspended: 'Suspended',
      },
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const AllowCustom: Story = {
  args: {
    label: 'Occupation',
    helperText: 'Select from list or type a custom occupation',
    selectProps: {
      placeholder: 'Select or type occupation...',
      options: [
        { value: 'teacher', label: 'Teacher' },
        { value: 'engineer', label: 'Engineer' },
        { value: 'doctor', label: 'Doctor' },
        { value: 'nurse', label: 'Nurse' },
        { value: 'farmer', label: 'Farmer' },
      ],
      allowCustom: true,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    selectProps: {
      placeholder: 'This field is disabled...',
      options: sampleOptions,
      disabled: true,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading Data',
    selectProps: {
      placeholder: 'Loading options...',
      options: [],
      loading: true,
      onSelect: (option) => console.log('Selected:', option),
    },
  },
};

export const WithChildren: Story = {
  args: {
    label: 'Custom Select',
    helperText: 'This uses a custom select component as children',
    children: (
      <select className="w-full p-2 border border-gray-300 rounded-md">
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    ),
  },
};

export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <SelectField
        label="Sex"
        required
        selectProps={{
          placeholder: 'Select sex...',
          options: sampleOptions,
          onSelect: (option) => console.log('Sex selected:', option),
        }}
      />
      
      <SelectField
        label="Civil Status"
        selectProps={{
          placeholder: 'Select civil status...',
          options: civilStatusOptions,
          onSelect: (option) => console.log('Civil status selected:', option),
        }}
      />
      
      <SelectField
        label="Education Level"
        helperText="Highest level of education completed"
        selectProps={{
          placeholder: 'Search education level...',
          options: educationOptions,
          searchable: true,
          onSelect: (option) => console.log('Education selected:', option),
        }}
      />
    </div>
  ),
};