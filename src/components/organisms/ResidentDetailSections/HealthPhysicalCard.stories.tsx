import type { Meta, StoryObj } from '@storybook/react';
import HealthPhysicalCard from './HealthPhysicalCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/HealthPhysicalCard',
  component: HealthPhysicalCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive card component that displays physical characteristics, health information, citizenship details, voting status, and family information for a resident. Used in resident detail views.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resident: {
      control: { type: 'object' },
      description: 'Resident data object containing health, physical, and personal information',
    },
  },
} satisfies Meta<typeof HealthPhysicalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample resident with complete health and physical data
const sampleResident = {
  blood_type: 'O+',
  complexion: 'Medium',
  height: 170,
  weight: 65,
  citizenship: 'Filipino',
  ethnicity: 'Tagalog',
  religion: 'Roman Catholic',
  is_voter: true,
  is_resident_voter: true,
  last_voted_date: '2024',
  mother_maiden_first: 'Maria',
  mother_maiden_middle: 'Santos',
  mother_maiden_last: 'Reyes',
};

// Male resident data
const maleResident = {
  blood_type: 'A+',
  complexion: 'Dark',
  height: 175,
  weight: 70,
  citizenship: 'Filipino',
  ethnicity: 'Cebuano',
  religion: 'Roman Catholic',
  is_voter: true,
  is_resident_voter: false,
  last_voted_date: '2022',
  mother_maiden_first: 'Carmen',
  mother_maiden_middle: 'Luz',
  mother_maiden_last: 'Garcia',
};

// Female resident data
const femaleResident = {
  blood_type: 'B+',
  complexion: 'Fair',
  height: 160,
  weight: 55,
  citizenship: 'Filipino',
  ethnicity: 'Ilocano',
  religion: 'Protestant',
  is_voter: true,
  is_resident_voter: true,
  last_voted_date: '2024',
  mother_maiden_first: 'Rosa',
  mother_maiden_middle: 'Isabel',
  mother_maiden_last: 'Cruz',
};

// Non-voter resident
const nonVoterResident = {
  blood_type: 'AB+',
  complexion: 'Medium',
  height: 165,
  weight: 60,
  citizenship: 'Filipino',
  ethnicity: 'Bisaya',
  religion: 'Roman Catholic',
  is_voter: false,
  is_resident_voter: false,
  last_voted_date: '',
  mother_maiden_first: 'Ana',
  mother_maiden_middle: 'Teresa',
  mother_maiden_last: 'Mendoza',
};

// Minimal data resident
const minimalResident = {
  blood_type: '',
  complexion: 'Fair',
  height: undefined,
  weight: undefined,
  citizenship: 'Filipino',
  ethnicity: '',
  religion: '',
  is_voter: undefined,
  is_resident_voter: undefined,
  last_voted_date: '',
  mother_maiden_first: '',
  mother_maiden_middle: '',
  mother_maiden_last: '',
};

// Basic Examples
export const Default: Story = {
  args: {
    resident: sampleResident,
  },
};

export const MaleResident: Story = {
  args: {
    resident: maleResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Health and physical card for a male resident with complete information.',
      },
    },
  },
};

export const FemaleResident: Story = {
  args: {
    resident: femaleResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Health and physical card for a female resident with complete information.',
      },
    },
  },
};

export const NonVoter: Story = {
  args: {
    resident: nonVoterResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Health and physical card for a resident who is not registered to vote.',
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    resident: minimalResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Health and physical card with minimal information available.',
      },
    },
  },
};

