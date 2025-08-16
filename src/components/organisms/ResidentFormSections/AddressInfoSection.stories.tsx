import type { Meta, StoryObj } from '@storybook/react';
import AddressInfoSection from './AddressInfoSection';

const mockAction = (field: string, value: unknown) => {
  console.log(`Field ${field} updated:`, value);
};

const meta = {
  title: 'Organisms/ResidentFormSections/AddressInfoSection',
  component: AddressInfoSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Address Information Section for resident forms. Handles address details including household code, street ID, subdivision ID, and ZIP code. Features validation and helper text for guidance.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      control: { type: 'object' },
      description: 'Form data object containing address information',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for form validation',
    },
    updateField: {
      description: 'Callback function to update form field values',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the form inputs are disabled',
    },
  },
} satisfies Meta<typeof AddressInfoSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default address section
export const Default: Story = {
  args: {
    formData: {},
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default address information section with empty form data.',
      },
    },
  },
};

// With sample data
export const WithData: Story = {
  args: {
    formData: {
      household_code: '042114014-2025-000001',
      zip_code: '1234',
      street_id: 'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
      subdivision_id: 'f9e8d7c6-b5a4-3210-9876-543210fedcba',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with sample data filled in.',
      },
    },
  },
};

// With validation errors
export const WithErrors: Story = {
  args: {
    formData: {
      household_code: 'invalid-code',
      zip_code: '12345678901', // Too long
      street_id: 'not-a-uuid',
      subdivision_id: '',
    },
    errors: {
      household_code: 'Invalid household code format',
      zip_code: 'ZIP code must be 10 characters or less',
      street_id: 'Invalid UUID format',
      subdivision_id: 'Subdivision ID is required',
    },
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section displaying validation errors for various field types.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    formData: {
      household_code: '042114014-2025-000001',
      zip_code: '1234',
      street_id: 'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
      subdivision_id: 'f9e8d7c6-b5a4-3210-9876-543210fedcba',
    },
    errors: {},
    updateField: mockAction,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section in disabled state (read-only).',
      },
    },
  },
};

// Partial data entry
export const PartialData: Story = {
  args: {
    formData: {
      household_code: '042114014-2025-000001',
      zip_code: '1234',
      // street_id and subdivision_id left empty
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with partial data entry showing mixed filled and empty states.',
      },
    },
  },
};

// Long UUID format
export const LongUUIDs: Story = {
  args: {
    formData: {
      household_code: '042114014-2025-000001',
      zip_code: '4025',
      street_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      subdivision_id: 'ffffffff-0000-1111-2222-333333333333',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with long UUID values to test field width handling.',
      },
    },
  },
};

// Metro Manila example
export const MetroManilaAddress: Story = {
  args: {
    formData: {
      household_code: '137501001-2025-000123',
      zip_code: '1008',
      street_id: '12345678-90ab-cdef-1234-567890abcdef',
      subdivision_id: 'abcdef12-3456-7890-abcd-ef1234567890',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with Metro Manila household and ZIP code format.',
      },
    },
  },
};

// Provincial address
export const ProvincialAddress: Story = {
  args: {
    formData: {
      household_code: '042108001-2025-000456',
      zip_code: '4025',
      street_id: '98765432-10ab-cdef-9876-543210fedcba',
      subdivision_id: 'fedcba09-8765-4321-0fed-cba098765432',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with provincial household code and ZIP format.',
      },
    },
  },
};

// Mixed error states
export const MixedErrorStates: Story = {
  args: {
    formData: {
      household_code: '042108001-2025-000789',
      zip_code: '', // Missing
      street_id: 'valid-uuid-12345678-90ab-cdef-1234',
      subdivision_id: 'too-short', // Invalid format
    },
    errors: {
      zip_code: 'ZIP code is required',
      subdivision_id: 'Must be a valid UUID format',
    },
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Address section with mixed valid data and error states.',
      },
    },
  },
};

// Empty with some errors
export const EmptyWithErrors: Story = {
  args: {
    formData: {},
    errors: {
      household_code: 'Household code is required',
      zip_code: 'ZIP code is required',
    },
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty address section showing required field validation errors.',
      },
    },
  },
};