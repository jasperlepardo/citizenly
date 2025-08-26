import type { Meta, StoryObj } from '@storybook/react';
import { PersonalInformationForm, type PersonalInformationFormProps } from '@/components/organisms/PersonalInformation';

const meta: Meta<typeof PersonalInformationForm> = {
  title: 'Organisms/Form/Resident/PersonalInformation',
  component: PersonalInformationForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
PersonalInformationForm is a comprehensive form organism that handles all personal information, 
birth details, education, and employment information for residents.

## Features
- **Personal Details**: PhilSys card number and basic personal info
- **Birth Information**: Birth date and place with PSGC integration
- **Education**: Educational attainment and graduation status
- **Employment**: Employment status and occupation with PSOC integration
- **Search Integration**: Built-in search for birth places and occupations
- **Validation**: Comprehensive error handling and field validation
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      description: 'Form data object containing all field values',
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
  philsysCardNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  extensionName: '',
  sex: '',
  civilStatus: '',
  citizenship: '',
  birthdate: '',
  birthPlaceName: '',
  birthPlaceCode: '',
  educationAttainment: '',
  isGraduate: false,
  employmentStatus: '',
  psocCode: '',
  occupationTitle: '',
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
      ...sampleFormData,
      philsysCardNumber: '1234-5678-9012',
      firstName: 'Juan',
      middleName: 'Santos',
      lastName: 'Dela Cruz',
      sex: 'male',
      civilStatus: 'single',
      citizenship: 'filipino',
      birthdate: '1990-01-15',
      birthPlaceName: 'Manila City, Metro Manila, NCR',
      birthPlaceCode: '1380000000',
      educationAttainment: 'college_graduate',
      isGraduate: true,
      employmentStatus: 'employed',
      occupationTitle: 'Software Developer',
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
      philsysCardNumber: 'PhilSys card number is required',
      birthdate: 'Birth date is required',
      birthPlaceName: 'Birth place is required',
      educationAttainment: 'Education level is required',
    },
  },
};
