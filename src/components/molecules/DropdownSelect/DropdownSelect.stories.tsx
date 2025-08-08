import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DropdownSelect, DropdownOption } from './DropdownSelect';

const meta = {
  title: 'Molecules/DropdownSelect',
  component: DropdownSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive dropdown select component with search, keyboard navigation, and accessibility features. Supports single selection with various options and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'disabled', 'readonly'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    searchable: {
      control: { type: 'boolean' },
    },
    clearable: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof DropdownSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions: DropdownOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
];

const countriesOptions: DropdownOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'cn', label: 'China' },
];

const optionsWithDescriptions: DropdownOption[] = [
  { 
    value: 'starter', 
    label: 'Starter Plan', 
    description: 'Perfect for individuals and small teams' 
  },
  { 
    value: 'pro', 
    label: 'Pro Plan', 
    description: 'Advanced features for growing businesses' 
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise Plan', 
    description: 'Full-featured plan for large organizations' 
  },
  { 
    value: 'custom', 
    label: 'Custom Plan', 
    description: 'Tailored solutions for specific needs',
    disabled: true 
  },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-80">
        <DropdownSelect
          {...args}
          options={sampleOptions}
          value={value}
          onChange={setValue}
          placeholder="Select a fruit..."
        />
      </div>
    );
  },
  args: {
    label: 'Choose a fruit',
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-80">
        <DropdownSelect
          label="Select Country"
          helperText="Choose your primary location"
          options={countriesOptions}
          value={value}
          onChange={setValue}
          placeholder="Select a country..."
        />
      </div>
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-80">
        <DropdownSelect
          label="Searchable Countries"
          helperText="Start typing to search..."
          options={countriesOptions}
          value={value}
          onChange={setValue}
          placeholder="Type to search countries..."
          searchable
        />
      </div>
    );
  },
};

export const WithDescriptions: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="w-96">
        <DropdownSelect
          label="Choose Plan"
          helperText="Select the plan that best fits your needs"
          options={optionsWithDescriptions}
          value={value}
          onChange={setValue}
          placeholder="Select a plan..."
          maxHeight={300}
        />
      </div>
    );
  },
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState('apple');
    
    return (
      <div className="w-80">
        <DropdownSelect
          label="Clearable Selection"
          helperText="You can clear the selection using the X button"
          options={sampleOptions}
          value={value}
          onChange={setValue}
          placeholder="Select a fruit..."
          clearable
        />
      </div>
    );
  },
};

