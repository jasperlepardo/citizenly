import type { Meta, StoryObj } from '@storybook/react';
import PersonalInfoCard from './PersonalInfoCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/PersonalInfoCard',
  component: PersonalInfoCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component that displays personal information for a resident including name, birthdate, civil status, education, and employment details. Used in resident detail views.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resident: {
      control: { type: 'object' },
      description: 'Resident data object containing personal information',
    },
    formatFullName: {
      action: 'formatFullName',
      description: 'Function to format full name from resident data',
    },
    formatDate: {
      action: 'formatDate',
      description: 'Function to format date strings',
    },
    calculateAge: {
      action: 'calculateAge',
      description: 'Function to calculate age from birthdate',
    },
  },
} satisfies Meta<typeof PersonalInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock utility functions
const mockFormatFullName = (resident: any) => {
  const parts = [resident.first_name, resident.middle_name, resident.last_name, resident.extension_name];
  return parts.filter(Boolean).join(' ');
};

const mockFormatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const mockCalculateAge = (birthdate: string) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Sample resident data
const sampleResident = {
  philsys_card_number: '1234-5678-9012',
  first_name: 'Juan',
  middle_name: 'Santos',
  last_name: 'Dela Cruz',
  extension_name: 'Jr.',
  sex: 'male' as const,
  birthdate: '1990-05-15',
  civil_status: 'Married',
  citizenship: 'Filipino',
  birth_place_name: 'Manila, Philippines',
  education_attainment: 'Bachelor\'s Degree',
  is_graduate: true,
  employment_status: 'Employed',
  occupation_title: 'Software Engineer',
};

// Female resident data
const femaleResident = {
  philsys_card_number: '9876-5432-1098',
  first_name: 'Maria',
  middle_name: 'Luz',
  last_name: 'Santos',
  extension_name: '',
  sex: 'female' as const,
  birthdate: '1985-12-22',
  civil_status: 'Single',
  citizenship: 'Filipino',
  birth_place_name: 'Cebu City, Philippines',
  education_attainment: 'Master\'s Degree',
  is_graduate: true,
  employment_status: 'Employed',
  occupation_title: 'Teacher',
};

// Minimal data resident
const minimalResident = {
  first_name: 'Pedro',
  middle_name: '',
  last_name: 'Garcia',
  extension_name: '',
  sex: 'male' as const,
  birthdate: '2000-01-01',
  civil_status: 'Single',
};

// Senior citizen resident
const seniorResident = {
  philsys_card_number: '1111-2222-3333',
  first_name: 'Carmen',
  middle_name: 'Esperanza',
  last_name: 'Reyes',
  extension_name: '',
  sex: 'female' as const,
  birthdate: '1955-08-10',
  civil_status: 'Widowed',
  citizenship: 'Filipino',
  birth_place_name: 'Davao City, Philippines',
  education_attainment: 'High School Graduate',
  is_graduate: true,
  employment_status: 'Retired',
  occupation_title: 'Former Nurse',
};

// Young adult resident
const youngAdultResident = {
  philsys_card_number: '4444-5555-6666',
  first_name: 'Carlos',
  middle_name: 'Antonio',
  last_name: 'Mendoza',
  extension_name: '',
  sex: 'male' as const,
  birthdate: '2002-03-18',
  civil_status: 'Single',
  citizenship: 'Filipino',
  birth_place_name: 'Quezon City, Philippines',
  education_attainment: 'Currently Studying',
  is_graduate: false,
  employment_status: 'Student',
  occupation_title: 'College Student',
};

// Basic Examples
export const Default: Story = {
  args: {
    resident: sampleResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
};

export const FemaleResident: Story = {
  args: {
    resident: femaleResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information card for a female resident with complete data.',
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    resident: minimalResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information card with minimal required data only.',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  args: {
    resident: seniorResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information card for a senior citizen resident.',
      },
    },
  },
};

export const YoungAdult: Story = {
  args: {
    resident: youngAdultResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information card for a young adult resident still studying.',
      },
    },
  },
};

