import type { Meta, StoryObj } from '@storybook/react';
import { BirthInformation } from './BirthInformation';

const mockAction = (name: string) => (value: unknown) => {
  console.log(`${name}:`, value);
};

const mockPsgcSearch = (query: string) => {
  console.log('PSGC Search:', query);
};

const meta = {
  title: 'Organisms/Form/Resident/PersonalInformation/FormField/BirthInformation',
  component: BirthInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Birth Information form field component for collecting birth date and place information. Includes PSGC place search functionality for Philippine location codes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current birth information data',
    },
    onChange: {
      description: 'Callback function called when birth information changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for form validation',
    },
    onPsgcSearch: {
      description: 'Callback function for PSGC place search',
    },
    psgcOptions: {
      control: { type: 'object' },
      description: 'Available PSGC place options from search',
    },
    psgcLoading: {
      control: { type: 'boolean' },
      description: 'Whether PSGC search is loading',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof BirthInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Empty birth information
export const Default: Story = {
  args: {
    value: {
      birthdate: '',
      birthPlaceName: '',
      birthPlaceCode: '',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty birth information form with default state.',
      },
    },
  },
};

// With sample data
export const WithData: Story = {
  args: {
    value: {
      birthdate: '1990-05-15',
      birthPlaceName: 'Quezon City, Metro Manila',
      birthPlaceCode: '137404000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form with sample data filled in.',
      },
    },
  },
};

// With validation errors
export const WithErrors: Story = {
  args: {
    value: {
      birthdate: '',
      birthPlaceName: '',
      birthPlaceCode: 'invalid',
    },
    onChange: mockAction('onChange'),
    errors: {
      birthdate: 'Birth date is required',
      birthPlaceName: 'Birth place name is required',
      birthPlaceCode: 'Invalid PSGC code format',
    },
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form displaying validation errors.',
      },
    },
  },
};

// With PSGC search options
export const WithPsgcOptions: Story = {
  args: {
    value: {
      birthdate: '1985-12-03',
      birthPlaceName: 'Manila',
      birthPlaceCode: '',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [
      {
        code: '133900000',
        name: 'Manila, Metro Manila',
        level: 'city',
      },
      {
        code: '174000000',
        name: 'Manila, Surigao del Norte',
        level: 'municipality',
      },
    ],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form with PSGC search results available.',
      },
    },
  },
};

// PSGC search loading
export const PsgcLoading: Story = {
  args: {
    value: {
      birthdate: '1992-08-20',
      birthPlaceName: 'Cebu',
      birthPlaceCode: '',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form with PSGC search in loading state.',
      },
    },
  },
};

// Provincial birth place
export const ProvincialBirthPlace: Story = {
  args: {
    value: {
      birthdate: '1988-03-12',
      birthPlaceName: 'Baguio City, Benguet',
      birthPlaceCode: '141100000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information with provincial birthplace example.',
      },
    },
  },
};

// Metro Manila birthplace
export const MetroManilaBirthPlace: Story = {
  args: {
    value: {
      birthdate: '1995-11-08',
      birthPlaceName: 'Makati City, Metro Manila',
      birthPlaceCode: '137500000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information with Metro Manila birthplace example.',
      },
    },
  },
};

// Foreign birthplace
export const ForeignBirthPlace: Story = {
  args: {
    value: {
      birthdate: '1987-07-25',
      birthPlaceName: 'Singapore',
      birthPlaceCode: 'FOREIGN',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information with foreign birthplace example.',
      },
    },
  },
};

// Old birth date
export const OldBirthDate: Story = {
  args: {
    value: {
      birthdate: '1945-01-01',
      birthPlaceName: 'Tondo, Manila',
      birthPlaceCode: '133900000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information for senior citizen with historical birthplace.',
      },
    },
  },
};

// Recent birth date
export const RecentBirthDate: Story = {
  args: {
    value: {
      birthdate: '2005-06-30',
      birthPlaceName: 'Davao City, Davao del Sur',
      birthPlaceCode: '112400000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information for young adult with modern birthplace.',
      },
    },
  },
};

// Mixed error states
export const MixedErrorStates: Story = {
  args: {
    value: {
      birthdate: '1990-13-45', // Invalid date
      birthPlaceName: 'Valid Place Name',
      birthPlaceCode: '', // Missing code
    },
    onChange: mockAction('onChange'),
    errors: {
      birthdate: 'Invalid date format',
      birthPlaceCode: 'PSGC code is required',
    },
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form with mixed valid data and error states.',
      },
    },
  },
};

// With custom styling
export const WithCustomStyling: Story = {
  args: {
    value: {
      birthdate: '1993-04-18',
      birthPlaceName: 'Iloilo City, Iloilo',
      birthPlaceCode: '063000000',
    },
    onChange: mockAction('onChange'),
    errors: {},
    onPsgcSearch: mockPsgcSearch,
    psgcOptions: [],
    psgcLoading: false,
    className: 'border-2 border-blue-200 rounded-lg p-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Birth information form with custom CSS styling applied.',
      },
    },
  },
};