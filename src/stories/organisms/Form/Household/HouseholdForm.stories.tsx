import type { Meta, StoryObj } from '@storybook/react';
import { HouseholdForm } from '@/components/organisms/HouseholdForm';

const meta: Meta<typeof HouseholdForm> = {
  title: 'Organisms/Form/Household/HouseholdForm',
  component: HouseholdForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Main household form component for creating and editing household information.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['create', 'edit', 'view'],
      description: 'Form mode determines field editability',
    },
    showActions: {
      control: 'boolean',
      description: 'Whether to show form action buttons',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state for form submission',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HouseholdForm>;

// Create Mode Story
export const CreateMode: Story = {
  args: {
    mode: 'create',
    showActions: true,
    isLoading: false,
    initialData: {
      noOfFamilies: 1,
      noOfHouseholdMembers: 4,
      noOfMigrants: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in create mode for registering new households.',
      },
    },
  },
};

// Edit Mode Story
export const EditMode: Story = {
  args: {
    mode: 'edit',
    showActions: true,
    isLoading: false,
    initialData: {
      houseNumber: '123-A',
      streetId: 'street-1',
      subdivisionId: 'subdiv-1',
      barangayCode: '137404001',
      cityMunicipalityCode: '137404',
      provinceCode: '1371',
      regionCode: '13',
      zipCode: '1234',
      noOfFamilies: 2,
      noOfHouseholdMembers: 6,
      noOfMigrants: 1,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in edit mode with existing household data.',
      },
    },
  },
};

// View Mode Story
export const ViewMode: Story = {
  args: {
    mode: 'view',
    showActions: false,
    isLoading: false,
    initialData: {
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
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in view-only mode for displaying household information.',
      },
    },
  },
};

// With Validation Errors
export const WithErrors: Story = {
  args: {
    mode: 'edit',
    showActions: true,
    isLoading: false,
    initialData: {
      houseNumber: '',
      noOfFamilies: 0,
      noOfHouseholdMembers: 2,
      noOfMigrants: 5, // Invalid: more migrants than members
    },
    errors: {
      houseNumber: 'House number is required',
      barangayCode: 'Please select a barangay',
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

// Loading State
export const LoadingState: Story = {
  args: {
    mode: 'create',
    showActions: true,
    isLoading: true,
    initialData: {
      houseNumber: '789',
      noOfFamilies: 1,
      noOfHouseholdMembers: 2,
      noOfMigrants: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form in loading state during submission.',
      },
    },
  },
};
