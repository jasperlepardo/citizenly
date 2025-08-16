import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { VotingInformation, VotingInformationData } from './VotingInformation';

const meta = {
  title: 'Organisms/Form/Resident/PhysicalPersonalDetails/FormField/VotingInformation',
  component: VotingInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form section for collecting voting registration and participation information. Features conditional fields that show the last voted year when the resident is registered as a voter.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for voting information',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when any field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for each field',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof VotingInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: VotingInformationData = {
  isVoter: null,
  isResidentVoter: null,
  lastVotedDate: '',
};

// Sample voter data
const registeredVoterData: VotingInformationData = {
  isVoter: true,
  isResidentVoter: true,
  lastVotedDate: '2024',
};

// Non-voter data
const nonVoterData: VotingInformationData = {
  isVoter: false,
  isResidentVoter: false,
  lastVotedDate: '',
};

// Partial voter data
const partialVoterData: VotingInformationData = {
  isVoter: true,
  isResidentVoter: false,
  lastVotedDate: '2022',
};

// Basic Examples
export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
  },
};

export const RegisteredVoter: Story = {
  args: {
    value: registeredVoterData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a resident who is both a registered voter and resident voter.',
      },
    },
  },
};

export const NonVoter: Story = {
  args: {
    value: nonVoterData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a resident who is not registered to vote.',
      },
    },
  },
};

export const PartialVoter: Story = {
  args: {
    value: partialVoterData,
    onChange: () => {},
    errors: {},
  },
  parameters: {
    docs: {
      description: {
        story: 'Form for a registered voter who is not a resident voter (votes elsewhere).',
      },
    },
  },
};

// Validation Examples
export const WithValidationErrors: Story = {
  args: {
    value: {
      isVoter: true,
      isResidentVoter: true,
      lastVotedDate: '',
    },
    onChange: () => {},
    errors: {
      lastVotedDate: 'Last voted year is required for registered voters',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation error when last voted year is missing for a voter.',
      },
    },
  },
};

export const InvalidYearError: Story = {
  args: {
    value: {
      isVoter: true,
      isResidentVoter: true,
      lastVotedDate: '2030',
    },
    onChange: () => {},
    errors: {
      lastVotedDate: 'Last voted year cannot be in the future',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation error for invalid (future) year.',
      },
    },
  },
};

export const OldYearError: Story = {
  args: {
    value: {
      isVoter: true,
      isResidentVoter: false,
      lastVotedDate: '1800',
    },
    onChange: () => {},
    errors: {
      lastVotedDate: 'Please enter a valid year',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation error for unreasonably old year.',
      },
    },
  },
};