// Blood Type Variations
export const BloodTypeVariations: Story = {
  render: () => {
    const bloodTypes = [
      { type: 'A+', label: 'A Positive' },
      { type: 'A-', label: 'A Negative' },
      { type: 'B+', label: 'B Positive' },
      { type: 'B-', label: 'B Negative' },
      { type: 'AB+', label: 'AB Positive' },
      { type: 'AB-', label: 'AB Negative' },
      { type: 'O+', label: 'O Positive' },
      { type: 'O-', label: 'O Negative' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Blood Types</h3>
        <div className="grid gap-4">
          {bloodTypes.map((bloodType, index) => {
            const resident = { ...sampleResident, blood_type: bloodType.type };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  Blood Type: {bloodType.type} ({bloodType.label})
                </h4>
                <HealthPhysicalCard resident={resident} />
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
        story: 'Examples showing all possible blood type variations.',
      },
    },
  },
};

// Physical Characteristics Examples
export const PhysicalCharacteristics: Story = {
  render: () => {
    const physicalTypes = [
      {
        label: 'Tall & Athletic',
        resident: { ...sampleResident, height: 185, weight: 80, complexion: 'Medium' },
      },
      {
        label: 'Average Build',
        resident: { ...sampleResident, height: 170, weight: 65, complexion: 'Medium' },
      },
      {
        label: 'Petite',
        resident: { ...sampleResident, height: 155, weight: 50, complexion: 'Fair' },
      },
      {
        label: 'Heavy Set',
        resident: { ...sampleResident, height: 165, weight: 90, complexion: 'Dark' },
      },
      {
        label: 'Very Tall',
        resident: { ...sampleResident, height: 195, weight: 85, complexion: 'Fair' },
      },
      {
        label: 'No Physical Data',
        resident: { ...sampleResident, height: undefined, weight: undefined, complexion: '' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Physical Characteristics Examples</h3>
        <div className="grid gap-4">
          {physicalTypes.map((type, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {type.label} 
                {type.resident.height && type.resident.weight && 
                  ` (${type.resident.height}cm, ${type.resident.weight}kg)`
                }
              </h4>
              <HealthPhysicalCard resident={type.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different physical characteristics and body types.',
      },
    },
  },
};

// Ethnicity Examples
export const EthnicityExamples: Story = {
  render: () => {
    const ethnicities = [
      { value: 'Tagalog', description: 'Most common in Manila and surrounding areas' },
      { value: 'Cebuano', description: 'Common in Cebu and Visayas region' },
      { value: 'Ilocano', description: 'Common in Northern Luzon' },
      { value: 'Bisaya', description: 'Common in Central and Southern Philippines' },
      { value: 'Kapampangan', description: 'Common in Central Luzon' },
      { value: 'Pangasinan', description: 'Common in Northwestern Luzon' },
      { value: 'Bikol', description: 'Common in Bicol region' },
      { value: 'Waray', description: 'Common in Eastern Visayas' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Philippine Ethnicities</h3>
        <div className="grid gap-4">
          {ethnicities.map((ethnicity, index) => {
            const resident = { ...sampleResident, ethnicity: ethnicity.value };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  {ethnicity.value}
                </h4>
                <p className="mb-2 text-xs text-gray-500">{ethnicity.description}</p>
                <HealthPhysicalCard resident={resident} />
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
        story: 'Examples showing different Philippine ethnicities and their regions.',
      },
    },
  },
};

// Religion Examples
export const ReligionExamples: Story = {
  render: () => {
    const religions = [
      { name: 'Roman Catholic', percentage: '~80% of population' },
      { name: 'Protestant', percentage: '~10% of population' },
      { name: 'Islam', percentage: '~5% of population' },
      { name: 'Iglesia ni Cristo', percentage: '~3% of population' },
      { name: 'Buddhism', percentage: 'Small percentage' },
      { name: 'Other Christian', percentage: 'Various denominations' },
      { name: 'No Religion', percentage: 'Non-religious' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Religious Affiliations in Philippines</h3>
        <div className="grid gap-4">
          {religions.map((religion, index) => {
            const resident = { ...sampleResident, religion: religion.name };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  {religion.name}
                </h4>
                <p className="mb-2 text-xs text-gray-500">{religion.percentage}</p>
                <HealthPhysicalCard resident={resident} />
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
        story: 'Examples showing different religious affiliations in the Philippines.',
      },
    },
  },
};

// Voting Status Combinations
export const VotingStatusCombinations: Story = {
  render: () => {
    const votingStatuses = [
      {
        label: 'Active Local Voter',
        resident: { ...sampleResident, is_voter: true, is_resident_voter: true, last_voted_date: '2024' },
        description: 'Registered and votes in this barangay',
      },
      {
        label: 'Registered Non-Resident',
        resident: { ...sampleResident, is_voter: true, is_resident_voter: false, last_voted_date: '2022' },
        description: 'Registered but votes elsewhere',
      },
      {
        label: 'Not Registered',
        resident: { ...sampleResident, is_voter: false, is_resident_voter: false, last_voted_date: '' },
        description: 'Not registered to vote',
      },
      {
        label: 'Inactive Voter',
        resident: { ...sampleResident, is_voter: true, is_resident_voter: true, last_voted_date: '2016' },
        description: 'Registered but hasn\'t voted recently',
      },
      {
        label: 'Unknown Status',
        resident: { ...sampleResident, is_voter: undefined, is_resident_voter: undefined, last_voted_date: '' },
        description: 'Voting status not specified',
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Voting Status Combinations</h3>
        <div className="grid gap-4">
          {votingStatuses.map((status, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {status.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{status.description}</p>
              <HealthPhysicalCard resident={status.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different voting registration and participation status combinations.',
      },
    },
  },
};

// Complexion Examples
export const ComplexionExamples: Story = {
  render: () => {
    const complexions = [
      { type: 'Fair', description: 'Light skin tone' },
      { type: 'Medium', description: 'Moderate skin tone' },
      { type: 'Dark', description: 'Darker skin tone' },
      { type: 'Light Brown', description: 'Light brown complexion' },
      { type: 'Brown', description: 'Brown complexion' },
      { type: 'Tan', description: 'Tanned complexion' },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Complexion Types</h3>
        <div className="grid gap-4">
          {complexions.map((complexion, index) => {
            const resident = { ...sampleResident, complexion: complexion.type };
            return (
              <div key={index}>
                <h4 className="mb-2 text-sm font-medium text-gray-600">
                  {complexion.type}
                </h4>
                <p className="mb-2 text-xs text-gray-500">{complexion.description}</p>
                <HealthPhysicalCard resident={resident} />
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
        story: 'Examples showing different complexion types and descriptions.',
      },
    },
  },
};

// Citizenship Examples
export const CitizenshipExamples: Story = {
  render: () => {
    const citizenshipTypes = [
      {
        type: 'Filipino',
        description: 'Natural-born Filipino citizen',
        resident: { ...sampleResident, citizenship: 'Filipino' },
      },
      {
        type: 'Naturalized Filipino',
        description: 'Naturalized Filipino citizen',
        resident: { ...sampleResident, citizenship: 'Naturalized Filipino' },
      },
      {
        type: 'Dual Citizen',
        description: 'Filipino with dual citizenship',
        resident: { ...sampleResident, citizenship: 'Dual Citizen' },
      },
      {
        type: 'Foreign National',
        description: 'Non-Filipino citizen resident',
        resident: { ...sampleResident, citizenship: 'American', is_voter: false, is_resident_voter: false },
      },
      {
        type: 'Stateless',
        description: 'Person without citizenship',
        resident: { ...sampleResident, citizenship: 'Stateless', is_voter: false, is_resident_voter: false },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Citizenship Types</h3>
        <div className="grid gap-4">
          {citizenshipTypes.map((citizenship, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {citizenship.type}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{citizenship.description}</p>
              <HealthPhysicalCard resident={citizenship.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different citizenship types and statuses.',
      },
    },
  },
};

// BMI Categories Example
export const BMICategories: Story = {
  render: () => {
    const bmiExamples = [
      {
        label: 'Underweight',
        resident: { ...sampleResident, height: 170, weight: 50 },
        bmi: '17.3',
      },
      {
        label: 'Normal Weight',
        resident: { ...sampleResident, height: 170, weight: 65 },
        bmi: '22.5',
      },
      {
        label: 'Overweight',
        resident: { ...sampleResident, height: 170, weight: 80 },
        bmi: '27.7',
      },
      {
        label: 'Obese',
        resident: { ...sampleResident, height: 170, weight: 95 },
        bmi: '32.9',
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">BMI Categories</h3>
        <div className="grid gap-4">
          {bmiExamples.map((example, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {example.label} (BMI: {example.bmi})
              </h4>
              <HealthPhysicalCard resident={example.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different BMI categories based on height and weight.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    resident: sampleResident,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Health and physical card in dark mode theme.',
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