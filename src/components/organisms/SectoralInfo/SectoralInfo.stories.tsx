import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import SectoralInfo, { SectoralInformation, SectoralContext } from './SectoralInfo';

const meta: Meta<typeof SectoralInfo> = {
  title: 'Organisms/SectoralInfo',
  component: SectoralInfo,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A specialized form component for managing sectoral group classifications according to RBI (Registry Book for Individuals) standards. This component automatically calculates certain sectoral flags based on demographic data while allowing manual entry for others. Key features include:

- **Auto-Calculation** - Labor force, employment, out-of-school, and senior citizen flags
- **Manual Flags** - OFW, PWD, solo parent, indigenous people, and migrant status
- **Age-Based Logic** - Automatic categorization based on birth date
- **Employment Integration** - Links with employment status for accurate classification
- **Education Context** - Considers education level for out-of-school determination
- **Conditional Logic** - Smart dependencies (e.g., registered senior citizen only if senior)
- **Real-time Updates** - Immediate recalculation when context changes

This component is crucial for generating accurate demographic reports and ensuring compliance with government statistical requirements.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current sectoral information flags',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback when sectoral information changes',
    },
    context: {
      description: 'Demographic context for auto-calculations',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSectoralInfo: SectoralInformation = {
  is_labor_force: false,
  is_employed: false,
  is_unemployed: false,
  is_ofw: false,
  is_pwd: false,
  is_out_of_school_children: false,
  is_out_of_school_youth: false,
  is_senior_citizen: false,
  is_registered_senior_citizen: false,
  is_solo_parent: false,
  is_indigenous_people: false,
  is_migrant: false,
};

const defaultContext: SectoralContext = {
  age: 0,
  birthdate: '',
  employment_status: '',
  highest_educational_attainment: '',
  marital_status: '',
};

export const Default: Story = {
  args: {
    value: defaultSectoralInfo,
    onChange: action('sectoral-changed'),
    context: defaultContext,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default sectoral information form with no demographic context.',
      },
    },
  },
};

export const EmployedAdult: Story = {
  args: {
    value: defaultSectoralInfo,
    onChange: action('sectoral-changed'),
    context: {
      age: 35,
      birthdate: '1988-06-15',
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
      marital_status: 'married',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Employed adult showing auto-calculated labor force and employment flags.',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_registered_senior_citizen: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 68,
      birthdate: '1955-03-22',
      employment_status: 'retired',
      highest_educational_attainment: 'high_school_graduate',
      marital_status: 'widowed',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Senior citizen with registered status and retirement.',
      },
    },
  },
};

export const OutOfSchoolYouth: Story = {
  args: {
    value: defaultSectoralInfo,
    onChange: action('sectoral-changed'),
    context: {
      age: 22,
      birthdate: '2001-09-10',
      employment_status: 'unemployed_looking',
      highest_educational_attainment: 'high_school_graduate',
      marital_status: 'single',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Out-of-school youth - 22 years old, high school graduate, unemployed.',
      },
    },
  },
};

export const OutOfSchoolChildren: Story = {
  args: {
    value: defaultSectoralInfo,
    onChange: action('sectoral-changed'),
    context: {
      age: 12,
      birthdate: '2011-04-18',
      employment_status: '',
      highest_educational_attainment: '',
      marital_status: 'single',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Out-of-school children - 12 years old, not in elementary school.',
      },
    },
  },
};

export const OFW: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_ofw: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 29,
      birthdate: '1994-11-05',
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
      marital_status: 'single',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Overseas Filipino Worker (OFW) - employed abroad.',
      },
    },
  },
};

export const PWDResident: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_pwd: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 42,
      birthdate: '1981-07-30',
      employment_status: 'unemployed_looking',
      highest_educational_attainment: 'college_graduate',
      marital_status: 'married',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Person with Disability (PWD) currently looking for work.',
      },
    },
  },
};

export const SoloParent: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_solo_parent: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 34,
      birthdate: '1989-12-08',
      employment_status: 'self_employed',
      highest_educational_attainment: 'high_school_graduate',
      marital_status: 'separated',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Solo parent - separated and self-employed.',
      },
    },
  },
};

export const IndigenousPeople: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_indigenous_people: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 45,
      birthdate: '1978-02-14',
      employment_status: 'self_employed',
      highest_educational_attainment: 'elementary_graduate',
      marital_status: 'married',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Indigenous people with traditional livelihood.',
      },
    },
  },
};

export const MigrantResident: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_migrant: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 28,
      birthdate: '1995-08-20',
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
      marital_status: 'married',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Recent migrant to the barangay for employment.',
      },
    },
  },
};

export const MultipleSectoralGroups: Story = {
  args: {
    value: {
      ...defaultSectoralInfo,
      is_pwd: true,
      is_solo_parent: true,
      is_migrant: true,
    },
    onChange: action('sectoral-changed'),
    context: {
      age: 38,
      birthdate: '1985-05-12',
      employment_status: 'underemployed',
      highest_educational_attainment: 'vocational_graduate',
      marital_status: 'separated',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Resident belonging to multiple sectoral groups - PWD, solo parent, and migrant.',
      },
    },
  },
};

