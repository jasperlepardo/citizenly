import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DataTable, { type TableColumn, type TableAction } from './DataTable';
import { useState } from 'react';

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A comprehensive data table component with sorting, pagination, row selection, and custom actions. Built for the RBI System to display and manage large datasets efficiently.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
    },
    loading: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
interface SampleResident {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
}

const sampleData: SampleResident[] = [
  {
    id: '1',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 912 345 6789',
    age: 35,
    address: 'Barangay San Antonio, Quezon City',
    status: 'Active',
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@email.com',
    phone: '+63 918 765 4321',
    age: 28,
    address: 'Barangay Marikina Heights, Marikina',
    status: 'Active',
    joinDate: '2023-02-20',
  },
  {
    id: '3',
    firstName: 'Jose',
    lastName: 'Rizal',
    email: 'jose.rizal@email.com',
    phone: '+63 917 888 9999',
    age: 45,
    address: 'Barangay Poblacion, Makati',
    status: 'Inactive',
    joinDate: '2022-12-10',
  },
  {
    id: '4',
    firstName: 'Ana',
    lastName: 'Gonzales',
    email: 'ana.gonzales@email.com',
    phone: '+63 920 111 2222',
    age: 32,
    address: 'Barangay Bagumbayan, Taguig',
    status: 'Pending',
    joinDate: '2023-03-05',
  },
  {
    id: '5',
    firstName: 'Pedro',
    lastName: 'Martinez',
    email: 'pedro.martinez@email.com',
    phone: '+63 919 333 4444',
    age: 29,
    address: 'Barangay San Miguel, Pasig',
    status: 'Active',
    joinDate: '2023-01-28',
  },
];

// Basic columns configuration
const basicColumns: TableColumn<SampleResident>[] = [
  {
    key: 'firstName',
    title: 'First Name',
    dataIndex: 'firstName',
    sortable: true,
  },
  {
    key: 'lastName',
    title: 'Last Name',
    dataIndex: 'lastName',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    dataIndex: 'email',
  },
  {
    key: 'phone',
    title: 'Phone',
    dataIndex: 'phone',
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
          status === 'Active'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
            : status === 'Inactive'
              ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400'
        }`}
      >
        {status}
      </span>
    ),
  },
];

// Extended columns with custom rendering
const extendedColumns: TableColumn<SampleResident>[] = [
  {
    key: 'name',
    title: 'Full Name',
    render: (_, record) => (
      <div>
        <div className="font-medium text-primary">
          {record.firstName} {record.lastName}
        </div>
        <div className="text-sm text-secondary">{record.email}</div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'contact',
    title: 'Contact Info',
    render: (_, record) => (
      <div>
        <div className="text-sm text-primary">{record.phone}</div>
        <div className="text-xs text-secondary">{record.address}</div>
      </div>
    ),
  },
  {
    key: 'age',
    title: 'Age',
    dataIndex: 'age',
    sortable: true,
    align: 'center' as const,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
          status === 'Active'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
            : status === 'Inactive'
              ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400'
        }`}
      >
        {status}
      </span>
    ),
  },
  {
    key: 'joinDate',
    title: 'Join Date',
    dataIndex: 'joinDate',
    render: (date: string) => new Date(date).toLocaleDateString(),
    sortable: true,
  },
];

// Sample actions
const sampleActions: TableAction<SampleResident>[] = [
  {
    key: 'view',
    label: 'View',
    href: record => `/residents/${record.id}`,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    key: 'edit',
    label: 'Edit',
    onClick: record => alert(`Edit ${record.firstName} ${record.lastName}`),
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    variant: 'primary' as const,
  },
  {
    key: 'delete',
    label: 'Delete',
    onClick: record => alert(`Delete ${record.firstName} ${record.lastName}`),
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    ),
    variant: 'danger' as const,
    visible: record => record.status !== 'Active',
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: basicColumns,
    rowKey: 'id',
  },
};

export const WithActions: Story = {
  args: {
    data: sampleData,
    columns: basicColumns,
    actions: sampleActions,
    rowKey: 'id',
  },
};

export const WithExtendedColumns: Story = {
  args: {
    data: sampleData,
    columns: extendedColumns,
    actions: sampleActions,
    rowKey: 'id',
  },
};

