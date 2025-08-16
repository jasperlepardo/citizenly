import type { Meta, StoryObj } from '@storybook/react';
import FamilyVoterCard from './FamilyVoterCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/FamilyVoterCard',
  component: FamilyVoterCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A dual-card component that displays family information (mother\'s maiden name) and voter registration details. Features a responsive two-column layout that shows both sections side by side.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resident: {
      control: { type: 'object' },
      description: 'Resident data object containing family and voter information',
    },
    formatDate: {
      action: 'formatDate',
      description: 'Function to format date strings',
    },
  },
} satisfies Meta<typeof FamilyVoterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock utility function
const mockFormatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Sample resident with complete family and voter data
const sampleResident = {
  mother_maiden_first: 'Maria',
  mother_maiden_middle: 'Santos',
  mother_maiden_last: 'Reyes',
  is_voter: true,
  is_resident_voter: true,
  last_voted_date: '2024-05-13',
};

// Registered voter, non-resident
const nonResidentVoter = {
  mother_maiden_first: 'Carmen',
  mother_maiden_middle: 'Luz',
  mother_maiden_last: 'Garcia',
  is_voter: true,
  is_resident_voter: false,
  last_voted_date: '2022-05-09',
};

// Non-voter resident
const nonVoterResident = {
  mother_maiden_first: 'Rosa',
  mother_maiden_middle: 'Isabel',
  mother_maiden_last: 'Cruz',
  is_voter: false,
  is_resident_voter: false,
  last_voted_date: '',
};

// Minimal family information
const minimalFamilyInfo = {
  mother_maiden_first: 'Ana',
  mother_maiden_middle: '',
  mother_maiden_last: 'Mendoza',
  is_voter: true,
  is_resident_voter: true,
  last_voted_date: '2024-05-13',
};

// No family information
const noFamilyInfo = {
  mother_maiden_first: '',
  mother_maiden_middle: '',
  mother_maiden_last: '',
  is_voter: true,
  is_resident_voter: false,
  last_voted_date: '2022-05-09',
};

// Basic Examples
export const Default: Story = {
  args: {
    resident: sampleResident,
    formatDate: mockFormatDate,
  },
};

export const NonResidentVoter: Story = {
  args: {
    resident: nonResidentVoter,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident who is registered to vote but votes in a different location.',
      },
    },
  },
};

export const NonVoter: Story = {
  args: {
    resident: nonVoterResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident who is not registered to vote.',
      },
    },
  },
};

export const MinimalFamilyInfo: Story = {
  args: {
    resident: minimalFamilyInfo,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident with minimal family information (no middle name).',
      },
    },
  },
};

export const NoFamilyInfo: Story = {
  args: {
    resident: noFamilyInfo,
    formatDate: mockFormatDate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident with no family information available.',
      },
    },
  },
};

