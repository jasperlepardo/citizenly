import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DataTable from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A powerful, feature-rich data table component for displaying and manipulating tabular data. Key features include:

- **Sorting** - Click column headers to sort data
- **Pagination** - Handle large datasets with page navigation
- **Row Selection** - Single or multiple row selection with checkboxes
- **Custom Actions** - Configurable action buttons per row
- **Custom Rendering** - Flexible cell rendering with custom components
- **Loading States** - Built-in loading indicators
- **Empty States** - Customizable empty data messaging
- **Responsive Design** - Adapts to different screen sizes

Perfect for admin dashboards, data management interfaces, and any application requiring robust data presentation.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'Array of data objects to display in the table',
    },
    columns: {
      description: 'Column configuration including titles, data keys, and renderers',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    size: {
      control: 'radio',
      options: ['small', 'middle', 'large'],
      description: 'Table size affecting padding and text size',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
}

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'Juan dela Cruz',
    email: 'juan@example.com',
    role: 'Admin',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'User',
    status: 'active',
    joinDate: '2024-01-16',
    lastActive: '2024-01-19',
  },
  {
    id: '3',
    name: 'Pedro Rodriguez',
    email: 'pedro@example.com',
    role: 'Moderator',
    status: 'inactive',
    joinDate: '2024-01-10',
    lastActive: '2024-01-18',
  },
  {
    id: '4',
    name: 'Ana Garcia',
    email: 'ana@example.com',
    role: 'User',
    status: 'pending',
    joinDate: '2024-01-20',
    lastActive: '2024-01-20',
  },
  {
    id: '5',
    name: 'Carlos Martinez',
    email: 'carlos@example.com',
    role: 'User',
    status: 'active',
    joinDate: '2024-01-12',
    lastActive: '2024-01-17',
  },
];

const basicColumns = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name' as keyof UserData,
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email' as keyof UserData,
    sortable: true,
  },
  {
    key: 'role',
    title: 'Role',
    dataIndex: 'role' as keyof UserData,
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status' as keyof UserData,
    render: (value: string) => {
      const statusColors = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value as keyof typeof statusColors]}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      );
    },
    sortable: true,
  },
  {
    key: 'joinDate',
    title: 'Join Date',
    dataIndex: 'joinDate' as keyof UserData,
    render: (value: string) => new Date(value).toLocaleDateString(),
    sortable: true,
  },
];

const actionsColumn = [
  {
    key: 'edit',
    label: 'Edit',
    onClick: (record: UserData) => action('edit-user')(record),
    variant: 'primary' as const,
  },
  {
    key: 'delete',
    label: 'Delete',
    onClick: (record: UserData) => action('delete-user')(record),
    variant: 'danger' as const,
    visible: (record: UserData) => record.status !== 'active',
  },
  {
    key: 'view',
    label: 'View',
    href: (record: UserData) => `/users/${record.id}`,
    variant: 'secondary' as const,
  },
];

export const Default: Story = {
  args: {
    data: mockUsers,
    columns: basicColumns,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic data table with sortable columns and status badges.',
      },
    },
  },
};

export const WithActions: Story = {
  args: {
    data: mockUsers,
    columns: basicColumns,
    actions: actionsColumn,
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with action buttons. Edit and Delete buttons trigger actions, while View uses navigation.',
      },
    },
  },
};

export const WithSelection: Story = {
  args: {
    data: mockUsers,
    columns: basicColumns,
    selection: {
      selectedRowKeys: ['1', '3'],
      onChange: action('selection-changed'),
      getCheckboxProps: (record: UserData) => ({
        disabled: record.status === 'pending',
      }),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with row selection. Some rows can be disabled from selection.',
      },
    },
  },
};

export const WithPagination: Story = {
  args: {
    data: mockUsers,
    columns: basicColumns,
    pagination: {
      current: 1,
      pageSize: 3,
      total: 5,
      onChange: action('page-changed'),
      showSizeChanger: true,
      pageSizeOptions: ['3', '5', '10', '20'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Data table with pagination controls and page size selector.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: basicColumns,
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with spinner and loading text.',
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns: basicColumns,
    emptyText: (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">📋</div>
        <div className="text-gray-500 font-medium">No users found</div>
        <div className="text-gray-400 text-sm mt-1">
          Add some users to see them appear here
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state with custom messaging and icon.',
      },
    },
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Different table sizes affecting padding and text size.',
      },
    },
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Small</h3>
        <DataTable
          data={mockUsers.slice(0, 3)}
          columns={basicColumns}
          size="small"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Medium (Default)</h3>
        <DataTable
          data={mockUsers.slice(0, 3)}
          columns={basicColumns}
          size="middle"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Large</h3>
        <DataTable
          data={mockUsers.slice(0, 3)}
          columns={basicColumns}
          size="large"
        />
      </div>
    </div>
  ),
};