export const Loading: Story = {
  args: {
    data: sampleData,
    columns: basicColumns,
    loading: true,
    rowKey: 'id',
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: basicColumns,
    emptyText: 'No residents found',
    rowKey: 'id',
  },
};

export const SmallSize: Story = {
  args: {
    data: sampleData,
    columns: basicColumns,
    actions: sampleActions,
    size: 'small',
    rowKey: 'id',
  },
};

export const LargeSize: Story = {
  args: {
    data: sampleData,
    columns: basicColumns,
    actions: sampleActions,
    size: 'large',
    rowKey: 'id',
  },
};

// Interactive story with selection
const WithSelectionComponent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<SampleResident[]>([]);

  return (
    <div className="space-y-4">
      {selectedRowKeys.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">Selected Items:</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {selectedRowKeys.length} item(s) selected:{' '}
            {selectedRows.map(r => `${r.firstName} ${r.lastName}`).join(', ')}
          </p>
        </div>
      )}

      <DataTable
        data={sampleData}
        columns={basicColumns}
        actions={sampleActions}
        rowKey="id"
        selection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
          },
        }}
      />
    </div>
  );
};

export const WithSelection: Story = {
  render: WithSelectionComponent,
};

// Interactive story with pagination
const WithPaginationComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);

  // Generate more data for pagination demo
  const moreData = Array.from({ length: 12 }, (_, i) => ({
    id: (i + 1).toString(),
    firstName: `Person${i + 1}`,
    lastName: `Lastname${i + 1}`,
    email: `person${i + 1}@email.com`,
    phone: `+63 9${(i + 1).toString().padStart(2, '0')} 123 456${i}`,
    age: 25 + (i % 30),
    address: `Barangay ${i + 1}, City ${i + 1}`,
    status: (['Active', 'Inactive', 'Pending'] as const)[i % 3],
    joinDate: `2023-0${(i % 9) + 1}-${(i % 28) + 1}`,
  }));

  const paginatedData = moreData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <DataTable
      data={paginatedData}
      columns={basicColumns}
      actions={sampleActions}
      rowKey="id"
      pagination={{
        current: currentPage,
        pageSize,
        total: moreData.length,
        onChange: page => setCurrentPage(page),
      }}
    />
  );
};

export const WithPagination: Story = {
  render: WithPaginationComponent,
};

// Story showing different column features
export const ColumnFeatures: Story = {
  render: () => {
    const columns: TableColumn<SampleResident>[] = [
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        width: 80,
        align: 'center',
      },
      {
        key: 'name',
        title: 'Name (Custom Render)',
        render: (_, record) => (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
              {record.firstName[0]}
              {record.lastName[0]}
            </div>
            <div>
              <div className="font-medium text-primary">
                {record.firstName} {record.lastName}
              </div>
              <div className="text-sm text-secondary">{record.email}</div>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'age',
        title: 'Age (Sortable)',
        dataIndex: 'age',
        sortable: true,
        align: 'center',
        width: 100,
      },
      {
        key: 'contact',
        title: 'Contact (Right Aligned)',
        dataIndex: 'phone',
        align: 'right',
      },
      {
        key: 'status',
        title: 'Status (Custom Colors)',
        dataIndex: 'status',
        render: (status: string) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : status === 'Inactive'
                    ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400'
              }`}
            >
              {status}
            </span>
          </div>
        ),
        align: 'center',
      },
    ];

    return <DataTable data={sampleData} columns={columns} actions={sampleActions} rowKey="id" />;
  },
};

// Row interaction story
const WithRowInteractionComponent = () => {
  const [clickedRow, setClickedRow] = useState<string>('');

  return (
    <div className="space-y-4">
      {clickedRow && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-700 dark:text-green-300">Row clicked: {clickedRow}</p>
        </div>
      )}

      <DataTable
        data={sampleData}
        columns={basicColumns}
        rowKey="id"
        onRow={record => ({
          onClick: () => setClickedRow(`${record.firstName} ${record.lastName}`),
          onDoubleClick: () => alert(`Double clicked: ${record.firstName} ${record.lastName}`),
          className: 'cursor-pointer',
        })}
      />
    </div>
  );
};

export const WithRowInteraction: Story = {
  render: WithRowInteractionComponent,
};
