import type { Meta, StoryObj } from '@storybook/react'
import { Table, TableBody, TableRow, TableCell, TableControls } from './Table'
import { useState } from 'react'

const meta = {
  title: 'Organisms/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible table component system with modular parts including Table, TableBody, TableRow, TableCell, and TableControls. Designed for the RBI System with built-in selection, search, and action capabilities.'
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

// Sample data for stories
const sampleData = [
  { id: 1, name: 'Juan Dela Cruz', email: 'juan.delacruz@email.com', phone: '+63 912 345 6789', status: 'Active' },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@email.com', phone: '+63 918 765 4321', status: 'Active' },
  { id: 3, name: 'Jose Rizal', email: 'jose.rizal@email.com', phone: '+63 917 888 9999', status: 'Inactive' },
  { id: 4, name: 'Ana Gonzales', email: 'ana.gonzales@email.com', phone: '+63 920 111 2222', status: 'Pending' },
  { id: 5, name: 'Pedro Martinez', email: 'pedro.martinez@email.com', phone: '+63 919 333 4444', status: 'Active' }
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.phone}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const WithCheckboxes: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const handleRowSelect = (id: number, checked: boolean) => {
      if (checked) {
        setSelectedItems(prev => [...prev, id])
      } else {
        setSelectedItems(prev => prev.filter(item => item !== id))
      }
    }

    return (
      <Table>
        <TableBody>
          {sampleData.map((row) => (
            <TableRow key={row.id}>
              <TableCell 
                type="checkbox" 
                checkbox={{
                  checked: selectedItems.includes(row.id),
                  onChange: (checked) => handleRowSelect(row.id, checked)
                }}
              />
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.phone}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

export const WithActions: Story = {
  render: () => (
    <Table>
      <TableBody>
        {sampleData.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.phone}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell type="action" />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export const WithControls: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectAll, setSelectAll] = useState(false)

    const handleSelectAll = (checked: boolean) => {
      setSelectAll(checked)
      if (checked) {
        setSelectedItems(sampleData.map(item => item.id))
      } else {
        setSelectedItems([])
      }
    }

    const handleRowSelect = (id: number, checked: boolean) => {
      if (checked) {
        setSelectedItems(prev => [...prev, id])
      } else {
        setSelectedItems(prev => prev.filter(item => item !== id))
        setSelectAll(false)
      }
    }

    // Filter data based on search
    const filteredData = sampleData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="space-y-4">
        <TableControls
          selectAll={{
            checked: selectAll,
            onChange: handleSelectAll,
            label: `Select all (${selectedItems.length} selected)`
          }}
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: 'Search residents...'
          }}
        />
        
        <Table>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell 
                  type="checkbox" 
                  checkbox={{
                    checked: selectedItems.includes(row.id),
                    onChange: (checked) => handleRowSelect(row.id, checked)
                  }}
                />
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                    row.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : row.status === 'Inactive'
                      ? 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell type="action" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {selectedItems.length} item(s) selected. You can perform bulk actions on these items.
            </p>
          </div>
        )}
      </div>
    )
  }
}

export const EmptyState: Story = {
  render: () => (
    <div className="space-y-4">
      <TableControls
        search={{
          value: '',
          onChange: () => {},
          placeholder: 'Search residents...'
        }}
      />
      
      <Table>
        <TableBody>
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-background-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No residents found</h3>
            <p className="text-secondary">Get started by adding your first resident to the system.</p>
          </div>
        </TableBody>
      </Table>
    </div>
  )
}

export const InteractiveExample: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectAll, setSelectAll] = useState(false)
    const [data, setData] = useState(sampleData)

    const handleSelectAll = (checked: boolean) => {
      setSelectAll(checked)
      if (checked) {
        setSelectedItems(filteredData.map(item => item.id))
      } else {
        setSelectedItems([])
      }
    }

    const handleRowSelect = (id: number, checked: boolean) => {
      if (checked) {
        setSelectedItems(prev => [...prev, id])
      } else {
        setSelectedItems(prev => prev.filter(item => item !== id))
        setSelectAll(false)
      }
    }

    const handleStatusToggle = (id: number) => {
      setData(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
          : item
      ))
    }

    // Filter data based on search
    const filteredData = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm)
    )

    return (
      <div className="space-y-4">
        <TableControls
          selectAll={{
            checked: selectAll,
            onChange: handleSelectAll,
            label: `Select all (${selectedItems.length} selected)`
          }}
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: 'Search by name, email, or phone...'
          }}
        />
        
        <Table>
          <TableBody>
            {filteredData.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-secondary">No results found for "{searchTerm}"</p>
              </div>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell 
                    type="checkbox" 
                    checkbox={{
                      checked: selectedItems.includes(row.id),
                      onChange: (checked) => handleRowSelect(row.id, checked)
                    }}
                  />
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleStatusToggle(row.id)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset cursor-pointer transition-colors ${
                        row.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : row.status === 'Inactive'
                          ? 'bg-red-50 text-red-700 ring-red-600/20 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400'
                      }`}
                    >
                      {row.status}
                    </button>
                  </TableCell>
                  <TableCell type="action" />
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="bg-background rounded-lg border border-default p-4">
          <h3 className="font-semibold text-primary mb-2">Interactive Features Demo</h3>
          <ul className="text-sm text-secondary space-y-1">
            <li>• Search by name, email, or phone number</li>
            <li>• Click checkboxes to select individual items</li>
            <li>• Use "Select all" to select all visible items</li>
            <li>• Click status badges to toggle between Active/Inactive</li>
            <li>• Action buttons provide contextual operations</li>
          </ul>
        </div>
      </div>
    )
  }
}

// Component parts showcase
export const ComponentParts: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-primary mb-4">Table Controls Only</h3>
        <TableControls
          selectAll={{
            checked: false,
            onChange: () => {},
            label: 'Select all items'
          }}
          search={{
            value: '',
            onChange: () => {},
            placeholder: 'Search items...'
          }}
        />
      </div>
      
      <div>
        <h3 className="font-semibold text-primary mb-4">Basic Table</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Header 1</TableCell>
              <TableCell>Header 2</TableCell>
              <TableCell>Header 3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Data 1</TableCell>
              <TableCell>Data 2</TableCell>
              <TableCell>Data 3</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div>
        <h3 className="font-semibold text-primary mb-4">Different Cell Types</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell type="checkbox" checkbox={{ checked: true, onChange: () => {} }} />
              <TableCell>Content Cell</TableCell>
              <TableCell type="action" />
            </TableRow>
            <TableRow>
              <TableCell type="checkbox" checkbox={{ checked: false, onChange: () => {} }} />
              <TableCell>Another Content Cell</TableCell>
              <TableCell type="action" />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}