// Different Voting Scenarios
export const VotingScenarios: Story = {
  render: () => {
    const scenarios = [
      {
        label: 'Active Local Voter',
        description: 'Registered and votes locally',
        resident: {
          mother_maiden_first: 'Maria',
          mother_maiden_middle: 'Santos',
          mother_maiden_last: 'Reyes',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'Registered Non-Resident',
        description: 'Votes in different location',
        resident: {
          mother_maiden_first: 'Carmen',
          mother_maiden_middle: 'Luz',
          mother_maiden_last: 'Garcia',
          is_voter: true,
          is_resident_voter: false,
          last_voted_date: '2022-05-09',
        },
      },
      {
        label: 'Not Registered',
        description: 'Not registered to vote',
        resident: {
          mother_maiden_first: 'Rosa',
          mother_maiden_middle: 'Isabel',
          mother_maiden_last: 'Cruz',
          is_voter: false,
          is_resident_voter: false,
          last_voted_date: '',
        },
      },
      {
        label: 'Inactive Voter',
        description: 'Registered but hasn\'t voted recently',
        resident: {
          mother_maiden_first: 'Ana',
          mother_maiden_middle: 'Teresa',
          mother_maiden_last: 'Villanueva',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2016-05-09',
        },
      },
      {
        label: 'First Time Voter',
        description: 'Recently registered and voted',
        resident: {
          mother_maiden_first: 'Isabella',
          mother_maiden_middle: 'Grace',
          mother_maiden_last: 'Fernandez',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
    ];

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Different Voting Scenarios</h3>
        {scenarios.map((scenario, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">
              {scenario.label} - {scenario.description}
            </h4>
            <FamilyVoterCard
              resident={scenario.resident}
              formatDate={mockFormatDate}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different voting scenarios and registration combinations.',
      },
    },
  },
};

// Mother's Maiden Name Variations
export const MotherMaidenNameVariations: Story = {
  render: () => {
    const nameVariations = [
      {
        label: 'Complete Name',
        resident: {
          mother_maiden_first: 'Maria Esperanza',
          mother_maiden_middle: 'De Los Santos',
          mother_maiden_last: 'Villanueva-Garcia',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'No Middle Name',
        resident: {
          mother_maiden_first: 'Carmen',
          mother_maiden_middle: '',
          mother_maiden_last: 'Cruz',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'Compound First Name',
        resident: {
          mother_maiden_first: 'Ana Maria',
          mother_maiden_middle: 'Santos',
          mother_maiden_last: 'Reyes',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'Hyphenated Last Name',
        resident: {
          mother_maiden_first: 'Rosa',
          mother_maiden_middle: 'Luz',
          mother_maiden_last: 'Santos-Mendoza',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'Single Name Parts',
        resident: {
          mother_maiden_first: 'Teresita',
          mother_maiden_middle: '',
          mother_maiden_last: 'Garcia',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
      {
        label: 'No Name Information',
        resident: {
          mother_maiden_first: '',
          mother_maiden_middle: '',
          mother_maiden_last: '',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
      },
    ];

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Mother's Maiden Name Variations</h3>
        {nameVariations.map((variation, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">
              {variation.label}
            </h4>
            <FamilyVoterCard
              resident={variation.resident}
              formatDate={mockFormatDate}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different mother\'s maiden name formats and variations.',
      },
    },
  },
};

// Election History Examples
export const ElectionHistory: Story = {
  render: () => {
    const electionHistory = [
      {
        label: '2024 Elections',
        date: '2024-05-13',
        description: 'Most recent Barangay & SK Elections',
      },
      {
        label: '2022 Elections',
        date: '2022-05-09',
        description: 'National & Local Elections',
      },
      {
        label: '2019 Elections',
        date: '2019-05-13',
        description: 'Midterm Elections',
      },
      {
        label: '2018 Elections',
        date: '2018-05-14',
        description: 'Barangay & SK Elections',
      },
      {
        label: '2016 Elections',
        date: '2016-05-09',
        description: 'National & Local Elections',
      },
      {
        label: 'Never Voted',
        date: '',
        description: 'No voting history',
      },
    ];

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Different Election Years</h3>
        {electionHistory.map((election, index) => {
          const resident = {
            mother_maiden_first: 'Maria',
            mother_maiden_middle: 'Santos',
            mother_maiden_last: 'Reyes',
            is_voter: election.date ? true : false,
            is_resident_voter: election.date ? true : false,
            last_voted_date: election.date,
          };

          return (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">
                {election.label} - {election.description}
              </h4>
              <FamilyVoterCard
                resident={resident}
                formatDate={mockFormatDate}
              />
            </div>
          );
        })}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different Philippine election years and voting history.',
      },
    },
  },
};

// Age-Based Voting Patterns
export const AgeBasedVotingPatterns: Story = {
  render: () => {
    const agePatterns = [
      {
        label: 'Young Adult (First Time Voter)',
        resident: {
          mother_maiden_first: 'Isabella',
          mother_maiden_middle: 'Grace',
          mother_maiden_last: 'Fernandez',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
        description: 'Recently eligible, active voter',
      },
      {
        label: 'Adult (Regular Voter)',
        resident: {
          mother_maiden_first: 'Maria',
          mother_maiden_middle: 'Santos',
          mother_maiden_last: 'Reyes',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2022-05-09',
        },
        description: 'Established voting pattern',
      },
      {
        label: 'Middle-aged (Consistent Voter)',
        resident: {
          mother_maiden_first: 'Carmen',
          mother_maiden_middle: 'Luz',
          mother_maiden_last: 'Garcia',
          is_voter: true,
          is_resident_voter: false,
          last_voted_date: '2022-05-09',
        },
        description: 'Votes in hometown/original registration',
      },
      {
        label: 'Senior (Traditional Voter)',
        resident: {
          mother_maiden_first: 'Esperanza',
          mother_maiden_middle: 'Angeles',
          mother_maiden_last: 'Cruz',
          is_voter: true,
          is_resident_voter: true,
          last_voted_date: '2024-05-13',
        },
        description: 'Long-term resident voter',
      },
      {
        label: 'Non-Voter (Various Reasons)',
        resident: {
          mother_maiden_first: 'Rosa',
          mother_maiden_middle: 'Isabel',
          mother_maiden_last: 'Mendoza',
          is_voter: false,
          is_resident_voter: false,
          last_voted_date: '',
        },
        description: 'Not registered or ineligible',
      },
    ];

    return (
      <div className="space-y-8">
        <h3 className="text-lg font-semibold">Age-Based Voting Patterns</h3>
        {agePatterns.map((pattern, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">
              {pattern.label}
            </h4>
            <p className="text-xs text-gray-500 mb-2">{pattern.description}</p>
            <FamilyVoterCard
              resident={pattern.resident}
              formatDate={mockFormatDate}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Voting patterns typical of different age groups and life stages.',
      },
    },
  },
};

// Cultural Context Example
export const CulturalContext: Story = {
  args: {
    resident: sampleResident,
    formatDate: mockFormatDate,
  },
  render: (args) => (
    <div className="space-y-6">
      <FamilyVoterCard {...args} />
      
      <div className="rounded bg-blue-50 p-4">
        <h4 className="font-medium">Cultural Context - Philippine Family & Voting</h4>
        <div className="mt-2 space-y-2 text-sm">
          <p><strong>Mother's Maiden Name:</strong> Essential for identity verification in Philippine documents. Used in birth certificates, passports, and official records.</p>
          <p><strong>Voter Registration:</strong> Citizens 18+ can register. "Resident Voter" means they vote in this barangay, while "Registered Voter" may vote elsewhere.</p>
          <p><strong>Election Dates:</strong> Philippines holds elections every 3 years alternating between national/local (May 2nd Monday) and barangay/SK elections.</p>
          <p><strong>Importance:</strong> Both pieces of information are crucial for resident verification and civic participation tracking.</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Family and voter card with cultural context for Philippine governance.',
      },
    },
  },
};

// Responsive Layout Example
export const ResponsiveLayout: Story = {
  args: {
    resident: sampleResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Family and voter card on mobile device showing responsive layout.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    resident: sampleResident,
    formatDate: mockFormatDate,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Family and voter card in dark mode theme.',
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