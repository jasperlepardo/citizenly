import type { Meta, StoryObj } from '@storybook/react';
import { SectoralInformationForm } from '@/components/organisms/SectoralInformation';

const meta = {
  title: 'Organisms/Form/Resident/SectoralInformation',
  component: SectoralInformationForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form for managing sectoral classifications and group memberships for residents. Includes auto-calculation based on age, employment status, and education level.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      description:
        'Form data object containing sectoral flags and context data for auto-calculation',
      control: { type: 'object' },
    },
    onChange: {
      description: 'Callback function called when sectoral classifications change',
      action: 'onChange',
    },
    errors: {
      description: 'Object containing validation errors for sectoral fields',
      control: { type: 'object' },
    },
  },
} satisfies Meta<typeof SectoralInformationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with basic context data
export const Default: Story = {
  args: {
    formData: {
      birthdate: '1990-01-01',
      employmentStatus: 'employed',
      educationAttainment: 'college',
      civilStatus: 'single',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing a young employed professional
export const YoungProfessional: Story = {
  args: {
    formData: {
      birthdate: '1995-03-15',
      employmentStatus: 'employed_full_time',
      educationAttainment: 'college',
      civilStatus: 'single',
      isLaborForce: true,
      isLaborForceEmployed: true,
      isUnemployed: false,
      isOverseasFilipino: false,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: false,
      isIndigenousPeople: false,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing a senior citizen
export const SeniorCitizen: Story = {
  args: {
    formData: {
      birthdate: '1950-06-20',
      employmentStatus: 'retired',
      educationAttainment: 'high_school',
      civilStatus: 'married',
      isLaborForce: false,
      isLaborForceEmployed: false,
      isUnemployed: false,
      isOverseasFilipino: false,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: true,
      isRegisteredSeniorCitizen: true,
      isSoloParent: false,
      isIndigenousPeople: false,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing an OFW (Overseas Filipino Worker)
export const OverseasFilipino: Story = {
  args: {
    formData: {
      birthdate: '1985-09-10',
      employmentStatus: 'ofw',
      educationAttainment: 'college',
      civilStatus: 'married',
      isLaborForce: true,
      isLaborForceEmployed: true,
      isUnemployed: false,
      isOverseasFilipino: true,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: false,
      isIndigenousPeople: false,
      isMigrant: true,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing a solo parent with PWD
export const SoloParentWithPWD: Story = {
  args: {
    formData: {
      birthdate: '1988-12-05',
      employmentStatus: 'unemployed_looking',
      educationAttainment: 'high_school',
      civilStatus: 'separated',
      isLaborForce: true,
      isLaborForceEmployed: false,
      isUnemployed: true,
      isOverseasFilipino: false,
      isPersonWithDisability: true,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: true,
      isIndigenousPeople: false,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing out-of-school youth
export const OutOfSchoolYouth: Story = {
  args: {
    formData: {
      birthdate: '2002-04-18',
      employmentStatus: 'unemployed_looking',
      educationAttainment: 'elementary',
      civilStatus: 'single',
      isLaborForce: true,
      isLaborForceEmployed: false,
      isUnemployed: true,
      isOverseasFilipino: false,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: true,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: false,
      isIndigenousPeople: false,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story showing indigenous person
export const IndigenousPerson: Story = {
  args: {
    formData: {
      birthdate: '1992-08-30',
      employmentStatus: 'self_employed',
      educationAttainment: 'elementary',
      civilStatus: 'married',
      isLaborForce: true,
      isLaborForceEmployed: true,
      isUnemployed: false,
      isOverseasFilipino: false,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: false,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: false,
      isIndigenousPeople: true,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story with out-of-school children (minor)
export const OutOfSchoolChild: Story = {
  args: {
    formData: {
      birthdate: '2010-11-12',
      employmentStatus: 'not_in_labor_force',
      educationAttainment: 'elementary',
      civilStatus: 'single',
      isLaborForce: false,
      isLaborForceEmployed: false,
      isUnemployed: false,
      isOverseasFilipino: false,
      isPersonWithDisability: false,
      isOutOfSchoolChildren: true,
      isOutOfSchoolYouth: false,
      isSeniorCitizen: false,
      isRegisteredSeniorCitizen: false,
      isSoloParent: false,
      isIndigenousPeople: false,
      isMigrant: false,
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {},
  },
};

// Story with validation errors
export const WithErrors: Story = {
  args: {
    formData: {
      birthdate: '',
      employmentStatus: '',
      educationAttainment: '',
      civilStatus: '',
    },
    onChange: (field, value) => console.log(`Field ${String(field)} changed to:`, value),
    errors: {
      birthdate: 'Birth date is required for sectoral calculations',
      employmentStatus: 'Employment status is required',
      educationAttainment: 'Education level is required',
    },
  },
};
