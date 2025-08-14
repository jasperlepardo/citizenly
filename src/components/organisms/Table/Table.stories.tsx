import type { Meta, StoryObj } from '@storybook/react';
import { action } from 'storybook/actions';
import { Table, TableBody, TableRow, TableCell, TableControls } from './Table';

const meta: Meta<typeof Table> = {
  title: 'Organisms/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A flexible, composable table component built from modular parts. This design allows for maximum flexibility in creating different table layouts. Key features include:

- **Composable Architecture** - Built from Table, TableBody, TableRow, and TableCell components
- **Flexible Cell Types** - Content, checkbox, and action cell variants
- **Built-in Controls** - TableControls component with search, selection, and actions
- **Responsive Design** - Adapts to different screen sizes
- **Custom Styling** - Easy to theme and customize

Unlike the DataTable organism which is more opinionated, this Table system gives you full control over the structure and behavior.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for the table',
    },
  },
  subcomponents: {
    TableBody,
    TableRow,
    TableCell,
    TableControls,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockContacts = [
  {
    id: 1,
    name: 'Juan dela Cruz',
    email: 'juan@email.com',
    phone: '+63 912 345 6789',
    role: 'Barangay Captain',
    status: 'active',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+63 922 123 4567',
    role: 'Secretary',
    status: 'active',
  },
  {
    id: 3,
    name: 'Pedro Garcia',
    email: 'pedro@email.com',
    phone: '+63 933 987 6543',
    role: 'Kagawad',
    status: 'inactive',
  },
];

export const BasicTable: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Basic table structure with simple content cells.',
      },
    },
  },
  render: () => (
    <Table>
      <TableBody>
        <TableRow className="border-b bg-gray-50">
          <TableCell>
            <strong>Name</strong>
          </TableCell>
          <TableCell>
            <strong>Email</strong>
          </TableCell>
          <TableCell>
            <strong>Role</strong>
          </TableCell>
        </TableRow>
        {mockContacts.map(contact => (
          <TableRow key={contact.id} className="border-b">
            <TableCell>{contact.name}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell>{contact.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithCheckboxes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Table with checkbox selection for rows.',
      },
    },
  },
  render: () => {
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelectedItems(mockContacts.map(contact => contact.id));
      } else {
        setSelectedItems([]);
      }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
      if (checked) {
        setSelectedItems([...selectedItems, id]);
      } else {
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      }
    };

    return (
      <Table>
        <TableBody>
          {/* Header Row */}
          <TableRow className="border-b bg-gray-50">
            <TableCell
              type="checkbox"
              checkbox={{
                checked: selectedItems.length === mockContacts.length,
                onChange: handleSelectAll,
              }}
            />
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Email</strong>
            </TableCell>
            <TableCell>
              <strong>Status</strong>
            </TableCell>
          </TableRow>

          {/* Data Rows */}
          {mockContacts.map(contact => (
            <TableRow key={contact.id} className="border-b">
              <TableCell
                type="checkbox"
                checkbox={{
                  checked: selectedItems.includes(contact.id),
                  onChange: checked => handleSelectItem(contact.id, checked),
                }}
              />
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    contact.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {contact.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        {selectedItems.length > 0 && (
          <div className="border-t border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-gray-800">{selectedItems.length} item(s) selected</p>
          </div>
        )}
      </Table>
    );
  },
};

export const WithActions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Table with action buttons in each row.',
      },
    },
  },
  render: () => (
    <Table>
      <TableBody>
        {/* Header Row */}
        <TableRow className="border-b bg-gray-50">
          <TableCell>
            <strong>Name</strong>
          </TableCell>
          <TableCell>
            <strong>Email</strong>
          </TableCell>
          <TableCell>
            <strong>Phone</strong>
          </TableCell>
          <TableCell>
            <strong>Actions</strong>
          </TableCell>
        </TableRow>

        {/* Data Rows */}
        {mockContacts.map(contact => (
          <TableRow key={contact.id} className="border-b hover:bg-gray-50">
            <TableCell>{contact.name}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell>{contact.phone}</TableCell>
            <TableCell type="action" />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithControls: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete table with controls including search, selection, and actions.',
      },
    },
  },
  render: () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

    const filteredContacts = mockContacts.filter(
      contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelectedItems(filteredContacts.map(contact => contact.id));
      } else {
        setSelectedItems([]);
      }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
      if (checked) {
        setSelectedItems([...selectedItems, id]);
      } else {
        setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      }
    };

    return (
      <div className="space-y-4">
        <TableControls
          selectAll={{
            checked:
              selectedItems.length === filteredContacts.length && filteredContacts.length > 0,
            onChange: handleSelectAll,
            label: 'Select all contacts',
          }}
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: 'Search contacts...',
          }}
          actions={
            selectedItems.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => action('bulk-delete')(selectedItems)}
                  className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => action('bulk-export')(selectedItems)}
                  className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Export Selected
                </button>
              </div>
            )
          }
        />

        <Table>
          <TableBody>
            {/* Header Row */}
            <TableRow className="border-b bg-gray-50">
              <TableCell
                type="checkbox"
                checkbox={{
                  checked:
                    selectedItems.length === filteredContacts.length && filteredContacts.length > 0,
                  onChange: handleSelectAll,
                }}
              />
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Role</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>

            {/* Data Rows */}
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <TableRow key={contact.id} className="border-b hover:bg-gray-50">
                  <TableCell
                    type="checkbox"
                    checkbox={{
                      checked: selectedItems.includes(contact.id),
                      onChange: checked => handleSelectItem(contact.id, checked),
                    }}
                  />
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.role}</TableCell>
                  <TableCell type="action" />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-gray-500"
                  style={{ gridColumn: '1 / -1' }}
                >
                  No contacts found matching "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {selectedItems.length > 0 && (
          <div className="rounded border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-gray-800">
              {selectedItems.length} of {filteredContacts.length} contacts selected
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const ResidentsTable: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: Barangay residents table with Filipino context.',
      },
    },
  },
  render: () => {
    const residents = [
      {
        id: 1,
        name: 'Juan Carlos de la Cruz',
        age: 34,
        address: 'Block 5 Lot 12, San Lorenzo Street',
        occupation: 'Tricycle Driver',
        household: 'HH-001',
      },
      {
        id: 2,
        name: 'Maria Esperanza Santos',
        age: 29,
        address: 'Unit 3B, Greenview Subdivision',
        occupation: 'Elementary Teacher',
        household: 'HH-002',
      },
      {
        id: 3,
        name: 'Pedro Antonio Rodriguez',
        age: 45,
        address: '123 Rizal Avenue, Zone 1',
        occupation: 'Barangay Tanod',
        household: 'HH-003',
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Barangay San Lorenzo - Residents</h2>
          <button
            onClick={() => action('add-resident')()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Resident
          </button>
        </div>

        <TableControls
          search={{
            value: '',
            onChange: action('search-residents'),
            placeholder: 'Search residents by name or address...',
          }}
        />

        <Table className="overflow-hidden rounded-lg border border-gray-200">
          <TableBody>
            {/* Header Row */}
            <TableRow className="border-b bg-gray-100">
              <TableCell>
                <strong>Full Name</strong>
              </TableCell>
              <TableCell>
                <strong>Age</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              <TableCell>
                <strong>Occupation</strong>
              </TableCell>
              <TableCell>
                <strong>Household</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>

            {/* Data Rows */}
            {residents.map(resident => (
              <TableRow key={resident.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium text-gray-900">{resident.name}</div>
                </TableCell>
                <TableCell>{resident.age} years old</TableCell>
                <TableCell className="text-sm text-gray-600">{resident.address}</TableCell>
                <TableCell>{resident.occupation}</TableCell>
                <TableCell>
                  <span className="rounded bg-blue-100 px-2 py-1 font-mono text-sm text-gray-800">
                    {resident.household}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button
                      onClick={() => action('view-resident')(resident)}
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                    >
                      View
                    </button>
                    <button
                      onClick={() => action('edit-resident')(resident)}
                      className="rounded bg-blue-100 px-2 py-1 text-xs text-gray-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="text-sm text-gray-500">
          Showing {residents.length} residents • Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    );
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Table with empty state messaging.',
      },
    },
  },
  render: () => (
    <Table>
      <TableBody>
        <TableRow className="border-b bg-gray-50">
          <TableCell>
            <strong>Name</strong>
          </TableCell>
          <TableCell>
            <strong>Email</strong>
          </TableCell>
          <TableCell>
            <strong>Role</strong>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="py-12 text-center text-gray-500" style={{ gridColumn: '1 / -1' }}>
            <div>
              <div className="mb-2 text-4xl">📋</div>
              <div className="font-medium">No data available</div>
              <div className="mt-1 text-sm">Add some items to see them here</div>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const CustomStyling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Table with custom styling and colors for different contexts.',
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      {/* Success Theme */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-green-800">Active Residents</h3>
        <Table className="overflow-hidden rounded-lg border-2 border-green-200">
          <TableBody>
            <TableRow className="border-b border-green-200 bg-green-100">
              <TableCell>
                <strong className="text-green-900">Name</strong>
              </TableCell>
              <TableCell>
                <strong className="text-green-900">Status</strong>
              </TableCell>
            </TableRow>
            {mockContacts
              .filter(c => c.status === 'active')
              .map(contact => (
                <TableRow key={contact.id} className="border-b border-green-200 hover:bg-green-50">
                  <TableCell className="text-green-900">{contact.name}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-green-200 px-2 py-1 text-xs text-green-800">
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Warning Theme */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-red-800">Inactive Residents</h3>
        <Table className="overflow-hidden rounded-lg border-2 border-red-200">
          <TableBody>
            <TableRow className="border-b border-red-200 bg-red-100">
              <TableCell>
                <strong className="text-red-900">Name</strong>
              </TableCell>
              <TableCell>
                <strong className="text-red-900">Status</strong>
              </TableCell>
            </TableRow>
            {mockContacts
              .filter(c => c.status === 'inactive')
              .map(contact => (
                <TableRow key={contact.id} className="border-b border-red-200 hover:bg-red-50">
                  <TableCell className="text-red-900">{contact.name}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-red-200 px-2 py-1 text-xs text-red-800">
                      Inactive
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
};
