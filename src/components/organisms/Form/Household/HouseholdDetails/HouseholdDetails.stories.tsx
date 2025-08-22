import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { HouseholdDetails } from './HouseholdDetails';
import { HouseholdDetailsData } from '../types';

const meta: Meta<typeof HouseholdDetails> = {
  title: 'Organisms/Form/Household/HouseholdDetails',
  component: HouseholdDetails,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Household details form section including address, geographic location, and statistics.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['create', 'edit', 'view'],
      description: 'Form mode determines field editability',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HouseholdDetails>;

// Interactive wrapper component for Storybook
const InteractiveHouseholdDetails = (args: any) => {
  const [formData, setFormData] = useState<HouseholdDetailsData>(args.formData);

  const handleChange = (field: string, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <HouseholdDetails
      {...args}
      formData={formData}
      onChange={handleChange}
    />
  );
};

// Default Story
export const Default: Story = {
  render: InteractiveHouseholdDetails,
  args: {
    formData: {
      houseNumber: '',
      streetId: '',
      subdivisionId: '',
      barangayCode: '',
      cityMunicipalityCode: '',
      provinceCode: '',
      regionCode: '',
      zipCode: '',
      noOfFamilies: 1,
      noOfHouseholdMembers: 0,
      noOfMigrants: 0,
    },
    mode: 'edit',
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Default household details form with empty fields.',
      },
    },
  },
};

// Filled Form Story
export const FilledForm: Story = {
  render: InteractiveHouseholdDetails,
  args: {
    formData: {
      houseNumber: '123-A',
      streetId: 'street-1',
      subdivisionId: 'subdiv-1',
      barangayCode: '137404001',
      cityMunicipalityCode: '137404',
      provinceCode: '1371',
      regionCode: '13',
      zipCode: '1234',
      noOfFamilies: 2,
      noOfHouseholdMembers: 5,
      noOfMigrants: 1,
    },
    mode: 'edit',
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Household details form with populated data.',
      },
    },
  },
};

// View Mode Story
export const ViewMode: Story = {
  render: InteractiveHouseholdDetails,
  args: {
    formData: {
      houseNumber: '456-B',
      streetId: 'street-2',
      subdivisionId: '',
      barangayCode: '137404002',
      cityMunicipalityCode: '137404',
      provinceCode: '1371',
      regionCode: '13',
      zipCode: '1235',
      noOfFamilies: 1,
      noOfHouseholdMembers: 3,
      noOfMigrants: 0,
    },
    mode: 'view',
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Household details in read-only view mode.',
      },
    },
  },
};

// With Validation Errors
export const WithErrors: Story = {
  render: InteractiveHouseholdDetails,
  args: {
    formData: {
      houseNumber: '',
      streetId: '',
      subdivisionId: '',
      barangayCode: '',
      cityMunicipalityCode: '',
      provinceCode: '',
      regionCode: '',
      zipCode: '',
      noOfFamilies: 0,
      noOfHouseholdMembers: 2,
      noOfMigrants: 5,
    },
    mode: 'edit',
    errors: {
      houseNumber: 'House number is required',
      streetId: 'Please select a street',
      barangayCode: 'Please select a barangay',
      cityMunicipalityCode: 'Please select a city/municipality',
      regionCode: 'Please select a region',
      noOfFamilies: 'Number of families must be at least 1',
      noOfMigrants: 'Number of migrants cannot exceed household members',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors for required and invalid fields.',
      },
    },
  },
};