export const CustomRendering: Story = {
  args: {
    data: mockUsers,
    columns: [
      {
        key: 'user',
        title: 'User',
        render: (_, record: UserData) => (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {record.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-medium text-gray-900">{record.name}</div>
              <div className="text-gray-500 text-sm">{record.email}</div>
            </div>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'role',
        title: 'Role & Status',
        render: (_, record: UserData) => (
          <div>
            <div className="font-medium text-gray-900">{record.role}</div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              record.status === 'active' ? 'bg-green-100 text-green-800' :
              record.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </span>
          </div>
        ),
        sortable: false,
      },
      {
        key: 'activity',
        title: 'Activity',
        render: (_, record: UserData) => (
          <div className="text-sm">
            <div className="text-gray-900">
              Joined: {new Date(record.joinDate).toLocaleDateString()}
            </div>
            <div className="text-gray-500">
              Last active: {new Date(record.lastActive).toLocaleDateString()}
            </div>
          </div>
        ),
        sortable: false,
      },
    ],
    actions: actionsColumn,
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom cell rendering with avatars, badges, and complex layouts.',
      },
    },
  },
};

export const FullFeatured: Story = {
  args: {
    data: mockUsers,
    columns: basicColumns,
    actions: actionsColumn,
    selection: {
      selectedRowKeys: [],
      onChange: action('selection-changed'),
    },
    pagination: {
      current: 1,
      pageSize: 3,
      total: mockUsers.length,
      onChange: action('page-changed'),
      showSizeChanger: true,
      pageSizeOptions: ['3', '5', '10'],
    },
    onRow: (record: UserData) => ({
      onClick: () => action('row-clicked')(record),
      className: 'cursor-pointer hover:bg-blue-50',
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full-featured data table with all features enabled: sorting, pagination, selection, actions, and row click events.',
      },
    },
  },
};

export const ResidentsTable: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Residents management table with Filipino names and local data.',
      },
    },
  },
  render: () => {
    const residents = [
      {
        id: '1',
        fullName: 'Juan Carlos dela Cruz',
        age: 34,
        gender: 'Male',
        civilStatus: 'Married',
        occupation: 'Barangay Captain',
        household: 'HH-001',
        status: 'active',
      },
      {
        id: '2',
        fullName: 'Maria Esperanza Santos',
        age: 29,
        gender: 'Female',
        civilStatus: 'Single',
        occupation: 'Teacher',
        household: 'HH-002',
        status: 'active',
      },
      {
        id: '3',
        fullName: 'Pedro Antonio Rodriguez',
        age: 45,
        gender: 'Male',
        civilStatus: 'Married',
        occupation: 'Tricycle Driver',
        household: 'HH-003',
        status: 'inactive',
      },
    ];

    const residentColumns = [
      {
        key: 'fullName',
        title: 'Full Name',
        dataIndex: 'fullName' as keyof typeof residents[0],
        sortable: true,
      },
      {
        key: 'demographics',
        title: 'Demographics',
        render: (_, record: typeof residents[0]) => (
          <div className="text-sm">
            <div>{record.age} years old, {record.gender}</div>
            <div className="text-gray-500">{record.civilStatus}</div>
          </div>
        ),
      },
      {
        key: 'occupation',
        title: 'Occupation',
        dataIndex: 'occupation' as keyof typeof residents[0],
        sortable: true,
      },
      {
        key: 'household',
        title: 'Household',
        dataIndex: 'household' as keyof typeof residents[0],
        render: (value: string) => (
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status' as keyof typeof residents[0],
        render: (value: string) => (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        ),
      },
    ];

    const residentActions = [
      {
        key: 'edit',
        label: 'Edit',
        onClick: (record: typeof residents[0]) => action('edit-resident')(record),
        variant: 'primary' as const,
      },
      {
        key: 'household',
        label: 'View Household',
        href: (record: typeof residents[0]) => `/households/${record.household}`,
        variant: 'secondary' as const,
      },
      {
        key: 'deactivate',
        label: record => record.status === 'active' ? 'Deactivate' : 'Activate',
        onClick: (record: typeof residents[0]) => action('toggle-status')(record),
        variant: 'warning' as const,
      },
    ];

    return (
      <DataTable
        data={residents}
        columns={residentColumns}
        actions={residentActions}
        selection={{
          selectedRowKeys: [],
          onChange: action('residents-selection-changed'),
        }}
        pagination={{
          current: 1,
          pageSize: 5,
          total: residents.length,
          onChange: action('residents-page-changed'),
        }}
      />
    );
  },
};