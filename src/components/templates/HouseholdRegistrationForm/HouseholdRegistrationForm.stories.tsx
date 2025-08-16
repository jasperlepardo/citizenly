import type { Meta, StoryObj } from '@storybook/react';
import HouseholdRegistrationForm from './HouseholdRegistrationForm';

const mockAction = (name: string) => (data: unknown) => {
  console.log(`${name}:`, data);
};

const meta = {
  title: 'Templates/HouseholdRegistrationForm',
  component: HouseholdRegistrationForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive household registration form template that allows registering a household with multiple residents. Includes form validation, dynamic member addition/removal, and submission handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: {
      description: 'Callback function called when household registration succeeds',
    },
    onCancel: {
      description: 'Callback function called when user cancels registration',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HouseholdRegistrationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock fetch for successful submission
const mockSuccessfulSubmission = () => {
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        household: {
          id: 'HH-001',
          household_number: 'HH-2024-001',
          household_type: 'nuclear',
          address: 'Sample Address',
          barangay_code: '042108001',
        },
        residents: [
          {
            id: 'R-001',
            first_name: 'Juan',
            last_name: 'Santos',
            relationship_to_head: 'head',
          },
        ],
      }),
    });
};

// Mock fetch for failed submission
const mockFailedSubmission = (errorMessage = 'Registration failed') => {
  global.fetch = () =>
    Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: errorMessage }),
    });
};

// Mock supabase auth session
const mockSupabaseSession = () => {
  const mockSupabase = {
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            access_token: 'mock-token',
            user: { id: '1', email: 'admin@example.com' },
          },
        },
      }),
    },
  };
  
  // Mock the imported supabase instance
  // Note: Supabase mocking would be handled by Storybook/MSW in real implementation
  console.log('Supabase mock would be configured here');
};

// Default registration form
export const Default: Story = {
  args: {
    onSuccess: mockAction('Household registered successfully'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Default household registration form with empty fields ready for input.',
      },
    },
  },
};

// Pre-filled nuclear family example
export const NuclearFamilyExample: Story = {
  args: {
    onSuccess: mockAction('Nuclear family registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    // Pre-fill form data for demonstration
    setTimeout(() => {
      const householdTypeSelect = document.querySelector('[name="household_type"]') as HTMLSelectElement;
      const addressTextarea = document.querySelector('[name="address"]') as HTMLTextAreaElement;
      const contactInput = document.querySelector('[name="contact_number"]') as HTMLInputElement;
      const emailInput = document.querySelector('[name="email"]') as HTMLInputElement;
      
      if (householdTypeSelect) householdTypeSelect.value = 'nuclear';
      if (addressTextarea) addressTextarea.value = '123 Rizal Street, Green Valley Subdivision';
      if (contactInput) contactInput.value = '+63 917 123 4567';
      if (emailInput) emailInput.value = 'santos.family@email.com';
      
      // Fill first resident (head)
      const firstNameInput = document.querySelector('[name="residents.0.first_name"]') as HTMLInputElement;
      const lastNameInput = document.querySelector('[name="residents.0.last_name"]') as HTMLInputElement;
      const birthDateInput = document.querySelector('[name="residents.0.birth_date"]') as HTMLInputElement;
      
      if (firstNameInput) firstNameInput.value = 'Juan';
      if (lastNameInput) lastNameInput.value = 'Santos';
      if (birthDateInput) birthDateInput.value = '1985-06-15';
    }, 100);
    
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Nuclear family registration example with sample data pre-filled.',
      },
    },
  },
};

// Large extended family
export const ExtendedFamilyExample: Story = {
  args: {
    onSuccess: mockAction('Extended family registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">Extended Family Registration Demo</h3>
          <p className="mt-1 text-sm text-blue-700">
            Click "Add Member" to demonstrate registering multiple family members including grandparents and relatives.
          </p>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Extended family registration demonstration with guidance for adding multiple members.',
      },
    },
  },
};

// Single parent household
export const SingleParentExample: Story = {
  args: {
    onSuccess: mockAction('Single parent household registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    setTimeout(() => {
      const householdTypeSelect = document.querySelector('[name="household_type"]') as HTMLSelectElement;
      const addressTextarea = document.querySelector('[name="address"]') as HTMLTextAreaElement;
      const contactInput = document.querySelector('[name="contact_number"]') as HTMLInputElement;
      
      if (householdTypeSelect) householdTypeSelect.value = 'single_parent';
      if (addressTextarea) addressTextarea.value = '456 Luna Street, Apartment 2B';
      if (contactInput) contactInput.value = '+63 928 987 6543';
      
      // Fill head of household
      const firstNameInput = document.querySelector('[name="residents.0.first_name"]') as HTMLInputElement;
      const lastNameInput = document.querySelector('[name="residents.0.last_name"]') as HTMLInputElement;
      const birthDateInput = document.querySelector('[name="residents.0.birth_date"]') as HTMLInputElement;
      const sexSelect = document.querySelector('[name="residents.0.sex"]') as HTMLSelectElement;
      const civilStatusSelect = document.querySelector('[name="residents.0.civil_status"]') as HTMLSelectElement;
      
      if (firstNameInput) firstNameInput.value = 'Maria';
      if (lastNameInput) lastNameInput.value = 'Cruz';
      if (birthDateInput) birthDateInput.value = '1990-03-22';
      if (sexSelect) sexSelect.value = 'female';
      if (civilStatusSelect) civilStatusSelect.value = 'single';
    }, 100);
    
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Single parent household registration with sample data.',
      },
    },
  },
};

