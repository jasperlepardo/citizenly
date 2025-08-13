import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta = {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A search input component with optional clear functionality, custom icons, and keyboard shortcuts. Supports Enter to search and Escape to clear.',
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
    showClearButton: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    placeholder: {
      control: { type: 'text' },
    },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState('');

    return (
      <div className="w-80">
        <SearchBar
          {...args}
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
          onSearch={searchValue => console.log('Searching for:', searchValue)}
        />
      </div>
    );
  },
  args: {
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('React components');

    return (
      <div className="w-80">
        <SearchBar
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
          onSearch={searchValue => console.log('Searching for:', searchValue)}
          placeholder="Search components..."
        />
      </div>
    );
  },
};

export const CustomIcon: Story = {
  render: () => {
    const [value, setValue] = useState('');

    const customIcon = (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    );

    return (
      <div className="w-80">
        <SearchBar
          value={value}
          onChange={e => setValue(e.target.value)}
          onClear={() => setValue('')}
          leftIcon={customIcon}
          placeholder="Search by tags..."
          onSearch={searchValue => console.log('Tag search:', searchValue)}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [values, setValues] = useState({ sm: '', md: '', lg: '' });

    const updateValue = (size: 'sm' | 'md' | 'lg', newValue: string) => {
      setValues(prev => ({ ...prev, [size]: newValue }));
    };

    return (
      <div className="w-80 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Small</label>
          <SearchBar
            size="sm"
            value={values.sm}
            onChange={e => updateValue('sm', e.target.value)}
            onClear={() => updateValue('sm', '')}
            placeholder="Small search..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Medium (Default)</label>
          <SearchBar
            size="md"
            value={values.md}
            onChange={e => updateValue('md', e.target.value)}
            onClear={() => updateValue('md', '')}
            placeholder="Medium search..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Large</label>
          <SearchBar
            size="lg"
            value={values.lg}
            onChange={e => updateValue('lg', e.target.value)}
            onClear={() => updateValue('lg', '')}
            placeholder="Large search..."
          />
        </div>
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [values, setValues] = useState({ default: '', filled: '', outlined: '' });

    const updateValue = (variant: 'default' | 'filled' | 'outlined', newValue: string) => {
      setValues(prev => ({ ...prev, [variant]: newValue }));
    };

    return (
      <div className="w-80 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Default</label>
          <SearchBar
            variant="default"
            value={values.default}
            onChange={e => updateValue('default', e.target.value)}
            onClear={() => updateValue('default', '')}
            placeholder="Default search..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Filled</label>
          <SearchBar
            variant="filled"
            value={values.filled}
            onChange={e => updateValue('filled', e.target.value)}
            onClear={() => updateValue('filled', '')}
            placeholder="Filled search..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Outlined</label>
          <SearchBar
            variant="outlined"
            value={values.outlined}
            onChange={e => updateValue('outlined', e.target.value)}
            onClear={() => updateValue('outlined', '')}
            placeholder="Outlined search..."
          />
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Normal</label>
        <SearchBar placeholder="Normal search bar" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">With Text</label>
        <SearchBar value="Search query" placeholder="Search..." onChange={() => {}} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Disabled</label>
        <SearchBar value="Disabled search" placeholder="Search..." disabled onChange={() => {}} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Without Clear Button</label>
        <SearchBar
          value="No clear button"
          placeholder="Search..."
          showClearButton={false}
          onChange={() => {}}
        />
      </div>
    </div>
  ),
};

export const SearchExample: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Mock data
    const mockData = [
      'React',
      'Vue.js',
      'Angular',
      'Svelte',
      'Next.js',
      'Nuxt.js',
      'Gatsby',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Express',
      'Fastify',
      'MongoDB',
      'PostgreSQL',
      'Redis',
    ];

    const performSearch = async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const filtered = mockData.filter(item => item.toLowerCase().includes(query.toLowerCase()));

      setResults(filtered);
      setIsSearching(false);
    };

    const handleSearch = (query: string) => {
      performSearch(query);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      // Debounced search as user types
      performSearch(e.target.value);
    };

    const handleClear = () => {
      setSearchTerm('');
      setResults([]);
      setIsSearching(false);
    };

    return (
      <div className="w-80">
        <SearchBar
          value={searchTerm}
          onChange={handleInputChange}
          onSearch={handleSearch}
          onClear={handleClear}
          placeholder="Search technologies..."
        />

        {isSearching && (
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">Searching...</div>
        )}

        {results.length > 0 && !isSearching && (
          <div className="mt-4 rounded-md border">
            <div className="border-b bg-gray-50 p-2 text-sm font-medium text-gray-700">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            <ul className="divide-y">
              {results.map((result, index) => (
                <li key={index} className="cursor-pointer p-3 hover:bg-gray-50">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchTerm && results.length === 0 && !isSearching && (
          <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>
    );
  },
};

export const FilterExample: Story = {
  render: () => {
    const [filter, setFilter] = useState('');

    const items = [
      { id: 1, name: 'Apple iPhone 14', category: 'Electronics', price: 999 },
      { id: 2, name: 'Samsung Galaxy S23', category: 'Electronics', price: 899 },
      { id: 3, name: 'MacBook Pro', category: 'Computers', price: 1999 },
      { id: 4, name: 'iPad Air', category: 'Tablets', price: 599 },
      { id: 5, name: 'AirPods Pro', category: 'Audio', price: 249 },
      { id: 6, name: 'Sony WH-1000XM4', category: 'Audio', price: 349 },
    ];

    const filteredItems = items.filter(
      item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase())
    );

    return (
      <div className="w-full max-w-md">
        <SearchBar
          value={filter}
          onChange={e => setFilter(e.target.value)}
          onClear={() => setFilter('')}
          placeholder="Filter products..."
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
              />
            </svg>
          }
        />

        <div className="mt-4">
          <p className="mb-3 text-sm text-gray-600">
            {filteredItems.length} of {items.length} products
          </p>

          <div className="space-y-2">
            {filteredItems.map(item => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <span className="font-semibold">${item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-lg font-semibold text-blue-800">Keyboard Shortcuts</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>
              • <kbd className="rounded bg-blue-100 px-1 py-0.5">Enter</kbd> to perform search
            </li>
            <li>
              • <kbd className="rounded bg-blue-100 px-1 py-0.5">Escape</kbd> to clear and blur
            </li>
            <li>• Clear button is excluded from tab order (tabindex="-1")</li>
            <li>• Proper ARIA labels for screen readers</li>
          </ul>
        </div>

        <div className="w-80">
          <SearchBar
            value={value}
            onChange={e => setValue(e.target.value)}
            onClear={() => setValue('')}
            onSearch={searchValue => {
              console.log('Search performed:', searchValue);
              alert(`Searching for: "${searchValue}"`);
            }}
            placeholder="Try typing and pressing Enter..."
          />

          <p className="mt-2 text-sm text-gray-600">
            Type something and press Enter to search, or Escape to clear.
          </p>
        </div>
      </div>
    );
  },
};
