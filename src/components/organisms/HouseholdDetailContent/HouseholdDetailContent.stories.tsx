import type { Meta, StoryObj } from '@storybook/react';
import HouseholdDetailContent from './HouseholdDetailContent';

const meta = {
  title: 'Organisms/HouseholdDetailContent',
  component: HouseholdDetailContent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A detailed view component for household information displaying household data, head resident details, and family members. Includes loading states, error handling, and navigation controls.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HouseholdDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock household data
const mockCompleteHousehold = {
  code: 'HH-2024-001',
  name: 'Santos Family',
  house_number: '123',
  street_name: 'Rizal Street',
  subdivision: 'Green Valley Subdivision',
  barangay_code: '042108001',
  created_at: '2024-01-15T08:30:00Z',
  head_resident: {
    id: 'R-2024-001',
    first_name: 'Juan',
    middle_name: 'Cruz',
    last_name: 'Santos',
  },
  member_count: 5,
  members: [
    {
      id: 'R-2024-001',
      first_name: 'Juan',
      middle_name: 'Cruz',
      last_name: 'Santos',
      relationship_to_head: 'Head',
    },
    {
      id: 'R-2024-002',
      first_name: 'Maria',
      middle_name: 'Reyes',
      last_name: 'Santos',
      relationship_to_head: 'Spouse',
    },
    {
      id: 'R-2024-003',
      first_name: 'Carlos',
      last_name: 'Santos',
      relationship_to_head: 'Son',
    },
    {
      id: 'R-2024-004',
      first_name: 'Ana',
      last_name: 'Santos',
      relationship_to_head: 'Daughter',
    },
    {
      id: 'R-2024-005',
      first_name: 'Jose',
      middle_name: 'Santos',
      last_name: 'Cruz',
      relationship_to_head: 'Father-in-law',
    },
  ],
};

// Mock session for demonstration
const mockSession = {
  access_token: 'mock-token',
  user: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
  },
};

// Mock useParams hook
const mockUseParams = (id: string) => ({ id });

// Mock useRouter hook
const mockUseRouter = () => ({
  push: (path: string) => console.log('Navigating to:', path),
});

// Default story with complete household data
export const CompleteHousehold: Story = {
  render: () => {
    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCompleteHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete household detail view with all information including head and members.',
      },
    },
  },
};

// Household without head
export const HouseholdWithoutHead: Story = {
  render: () => {
    const householdWithoutHead = {
      ...mockCompleteHousehold,
      head_resident: undefined,
      members: mockCompleteHousehold.members?.filter(m => m.relationship_to_head !== 'Head'),
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(householdWithoutHead),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Household detail view when no household head is assigned.',
      },
    },
  },
};

// Minimal address information
export const MinimalAddressInfo: Story = {
  render: () => {
    const minimalAddressHousehold = {
      ...mockCompleteHousehold,
      name: undefined,
      house_number: undefined,
      street_name: undefined,
      subdivision: undefined,
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(minimalAddressHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Household with minimal address information (only required fields).',
      },
    },
  },
};

// Single member household
export const SingleMemberHousehold: Story = {
  render: () => {
    const singleMemberHousehold = {
      ...mockCompleteHousehold,
      member_count: 1,
      members: [
        {
          id: 'R-2024-001',
          first_name: 'Maria',
          last_name: 'Gonzales',
          relationship_to_head: 'Head',
        },
      ],
      head_resident: {
        id: 'R-2024-001',
        first_name: 'Maria',
        last_name: 'Gonzales',
      },
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(singleMemberHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Single-member household with only the head resident.',
      },
    },
  },
};