// Different Civil Status Examples
export const CivilStatusExamples: Story = {
  render: () => {
    const civilStatusExamples = [
      { ...sampleResident, civil_status: 'Single' },
      { ...sampleResident, civil_status: 'Married' },
      { ...sampleResident, civil_status: 'Widowed' },
      { ...sampleResident, civil_status: 'Divorced' },
      { ...sampleResident, civil_status: 'Separated' },
      { ...sampleResident, civil_status: 'Live-in' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Civil Status Examples</h3>
        <div className="grid gap-4">
          {civilStatusExamples.map((resident, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Civil Status: {resident.civil_status}
              </h4>
              <PersonalInfoCard
                resident={resident}
                formatFullName={mockFormatFullName}
                formatDate={mockFormatDate}
                calculateAge={mockCalculateAge}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different civil status options.',
      },
    },
  },
};

// Education Level Examples
export const EducationLevelExamples: Story = {
  render: () => {
    const educationExamples = [
      { ...sampleResident, education_attainment: 'Elementary Graduate', is_graduate: true },
      { ...sampleResident, education_attainment: 'High School Graduate', is_graduate: true },
      { ...sampleResident, education_attainment: 'Vocational Graduate', is_graduate: true },
      { ...sampleResident, education_attainment: 'Bachelor\'s Degree', is_graduate: true },
      { ...sampleResident, education_attainment: 'Master\'s Degree', is_graduate: true },
      { ...sampleResident, education_attainment: 'Doctorate Degree', is_graduate: true },
      { ...sampleResident, education_attainment: 'Currently Studying', is_graduate: false },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Education Levels</h3>
        <div className="grid gap-4">
          {educationExamples.map((resident, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Education: {resident.education_attainment} ({resident.is_graduate ? 'Graduate' : 'Not Graduate'})
              </h4>
              <PersonalInfoCard
                resident={resident}
                formatFullName={mockFormatFullName}
                formatDate={mockFormatDate}
                calculateAge={mockCalculateAge}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different education levels and graduation status.',
      },
    },
  },
};

// Employment Status Examples
export const EmploymentStatusExamples: Story = {
  render: () => {
    const employmentExamples = [
      { ...sampleResident, employment_status: 'Employed', occupation_title: 'Software Engineer' },
      { ...sampleResident, employment_status: 'Self-Employed', occupation_title: 'Business Owner' },
      { ...sampleResident, employment_status: 'Unemployed', occupation_title: '' },
      { ...sampleResident, employment_status: 'Student', occupation_title: 'College Student' },
      { ...sampleResident, employment_status: 'Retired', occupation_title: 'Former Teacher' },
      { ...sampleResident, employment_status: 'Homemaker', occupation_title: 'Housewife' },
      { ...sampleResident, employment_status: 'OFW', occupation_title: 'Overseas Worker' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Employment Status</h3>
        <div className="grid gap-4">
          {employmentExamples.map((resident, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                Employment: {resident.employment_status} - {resident.occupation_title || 'No occupation'}
              </h4>
              <PersonalInfoCard
                resident={resident}
                formatFullName={mockFormatFullName}
                formatDate={mockFormatDate}
                calculateAge={mockCalculateAge}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different employment statuses and occupations.',
      },
    },
  },
};

// Age Groups Examples
export const AgeGroupExamples: Story = {
  render: () => {
    const currentYear = new Date().getFullYear();
    const ageGroups = [
      { label: 'Child (8 years)', birthdate: `${currentYear - 8}-06-15` },
      { label: 'Teenager (16 years)', birthdate: `${currentYear - 16}-06-15` },
      { label: 'Young Adult (22 years)', birthdate: `${currentYear - 22}-06-15` },
      { label: 'Adult (35 years)', birthdate: `${currentYear - 35}-06-15` },
      { label: 'Middle-aged (50 years)', birthdate: `${currentYear - 50}-06-15` },
      { label: 'Senior (70 years)', birthdate: `${currentYear - 70}-06-15` },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Age Groups</h3>
        <div className="grid gap-4">
          {ageGroups.map((group, index) => {
            const resident = { ...sampleResident, birthdate: group.birthdate };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  {group.label} (Age: {mockCalculateAge(group.birthdate)})
                </h4>
                <PersonalInfoCard
                  resident={resident}
                  formatFullName={mockFormatFullName}
                  formatDate={mockFormatDate}
                  calculateAge={mockCalculateAge}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing residents of different age groups.',
      },
    },
  },
};

// Name Variations Examples
export const NameVariationExamples: Story = {
  render: () => {
    const nameVariations = [
      {
        label: 'With Extension',
        resident: { ...sampleResident, extension_name: 'Jr.' },
      },
      {
        label: 'No Middle Name',
        resident: { ...sampleResident, middle_name: '' },
      },
      {
        label: 'Long Names',
        resident: {
          ...sampleResident,
          first_name: 'Maria Esperanza',
          middle_name: 'De Los Santos',
          last_name: 'Villanueva-Garcia',
          extension_name: 'Sr.',
        },
      },
      {
        label: 'Single Name Parts',
        resident: {
          ...sampleResident,
          first_name: 'Jose',
          middle_name: '',
          last_name: 'Cruz',
          extension_name: '',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Name Variation Examples</h3>
        <div className="grid gap-4">
          {nameVariations.map((variation, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {variation.label}: {mockFormatFullName(variation.resident)}
              </h4>
              <PersonalInfoCard
                resident={variation.resident}
                formatFullName={mockFormatFullName}
                formatDate={mockFormatDate}
                calculateAge={mockCalculateAge}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different name formats and variations.',
      },
    },
  },
};

// Without PhilSys Card
export const WithoutPhilSysCard: Story = {
  args: {
    resident: {
      ...sampleResident,
      philsys_card_number: undefined,
    },
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    docs: {
      description: {
        story: 'Personal information card for a resident without PhilSys card number.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    resident: sampleResident,
    formatFullName: mockFormatFullName,
    formatDate: mockFormatDate,
    calculateAge: mockCalculateAge,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Personal information card in dark mode theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};