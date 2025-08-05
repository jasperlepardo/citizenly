import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'UI/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A search input component with search and clear functionality, keyboard shortcuts, and various styling options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'outlined'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    placeholder: {
      control: 'text',
    },
    showClearButton: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stories that need state
const InteractiveWrapper = ({ children, ...props }: any) => {
  const [value, setValue] = useState(props.value || '');
  return React.cloneElement(children, {
    ...props,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    onClear: () => setValue(''),
  });
};

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Citizenly: Story = {
  args: {
    placeholder: 'Search Citizenly',
    variant: 'default',
  },
  render: (args) => (
    <div className="w-[497px]">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    placeholder: 'Search residents...',
    value: 'John Doe',
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Filled: Story = {
  args: {
    placeholder: 'Search documents...',
    variant: 'filled',
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Outlined: Story = {
  args: {
    placeholder: 'Search addresses...',
    variant: 'outlined',
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Search disabled...',
    value: 'Cannot edit this',
    disabled: true,
  },
  render: (args) => (
    <div className="w-96">
      <SearchBar {...args} />
    </div>
  ),
};

export const WithoutClearButton: Story = {
  args: {
    placeholder: 'Search without clear...',
    value: 'Some search text',
    showClearButton: false,
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

// Sizes
export const Small: Story = {
  args: {
    placeholder: 'Small search',
    size: 'sm',
  },
  render: (args) => (
    <div className="w-80">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Medium: Story = {
  args: {
    placeholder: 'Medium search (default)',
    size: 'md',
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

export const Large: Story = {
  args: {
    placeholder: 'Large search',
    size: 'lg',
  },
  render: (args) => (
    <div className="w-[400px]">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

// Custom Icon
export const CustomIcon: Story = {
  args: {
    placeholder: 'Search with custom icon...',
    leftIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  render: (args) => (
    <div className="w-96">
      <InteractiveWrapper {...args}>
        <SearchBar />
      </InteractiveWrapper>
    </div>
  ),
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Search Bar Variants</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default</label>
        <InteractiveWrapper placeholder="Default search...">
          <SearchBar />
        </InteractiveWrapper>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filled</label>
        <InteractiveWrapper placeholder="Filled search..." variant="filled">
          <SearchBar />
        </InteractiveWrapper>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Outlined</label>
        <InteractiveWrapper placeholder="Outlined search..." variant="outlined">
          <SearchBar />
        </InteractiveWrapper>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">With Value</label>
        <InteractiveWrapper placeholder="Search..." value="Sample search text">
          <SearchBar />
        </InteractiveWrapper>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Disabled</label>
        <SearchBar placeholder="Disabled search..." value="Cannot edit" disabled />
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Interactive Example
export const InteractiveExample: Story = {
  render: () => {
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState('');
    
    // Mock search data
    const mockData = [
      'John Doe - Barangay 1',
      'Jane Smith - Barangay 2', 
      'Bob Johnson - Barangay 3',
      'Alice Brown - Barangay 1',
      'Charlie Wilson - Barangay 4',
      'Diana Davis - Barangay 2',
    ];
    
    const handleSearch = (value: string) => {
      if (value.trim()) {
        const results = mockData.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    
    const handleClear = () => {
      setSearchValue('');
      setSearchResults([]);
    };
    
    return (
      <div className="space-y-4 w-96">
        <h3 className="text-lg font-semibold">Interactive Search Demo</h3>
        
        <SearchBar
          placeholder="Search residents..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            handleSearch(e.target.value);
          }}
          onClear={handleClear}
          onSearch={handleSearch}
          variant="filled"
        />
        
        {searchResults.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md max-h-48 overflow-y-auto">
            <div className="p-2 text-sm text-gray-500 border-b">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
            {searchResults.map((result, index) => (
              <div 
                key={index}
                className="p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer text-sm"
                onClick={() => {
                  setSearchValue(result);
                  setSearchResults([]);
                }}
              >
                {result}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Try:</strong> Type "John", "Barangay 1", or press Enter to search</p>
          <p><strong>Keyboard:</strong> Press Escape to clear, Enter to search</p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};