// Large household
export const LargeHousehold: Story = {
  render: () => {
    const largeHousehold = {
      ...mockCompleteHousehold,
      member_count: 12,
      members: [
        {
          id: 'R-2024-001',
          first_name: 'Roberto',
          middle_name: 'Luna',
          last_name: 'Garcia',
          relationship_to_head: 'Head',
        },
        {
          id: 'R-2024-002',
          first_name: 'Carmen',
          middle_name: 'Santos',
          last_name: 'Garcia',
          relationship_to_head: 'Spouse',
        },
        {
          id: 'R-2024-003',
          first_name: 'Miguel',
          last_name: 'Garcia',
          relationship_to_head: 'Son',
        },
        {
          id: 'R-2024-004',
          first_name: 'Isabella',
          last_name: 'Garcia',
          relationship_to_head: 'Daughter',
        },
        {
          id: 'R-2024-005',
          first_name: 'Diego',
          last_name: 'Garcia',
          relationship_to_head: 'Son',
        },
        {
          id: 'R-2024-006',
          first_name: 'Sofia',
          last_name: 'Garcia',
          relationship_to_head: 'Daughter',
        },
        {
          id: 'R-2024-007',
          first_name: 'Antonio',
          middle_name: 'Cruz',
          last_name: 'Luna',
          relationship_to_head: 'Father',
        },
        {
          id: 'R-2024-008',
          first_name: 'Esperanza',
          middle_name: 'Reyes',
          last_name: 'Luna',
          relationship_to_head: 'Mother',
        },
        {
          id: 'R-2024-009',
          first_name: 'Carlos',
          last_name: 'Santos',
          relationship_to_head: 'Father-in-law',
        },
        {
          id: 'R-2024-010',
          first_name: 'Luz',
          last_name: 'Santos',
          relationship_to_head: 'Mother-in-law',
        },
        {
          id: 'R-2024-011',
          first_name: 'Pedro',
          last_name: 'Garcia',
          relationship_to_head: 'Brother',
        },
        {
          id: 'R-2024-012',
          first_name: 'Elena',
          middle_name: 'Martinez',
          last_name: 'Garcia',
          relationship_to_head: 'Sister-in-law',
        },
      ],
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(largeHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Large extended family household with 12 members.',
      },
    },
  },
};

// Household without members list
export const HouseholdWithoutMembersList: Story = {
  render: () => {
    const householdWithoutMembers = {
      ...mockCompleteHousehold,
      members: undefined,
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(householdWithoutMembers),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Household detail view when member list is not available.',
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  render: () => {
    global.fetch = (
      () => new Promise(resolve => setTimeout(resolve, 10000)) // Never resolves to show loading
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching household details.',
      },
    },
  },
};

// Error state - Server error
export const ServerError: Story = {
  render: () => {
    global.fetch = (() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when server returns an error.',
      },
    },
  },
};

// Error state - Not found
export const NotFoundError: Story = {
  render: () => {
    global.fetch = (() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Household not found' }),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when household is not found (404).',
      },
    },
  },
};

// Network error
export const NetworkError: Story = {
  render: () => {
    global.fetch = (() =>
      Promise.reject(new Error('Network error'))
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when network request fails.',
      },
    },
  },
};

// Urban household
export const UrbanHousehold: Story = {
  render: () => {
    const urbanHousehold = {
      ...mockCompleteHousehold,
      code: 'HH-2024-010',
      name: 'Cruz Condominium Unit',
      house_number: 'Unit 15B',
      street_name: 'Ayala Avenue',
      subdivision: 'Makati Prime Tower',
      barangay_code: '137604001',
      head_resident: {
        id: 'R-2024-010',
        first_name: 'Alexandra',
        middle_name: 'Marie',
        last_name: 'Cruz',
      },
      member_count: 3,
      members: [
        {
          id: 'R-2024-010',
          first_name: 'Alexandra',
          middle_name: 'Marie',
          last_name: 'Cruz',
          relationship_to_head: 'Head',
        },
        {
          id: 'R-2024-011',
          first_name: 'Michael',
          middle_name: 'John',
          last_name: 'Tan',
          relationship_to_head: 'Spouse',
        },
        {
          id: 'R-2024-012',
          first_name: 'Sophia',
          last_name: 'Cruz-Tan',
          relationship_to_head: 'Daughter',
        },
      ],
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(urbanHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Urban household in a condominium unit with modern address format.',
      },
    },
  },
};