// Senior couple (childless)
export const SeniorCoupleExample: Story = {
  args: {
    onSuccess: mockAction('Senior couple registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    setTimeout(() => {
      const householdTypeSelect = document.querySelector('[name="household_type"]') as HTMLSelectElement;
      const addressTextarea = document.querySelector('[name="address"]') as HTMLTextAreaElement;
      const monthlyIncomeInput = document.querySelector('[name="monthly_income"]') as HTMLInputElement;
      
      if (householdTypeSelect) householdTypeSelect.value = 'childless';
      if (addressTextarea) addressTextarea.value = '789 Del Pilar Street, Senior Village';
      if (monthlyIncomeInput) monthlyIncomeInput.value = '25000';
      
      // Fill head of household
      const firstNameInput = document.querySelector('[name="residents.0.first_name"]') as HTMLInputElement;
      const lastNameInput = document.querySelector('[name="residents.0.last_name"]') as HTMLInputElement;
      const birthDateInput = document.querySelector('[name="residents.0.birth_date"]') as HTMLInputElement;
      const civilStatusSelect = document.querySelector('[name="residents.0.civil_status"]') as HTMLSelectElement;
      
      if (firstNameInput) firstNameInput.value = 'Roberto';
      if (lastNameInput) lastNameInput.value = 'Garcia';
      if (birthDateInput) birthDateInput.value = '1955-12-10';
      if (civilStatusSelect) civilStatusSelect.value = 'married';
    }, 100);
    
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Senior couple household registration example.',
      },
    },
  },
};

// Form validation errors
export const WithValidationErrors: Story = {
  args: {
    onSuccess: mockAction('Registration success'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4">
          <h3 className="font-medium text-red-900">Validation Demo</h3>
          <p className="mt-1 text-sm text-red-700">
            Try submitting the form without filling required fields to see validation errors.
          </p>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form validation demonstration - submit without required fields to see error messages.',
      },
    },
  },
};

// Submission loading state
export const SubmissionLoading: Story = {
  args: {
    onSuccess: mockAction('Registration success'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    
    // Mock slow submission to show loading state
    global.fetch = () =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
              household: { id: 'HH-001', household_number: 'HH-2024-001' },
            }),
          }),
          5000
        )
      );
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-yellow-50 p-4">
          <h3 className="font-medium text-yellow-900">Loading State Demo</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Fill out the form and submit to see the loading state during submission.
          </p>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of loading state during form submission.',
      },
    },
  },
};

// Submission error
export const SubmissionError: Story = {
  args: {
    onSuccess: mockAction('Registration success'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockFailedSubmission('Household registration failed. Please check your data and try again.');
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4">
          <h3 className="font-medium text-red-900">Error Handling Demo</h3>
          <p className="mt-1 text-sm text-red-700">
            Form submission will fail to demonstrate error handling.
          </p>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of error handling when form submission fails.',
      },
    },
  },
};

// Without cancel button
export const WithoutCancelButton: Story = {
  args: {
    onSuccess: mockAction('Registration success'),
    // No onCancel prop - cancel button won't show
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Registration form without cancel button (when onCancel prop is not provided).',
      },
    },
  },
};

// PWD and special categories example
export const SpecialCategoriesExample: Story = {
  args: {
    onSuccess: mockAction('Special categories household registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4">
          <h3 className="font-medium text-green-900">Special Categories Demo</h3>
          <p className="mt-1 text-sm text-green-700">
            Add members and check PWD, Voter, and Indigenous checkboxes to see special category tracking.
          </p>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of special category checkboxes (PWD, Voter, Indigenous).',
      },
    },
  },
};

// Complex household structure
export const ComplexHouseholdStructure: Story = {
  args: {
    onSuccess: mockAction('Complex household registered'),
    onCancel: mockAction('Registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-purple-50 p-4">
          <h3 className="font-medium text-purple-900">Complex Household Demo</h3>
          <p className="mt-1 text-sm text-purple-700">
            Demonstrates various relationship types: head, spouse, children, parents, grandparents, siblings, and non-relatives.
          </p>
          <div className="mt-2 text-xs text-purple-600">
            <strong>Tip:</strong> Use "Add Member" to create a large household with various relationships.
          </div>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex household with various relationship types and member configurations.',
      },
    },
  },
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    onSuccess: mockAction('Mobile registration success'),
    onCancel: mockAction('Mobile registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    return <HouseholdRegistrationForm {...args} />;
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Household registration form optimized for mobile devices.',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    onSuccess: mockAction('Dark mode registration success'),
    onCancel: mockAction('Dark mode registration cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="dark min-h-screen bg-gray-900">
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Household registration form in dark mode.',
      },
    },
  },
};

// Form workflow demonstration
export const FormWorkflowDemo: Story = {
  args: {
    onSuccess: mockAction('Workflow demo success'),
    onCancel: mockAction('Workflow demo cancelled'),
  },
  render: (args) => {
    mockSupabaseSession();
    mockSuccessfulSubmission();
    
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-indigo-50 p-6">
          <h2 className="text-lg font-semibold text-indigo-900">Household Registration Workflow</h2>
          <div className="mt-4 space-y-3 text-sm text-indigo-700">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 text-xs font-medium">1</span>
              <div>
                <strong>Household Information:</strong> Fill in household type, income, address, and contact details.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 text-xs font-medium">2</span>
              <div>
                <strong>Household Members:</strong> Add head of household and family members with their details.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 text-xs font-medium">3</span>
              <div>
                <strong>Special Categories:</strong> Mark members as PWD, registered voters, or indigenous people.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 text-xs font-medium">4</span>
              <div>
                <strong>Submit:</strong> Register the household and receive a household number.
              </div>
            </div>
          </div>
        </div>
        <HouseholdRegistrationForm {...args} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete workflow demonstration with step-by-step guidance.',
      },
    },
  },
};