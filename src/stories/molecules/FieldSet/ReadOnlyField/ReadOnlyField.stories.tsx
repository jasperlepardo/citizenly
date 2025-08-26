import type { Meta, StoryObj } from '@storybook/react';
import { ReadOnlyField } from '@/components/molecules/ReadOnlyField';

const meta: Meta<typeof ReadOnlyField> = {
  title: 'Molecules/FieldSet/ReadOnlyField',
  component: ReadOnlyField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label for the field',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation',
    },
    readOnlyProps: {
      control: false,
      description: 'Props to pass to the ReadOnly component',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Full Name',
    readOnlyProps: {
      value: 'Juan Dela Cruz',
    },
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email Address',
    helperText: 'This email cannot be changed after registration',
    readOnlyProps: {
      value: 'juan.delacruz@email.com',
    },
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Status',
    readOnlyProps: {
      value: 'Active',
      leftIcon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  },
};

export const HorizontalLayout: Story = {
  args: {
    label: 'Department',
    orientation: 'horizontal',
    labelWidth: 'w-40',
    readOnlyProps: {
      value: 'Engineering',
    },
  },
};

export const EmptyValue: Story = {
  args: {
    label: 'Optional Field',
    helperText: 'This field was left empty',
    readOnlyProps: {
      value: '',
    },
  },
};

// Example showing how to use in Create/View/Edit scenarios
export const CreateViewEditExample: Story = {
  render: () => {
    const userData = {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      email: 'juan.delacruz@email.com',
      department: 'Engineering',
      status: 'Active',
    };

    const isViewMode = true; // This would come from your app state

    return (
      <div className="max-w-md space-y-6">
        <h3 className="text-lg font-semibold">{isViewMode ? 'View' : 'Edit'} User Profile</h3>

        <div className="space-y-4">
          <ReadOnlyField
            label="First Name"
            readOnlyProps={{
              value: userData.firstName,
            }}
          />

          <ReadOnlyField
            label="Last Name"
            readOnlyProps={{
              value: userData.lastName,
            }}
          />

          <ReadOnlyField
            label="Email"
            helperText="Email cannot be changed"
            readOnlyProps={{
              value: userData.email,
            }}
          />

          <ReadOnlyField
            label="Department"
            readOnlyProps={{
              value: userData.department,
            }}
          />

          <ReadOnlyField
            label="Status"
            readOnlyProps={{
              value: userData.status,
              leftIcon: (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            }}
          />
        </div>
      </div>
    );
  },
};