// Different Voting Scenarios
export const VotingScenarios: Story = {
  render: () => {
    const [currentScenario, setCurrentScenario] = useState(0);
    
    const scenarios = [
      {
        label: 'Not Registered',
        data: { isVoter: false, isResidentVoter: false, lastVotedDate: '' },
        description: 'Resident who is not registered to vote',
      },
      {
        label: 'First Time Voter',
        data: { isVoter: true, isResidentVoter: true, lastVotedDate: '2024' },
        description: 'Recently registered voter who voted for the first time',
      },
      {
        label: 'Regular Voter',
        data: { isVoter: true, isResidentVoter: true, lastVotedDate: '2022' },
        description: 'Regular voter who participated in previous elections',
      },
      {
        label: 'Inactive Voter',
        data: { isVoter: true, isResidentVoter: true, lastVotedDate: '2016' },
        description: 'Registered but has not voted recently',
      },
      {
        label: 'Non-Resident Voter',
        data: { isVoter: true, isResidentVoter: false, lastVotedDate: '2022' },
        description: 'Registered voter but votes in a different location',
      },
      {
        label: 'Resident Non-Voter',
        data: { isVoter: false, isResidentVoter: true, lastVotedDate: '' },
        description: 'Lives here but not registered (unusual case)',
      },
    ];

    const currentData = scenarios[currentScenario];

    return (
      <div className="space-y-6">
        <VotingInformation
          value={currentData.data}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {scenarios.map((scenario, index) => (
              <button
                key={scenario.label}
                onClick={() => setCurrentScenario(index)}
                className={`rounded px-3 py-1 text-sm ${
                  currentScenario === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>
          
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">{currentData.label}</h4>
            <p className="mt-1 text-sm text-gray-600">{currentData.description}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Registered Voter:</strong> {currentData.data.isVoter === true ? 'Yes' : currentData.data.isVoter === false ? 'No' : 'Not specified'}</p>
              <p><strong>Resident Voter:</strong> {currentData.data.isResidentVoter === true ? 'Yes' : currentData.data.isResidentVoter === false ? 'No' : 'Not specified'}</p>
              <p><strong>Last Voted:</strong> {currentData.data.lastVotedDate || 'Not specified'}</p>
            </div>
          </div>
        </div>
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

// Interactive Example
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<VotingInformationData>(emptyData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (newValue: VotingInformationData) => {
      setValue(newValue);
      
      // Clear last voted date if user becomes non-voter
      if ((newValue.isVoter === false && newValue.isResidentVoter === false) && value.lastVotedDate) {
        const updatedValue = { ...newValue, lastVotedDate: '' };
        setValue(updatedValue);
      }
      
      // Clear errors when fields are updated
      const newErrors = { ...errors };
      if (newValue.lastVotedDate && errors.lastVotedDate) {
        delete newErrors.lastVotedDate;
      }
      setErrors(newErrors);
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};
      const currentYear = new Date().getFullYear();
      
      // Require last voted year if either voter status is true
      if ((value.isVoter === true || value.isResidentVoter === true)) {
        if (!value.lastVotedDate) {
          newErrors.lastVotedDate = 'Last voted year is required for registered voters';
        } else {
          const year = Number(value.lastVotedDate);
          if (isNaN(year) || year < 1900 || year > currentYear) {
            newErrors.lastVotedDate = `Please enter a valid year between 1900 and ${currentYear}`;
          }
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const fillRegisteredVoter = () => {
      setValue(registeredVoterData);
      setErrors({});
    };

    const fillNonVoter = () => {
      setValue(nonVoterData);
      setErrors({});
    };

    const reset = () => {
      setValue(emptyData);
      setErrors({});
    };

    const showLastVotedField = value.isVoter === true || value.isResidentVoter === true;

    return (
      <div className="space-y-6">
        <VotingInformation
          value={value}
          onChange={handleChange}
          errors={errors}
        />
        
        <div className="flex space-x-4">
          <button
            onClick={validate}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Validate
          </button>
          <button
            onClick={fillRegisteredVoter}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Registered Voter
          </button>
          <button
            onClick={fillNonVoter}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Non-Voter
          </button>
          <button
            onClick={reset}
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="rounded bg-gray-100 p-4">
            <h4 className="font-medium">Current State:</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p><strong>Shows Last Voted Field:</strong> {showLastVotedField ? 'Yes' : 'No'}</p>
              <p><strong>Registered Voter:</strong> {value.isVoter === true ? 'Yes' : value.isVoter === false ? 'No' : 'Not specified'}</p>
              <p><strong>Resident Voter:</strong> {value.isResidentVoter === true ? 'Yes' : value.isResidentVoter === false ? 'No' : 'Not specified'}</p>
              <p><strong>Last Voted:</strong> {value.lastVotedDate || 'Not specified'}</p>
            </div>
          </div>
          
          {Object.keys(errors).length > 0 && (
            <div className="rounded bg-red-100 p-4">
              <h4 className="font-medium text-red-800">Validation Errors:</h4>
              <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive form with conditional field display and validation.',
      },
    },
  },
};

// Election Years Example
export const ElectionYears: Story = {
  render: () => {
    const [selectedYear, setSelectedYear] = useState('2024');
    
    const recentElections = [
      { year: '2024', type: 'Barangay & SK Elections' },
      { year: '2022', type: 'National & Local Elections' },
      { year: '2019', type: 'Midterm Elections' },
      { year: '2018', type: 'Barangay & SK Elections' },
      { year: '2016', type: 'National & Local Elections' },
      { year: '2013', type: 'Midterm Elections' },
    ];

    const currentData = {
      isVoter: true,
      isResidentVoter: true,
      lastVotedDate: selectedYear,
    };

    return (
      <div className="space-y-6">
        <VotingInformation
          value={currentData}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <h4 className="font-medium">Recent Philippine Elections:</h4>
          <div className="space-y-2">
            {recentElections.map((election) => (
              <button
                key={election.year}
                onClick={() => setSelectedYear(election.year)}
                className={`block w-full rounded border p-3 text-left text-sm ${
                  selectedYear === election.year
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{election.year}</div>
                <div className="text-gray-600">{election.type}</div>
              </button>
            ))}
          </div>
          
          <div className="rounded bg-blue-50 p-4">
            <h5 className="font-medium">Selected Election</h5>
            <p className="text-sm text-gray-600">
              {recentElections.find(e => e.year === selectedYear)?.type || 'Unknown election'}
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with examples of recent Philippine election years.',
      },
    },
  },
};

// Age and Voting Eligibility
export const VotingEligibility: Story = {
  render: () => {
    const [currentAge, setCurrentAge] = useState(25);
    
    const ageGroups = [
      { age: 17, eligible: false, description: 'Too young to vote' },
      { age: 18, eligible: true, description: 'Newly eligible voter' },
      { age: 25, eligible: true, description: 'Young adult voter' },
      { age: 35, eligible: true, description: 'Adult voter' },
      { age: 50, eligible: true, description: 'Middle-aged voter' },
      { age: 65, eligible: true, description: 'Senior voter' },
    ];

    const currentGroup = ageGroups.find(group => group.age === currentAge);
    const voterData = currentGroup?.eligible 
      ? { isVoter: true, isResidentVoter: true, lastVotedDate: '2022' }
      : { isVoter: false, isResidentVoter: false, lastVotedDate: '' };

    return (
      <div className="space-y-6">
        <VotingInformation
          value={voterData}
          onChange={() => {}}
          errors={{}}
        />
        
        <div className="space-y-4">
          <h4 className="font-medium">Voting Eligibility by Age:</h4>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((group) => (
              <button
                key={group.age}
                onClick={() => setCurrentAge(group.age)}
                className={`rounded px-3 py-1 text-sm ${
                  currentAge === group.age
                    ? group.eligible 
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Age {group.age}
              </button>
            ))}
          </div>
          
          {currentGroup && (
            <div className={`rounded p-4 ${
              currentGroup.eligible ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <h5 className="font-medium">Age {currentGroup.age}</h5>
              <p className={`text-sm ${
                currentGroup.eligible ? 'text-green-700' : 'text-red-700'
              }`}>
                {currentGroup.description}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentGroup.eligible 
                  ? 'Eligible to register and vote in Philippine elections'
                  : 'Must be at least 18 years old to vote'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing voting eligibility based on different age groups.',
      },
    },
  },
};