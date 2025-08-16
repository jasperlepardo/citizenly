import type { Meta, StoryObj } from '@storybook/react';
import PersonalInfoSection from './PersonalInfoSection';

const mockAction = (field: string, value: unknown) => {
  console.log(`Field ${field} updated:`, value);
};

const meta = {
  title: 'Organisms/ResidentFormSections/PersonalInfoSection',
  component: PersonalInfoSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Personal Information Section for resident forms. Handles basic personal details like name, birthdate, sex, civil status, citizenship, education, and employment status with validation and proper enum options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      control: { type: 'object' },
      description: 'Form data object containing personal information',
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
} satisfies Meta<typeof PersonalInfoSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default personal info section
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
        story: 'Default personal information section with empty form data.',
      },
    },
  },
};

// With sample data
export const WithData: Story = {
  args: {
    formData: {
      first_name: 'Juan',
      middle_name: 'Santos',
      last_name: 'Dela Cruz',
      suffix: 'Jr.',
      birth_date: '1990-05-15',
      sex: 'male',
      civil_status: 'married',
      citizenship: 'filipino',
      education_level: 'college_graduate',
      employment_status: 'employed',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information section with complete sample data.',
      },
    },
  },
};

// With validation errors
export const WithErrors: Story = {
  args: {
    formData: {
      first_name: '',
      middle_name: 'Santos',
      last_name: '',
      suffix: '',
      birth_date: '2025-01-01', // Future date
      sex: '',
      civil_status: '',
      citizenship: '',
      education_level: '',
      employment_status: '',
    },
    errors: {
      first_name: 'First name is required',
      last_name: 'Last name is required',
      birth_date: 'Birth date cannot be in the future',
      sex: 'Sex is required',
      civil_status: 'Civil status is required',
      citizenship: 'Citizenship is required',
      education_level: 'Education level is required',
      employment_status: 'Employment status is required',
    },
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information section displaying validation errors.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    formData: {
      first_name: 'Maria',
      middle_name: 'Garcia',
      last_name: 'Santos',
      suffix: '',
      birth_date: '1985-12-03',
      sex: 'female',
      civil_status: 'single',
      citizenship: 'filipino',
      education_level: 'high_school_graduate',
      employment_status: 'unemployed',
    },
    errors: {},
    updateField: mockAction,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information section in disabled state (read-only).',
      },
    },
  },
};

// Single person
export const SinglePerson: Story = {
  args: {
    formData: {
      first_name: 'Ana',
      middle_name: 'Reyes',
      last_name: 'Cruz',
      suffix: '',
      birth_date: '1992-08-20',
      sex: 'female',
      civil_status: 'single',
      citizenship: 'filipino',
      education_level: 'college_graduate',
      employment_status: 'employed',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information for a single professional person.',
      },
    },
  },
};

// Senior citizen
export const SeniorCitizen: Story = {
  args: {
    formData: {
      first_name: 'Roberto',
      middle_name: 'Mendoza',
      last_name: 'Garcia',
      suffix: 'Sr.',
      birth_date: '1955-03-12',
      sex: 'male',
      civil_status: 'widowed',
      citizenship: 'filipino',
      education_level: 'elementary_graduate',
      employment_status: 'retired',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information for a senior citizen.',
      },
    },
  },
};

// Young adult
export const YoungAdult: Story = {
  args: {
    formData: {
      first_name: 'Carlos',
      middle_name: 'Jose',
      last_name: 'Mendoza',
      suffix: '',
      birth_date: '2001-11-08',
      sex: 'male',
      civil_status: 'single',
      citizenship: 'filipino',
      education_level: 'college_undergraduate',
      employment_status: 'student',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information for a young adult college student.',
      },
    },
  },
};

// Foreign citizen
export const ForeignCitizen: Story = {
  args: {
    formData: {
      first_name: 'John',
      middle_name: 'Michael',
      last_name: 'Smith',
      suffix: '',
      birth_date: '1988-07-25',
      sex: 'male',
      civil_status: 'married',
      citizenship: 'american',
      education_level: 'college_graduate',
      employment_status: 'employed',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information for a foreign citizen resident.',
      },
    },
  },
};

// With suffix variations
export const WithSuffix: Story = {
  args: {
    formData: {
      first_name: 'Pedro',
      middle_name: 'Antonio',
      last_name: 'Reyes',
      suffix: 'III',
      birth_date: '1987-04-18',
      sex: 'male',
      civil_status: 'married',
      citizenship: 'filipino',
      education_level: 'college_graduate',
      employment_status: 'employed',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information with name suffix (Jr., Sr., III, etc.).',
      },
    },
  },
};

// Partial data entry
export const PartialData: Story = {
  args: {
    formData: {
      first_name: 'Lisa',
      middle_name: '',
      last_name: 'Gonzales',
      suffix: '',
      birth_date: '1993-06-30',
      sex: 'female',
      civil_status: 'single',
      // Missing citizenship, education, employment
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information section with partial data entry.',
      },
    },
  },
};

// Mixed error states
export const MixedErrorStates: Story = {
  args: {
    formData: {
      first_name: 'Valid Name',
      middle_name: 'Middle',
      last_name: '', // Missing
      suffix: '',
      birth_date: '1990-05-15',
      sex: 'male',
      civil_status: '', // Missing
      citizenship: 'filipino',
      education_level: 'college_graduate',
      employment_status: '', // Missing
    },
    errors: {
      last_name: 'Last name is required',
      civil_status: 'Civil status is required',
      employment_status: 'Employment status is required',
    },
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information with mixed valid data and error states.',
      },
    },
  },
};

// Long names
export const LongNames: Story = {
  args: {
    formData: {
      first_name: 'Maria Concepcion Esperanza',
      middle_name: 'De Los Santos',
      last_name: 'Villanueva-Fernandez',
      suffix: '',
      birth_date: '1989-09-14',
      sex: 'female',
      civil_status: 'married',
      citizenship: 'filipino',
      education_level: 'college_graduate',
      employment_status: 'employed',
    },
    errors: {},
    updateField: mockAction,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information with long names to test field width handling.',
      },
    },
  },
};