export const InteractiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demonstration showing how auto-calculations work with changing context.',
      },
    },
  },
  render: () => {
    const [sectoralInfo, setSectoralInfo] =
      React.useState<SectoralInformation>(defaultSectoralInfo);
    const [context, setContext] = React.useState<SectoralContext>({
      age: 25,
      birthdate: '1998-06-15',
      employment_status: 'employed_full_time',
      highest_educational_attainment: 'college_graduate',
      marital_status: 'single',
    });

    const presetScenarios = [
      {
        name: 'Young Professional',
        context: {
          age: 25,
          birthdate: '1998-06-15',
          employment_status: 'employed_full_time',
          highest_educational_attainment: 'college_graduate',
          marital_status: 'single',
        },
      },
      {
        name: 'Senior Citizen',
        context: {
          age: 65,
          birthdate: '1958-06-15',
          employment_status: 'retired',
          highest_educational_attainment: 'high_school_graduate',
          marital_status: 'married',
        },
      },
      {
        name: 'Out-of-School Youth',
        context: {
          age: 20,
          birthdate: '2003-06-15',
          employment_status: 'unemployed_looking',
          highest_educational_attainment: 'high_school_graduate',
          marital_status: 'single',
        },
      },
      {
        name: 'Child (10 years old)',
        context: {
          age: 10,
          birthdate: '2013-06-15',
          employment_status: '',
          highest_educational_attainment: '',
          marital_status: 'single',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Context Controls</h3>
          <div className="grid grid-cols-1 gap-4 rounded border bg-gray-50 p-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                value={context.age || ''}
                onChange={e => setContext({ ...context, age: parseInt(e.target.value) || 0 })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Employment Status
              </label>
              <select
                value={context.employment_status}
                onChange={e => setContext({ ...context, employment_status: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="employed_full_time">Employed (Full-time)</option>
                <option value="employed_part_time">Employed (Part-time)</option>
                <option value="self_employed">Self-employed</option>
                <option value="unemployed_looking">Unemployed (Looking)</option>
                <option value="underemployed">Underemployed</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Education Level
              </label>
              <select
                value={context.highest_educational_attainment}
                onChange={e =>
                  setContext({ ...context, highest_educational_attainment: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="elementary_graduate">Elementary Graduate</option>
                <option value="high_school_graduate">High School Graduate</option>
                <option value="college_undergraduate">College Undergraduate</option>
                <option value="college_graduate">College Graduate</option>
                <option value="vocational_graduate">Vocational Graduate</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Marital Status</label>
              <select
                value={context.marital_status}
                onChange={e => setContext({ ...context, marital_status: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Not specified</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Quick Scenarios:</h4>
            <div className="flex flex-wrap gap-2">
              {presetScenarios.map(scenario => (
                <button
                  key={scenario.name}
                  onClick={() => setContext(scenario.context)}
                  className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SectoralInfo value={sectoralInfo} onChange={setSectoralInfo} context={context} />

        <div className="rounded border bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold">Current Context & Results:</h4>
          <div className="space-y-1 text-sm">
            <div>
              <strong>Age:</strong> {context.age} years
            </div>
            <div>
              <strong>Employment:</strong> {context.employment_status || 'Not specified'}
            </div>
            <div>
              <strong>Education:</strong>{' '}
              {context.highest_educational_attainment || 'Not specified'}
            </div>
            <div>
              <strong>Active Flags:</strong>{' '}
              {Object.entries(sectoralInfo)
                .filter(([_, value]) => value === true)
                .map(([key]) => key.replace('is_', '').replace(/_/g, ' '))
                .join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const AgeBasedCalculations: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of age-based automatic calculations.',
      },
    },
  },
  render: () => {
    const [currentAge, setCurrentAge] = React.useState(25);

    const ageGroups = [
      { age: 8, label: 'Child (8 years)', description: 'Out-of-school children eligible' },
      {
        age: 16,
        label: 'Teenager (16 years)',
        description: 'Out-of-school children/youth transition',
      },
      { age: 22, label: 'Young Adult (22 years)', description: 'Out-of-school youth eligible' },
      { age: 35, label: 'Adult (35 years)', description: 'Working age' },
      { age: 65, label: 'Senior (65 years)', description: 'Senior citizen eligible' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-lg font-semibold">Age-Based Classification Demo</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {ageGroups.map(group => (
              <button
                key={group.age}
                onClick={() => setCurrentAge(group.age)}
                className={`rounded px-3 py-2 text-sm ${
                  currentAge === group.age
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <strong>Current:</strong> {ageGroups.find(g => g.age === currentAge)?.description}
          </div>
        </div>

        <SectoralInfo
          value={defaultSectoralInfo}
          onChange={action('age-demo-changed')}
          context={{
            age: currentAge,
            birthdate: new Date(new Date().getFullYear() - currentAge, 5, 15)
              .toISOString()
              .split('T')[0],
            employment_status: currentAge >= 18 ? 'unemployed_looking' : '',
            highest_educational_attainment: currentAge >= 18 ? 'high_school_graduate' : '',
            marital_status: 'single',
          }}
        />
      </div>
    );
  },
};