export const WithIcon: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    const userIcon = (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
    
    return (
      <div className="w-80">
        <DropdownSelect
          label="Select User"
          leftIcon={userIcon}
          options={[
            { value: 'john', label: 'John Doe' },
            { value: 'jane', label: 'Jane Smith' },
            { value: 'bob', label: 'Bob Johnson' },
          ]}
          value={value}
          onChange={setValue}
          placeholder="Choose user..."
        />
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const [value, setValue] = useState('apple');
    
    return (
      <div className="space-y-6 w-80">
        <DropdownSelect
          label="Normal State"
          options={sampleOptions}
          value={value}
          onChange={setValue}
          placeholder="Select option..."
        />
        
        <DropdownSelect
          label="Error State"
          options={sampleOptions}
          value=""
          onChange={() => {}}
          placeholder="Select option..."
          errorMessage="This field is required"
        />
        
        <DropdownSelect
          label="Success State"
          variant="success"
          options={sampleOptions}
          value="apple"
          onChange={() => {}}
          placeholder="Select option..."
          helperText="Great choice!"
        />
        
        <DropdownSelect
          label="Disabled State"
          options={sampleOptions}
          value="apple"
          onChange={() => {}}
          placeholder="Select option..."
          disabled
          helperText="This field is currently disabled"
        />
        
        <DropdownSelect
          label="Loading State"
          options={[]}
          value=""
          onChange={() => {}}
          placeholder="Select option..."
          loading
          helperText="Loading options..."
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [values, setValues] = useState({ sm: '', md: 'banana', lg: '' });
    
    return (
      <div className="space-y-6 w-80">
        <DropdownSelect
          label="Small Size"
          size="sm"
          options={sampleOptions}
          value={values.sm}
          onChange={(v) => setValues(prev => ({ ...prev, sm: v }))}
          placeholder="Small dropdown..."
        />
        
        <DropdownSelect
          label="Medium Size (Default)"
          size="md"
          options={sampleOptions}
          value={values.md}
          onChange={(v) => setValues(prev => ({ ...prev, md: v }))}
          placeholder="Medium dropdown..."
        />
        
        <DropdownSelect
          label="Large Size"
          size="lg"
          options={sampleOptions}
          value={values.lg}
          onChange={(v) => setValues(prev => ({ ...prev, lg: v }))}
          placeholder="Large dropdown..."
        />
      </div>
    );
  },
};

export const LongList: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    // Generate a long list of options
    const longOptions: DropdownOption[] = Array.from({ length: 50 }, (_, i) => ({
      value: `option-${i}`,
      label: `Option ${i + 1}`,
      description: `This is option number ${i + 1}`
    }));
    
    return (
      <div className="w-80">
        <DropdownSelect
          label="Long Options List"
          helperText="Scroll through many options with keyboard navigation"
          options={longOptions}
          value={value}
          onChange={setValue}
          placeholder="Choose from many options..."
          searchable
          maxHeight={200}
        />
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      country: '',
      plan: '',
      user: '',
    });
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newErrors: Record<string, string> = {};
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.plan) newErrors.plan = 'Plan is required';
      if (!formData.user) newErrors.user = 'User is required';
      
      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!');
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="w-96 space-y-6">
        <DropdownSelect
          label="Country"
          options={countriesOptions}
          value={formData.country}
          onChange={(v) => setFormData(prev => ({ ...prev, country: v }))}
          placeholder="Select your country..."
          errorMessage={errors.country}
          clearable
          searchable
        />
        
        <DropdownSelect
          label="Plan"
          options={optionsWithDescriptions}
          value={formData.plan}
          onChange={(v) => setFormData(prev => ({ ...prev, plan: v }))}
          placeholder="Choose a plan..."
          errorMessage={errors.plan}
          helperText="You can change your plan later"
        />
        
        <DropdownSelect
          label="Assign to User"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          options={[
            { value: 'john', label: 'John Doe', description: 'Administrator' },
            { value: 'jane', label: 'Jane Smith', description: 'Manager' },
            { value: 'bob', label: 'Bob Johnson', description: 'User' },
          ]}
          value={formData.user}
          onChange={(v) => setFormData(prev => ({ ...prev, user: v }))}
          placeholder="Select user..."
          errorMessage={errors.user}
          clearable
        />
        
        <div className="flex gap-4">
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
          <button 
            type="button"
            onClick={() => {
              setFormData({ country: '', plan: '', user: '' });
              setErrors({});
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [value, setValue] = useState('');
    
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Keyboard Navigation</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Tab</kbd> to focus the dropdown</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Space</kbd> or <kbd className="px-1 py-0.5 bg-blue-100 rounded">Enter</kbd> to open</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">↑</kbd><kbd className="px-1 py-0.5 bg-blue-100 rounded">↓</kbd> to navigate options</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Enter</kbd> to select</li>
            <li>• <kbd className="px-1 py-0.5 bg-blue-100 rounded">Esc</kbd> to close</li>
            <li>• Type letters for quick navigation</li>
          </ul>
        </div>
        
        <div className="w-80">
          <DropdownSelect
            label="Fully Accessible Dropdown"
            helperText="Try using keyboard navigation"
            options={countriesOptions}
            value={value}
            onChange={setValue}
            placeholder="Select a country..."
            searchable
            clearable
          />
        </div>
      </div>
    );
  },
};