// Rural household
export const RuralHousehold: Story = {
  render: () => {
    const ruralHousehold = {
      ...mockCompleteHousehold,
      code: 'HH-2024-020',
      name: 'Mangubat Farm',
      house_number: undefined,
      street_name: 'Sitio Malaking Bato',
      subdivision: undefined,
      barangay_code: '025519001',
      head_resident: {
        id: 'R-2024-020',
        first_name: 'Ernesto',
        middle_name: 'Dela',
        last_name: 'Cruz',
      },
      member_count: 8,
      members: [
        {
          id: 'R-2024-020',
          first_name: 'Ernesto',
          middle_name: 'Dela',
          last_name: 'Cruz',
          relationship_to_head: 'Head',
        },
        {
          id: 'R-2024-021',
          first_name: 'Rosario',
          middle_name: 'Aquino',
          last_name: 'Dela Cruz',
          relationship_to_head: 'Spouse',
        },
        {
          id: 'R-2024-022',
          first_name: 'Emmanuel',
          last_name: 'Dela Cruz',
          relationship_to_head: 'Son',
        },
        {
          id: 'R-2024-023',
          first_name: 'Maricel',
          last_name: 'Dela Cruz',
          relationship_to_head: 'Daughter',
        },
        {
          id: 'R-2024-024',
          first_name: 'Joselito',
          last_name: 'Dela Cruz',
          relationship_to_head: 'Son',
        },
        {
          id: 'R-2024-025',
          first_name: 'Teresita',
          last_name: 'Dela Cruz',
          relationship_to_head: 'Daughter',
        },
        {
          id: 'R-2024-026',
          first_name: 'Lola',
          middle_name: 'Carmen',
          last_name: 'Aquino',
          relationship_to_head: 'Mother-in-law',
        },
        {
          id: 'R-2024-027',
          first_name: 'Rodrigo',
          middle_name: 'Santos',
          last_name: 'Aquino',
          relationship_to_head: 'Brother-in-law',
        },
      ],
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(ruralHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Rural agricultural household with traditional sitio address format.',
      },
    },
  },
};

// Members with various relationships
export const VariedRelationships: Story = {
  render: () => {
    const variedRelationshipsHousehold = {
      ...mockCompleteHousehold,
      code: 'HH-2024-030',
      name: 'Extended Ramirez Family',
      member_count: 10,
      members: [
        {
          id: 'R-2024-030',
          first_name: 'Patricia',
          middle_name: 'Santos',
          last_name: 'Ramirez',
          relationship_to_head: 'Head',
        },
        {
          id: 'R-2024-031',
          first_name: 'Gabriel',
          last_name: 'Ramirez',
          relationship_to_head: 'Son',
        },
        {
          id: 'R-2024-032',
          first_name: 'Camila',
          last_name: 'Ramirez',
          relationship_to_head: 'Daughter',
        },
        {
          id: 'R-2024-033',
          first_name: 'Lorenzo',
          middle_name: 'Cruz',
          last_name: 'Santos',
          relationship_to_head: 'Father',
        },
        {
          id: 'R-2024-034',
          first_name: 'Isabel',
          last_name: 'Santos',
          relationship_to_head: 'Mother',
        },
        {
          id: 'R-2024-035',
          first_name: 'Marco',
          last_name: 'Santos',
          relationship_to_head: 'Brother',
        },
        {
          id: 'R-2024-036',
          first_name: 'Daniela',
          middle_name: 'Reyes',
          last_name: 'Santos',
          relationship_to_head: 'Sister-in-law',
        },
        {
          id: 'R-2024-037',
          first_name: 'Mateo',
          last_name: 'Santos',
          relationship_to_head: 'Nephew',
        },
        {
          id: 'R-2024-038',
          first_name: 'Valentina',
          last_name: 'Santos',
          relationship_to_head: 'Niece',
        },
        {
          id: 'R-2024-039',
          first_name: 'Fernando',
          middle_name: 'Garcia',
          last_name: 'Torres',
          relationship_to_head: 'Boarder',
        },
      ],
    };

    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(variedRelationshipsHousehold),
      })
    );

    return <HouseholdDetailContent />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Household with members having various relationships including extended family and boarders.',
      },
    },
  },
};

// Dark mode
export const DarkMode: Story = {
  render: () => {
    global.fetch = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockCompleteHousehold),
      })
    );

    return (
      <div className="dark min-h-screen bg-gray-900">
        <HouseholdDetailContent />
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
        story: 'Household detail view in dark mode.',
      },
    },
  },
};