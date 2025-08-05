import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SelectField } from './SelectField';

const meta: Meta<typeof SelectField> = {
  title: 'UI/SelectField',
  component: SelectField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown select field component with various states and customization options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'error', 'success', 'disabled', 'readonly'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for stories
const countryOptions = [
  { value: '', label: 'Select a country' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
];

const priorityOptions = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
];

const sizeOptions = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

// Interactive wrapper for stories that need state
const InteractiveWrapper = ({ children, ...props }: any) => {
  const [value, setValue] = useState(props.value || '');
  return React.cloneElement(children, {
    ...props,
    value,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setValue(e.target.value),
  });
};

export const Default: Story = {
  args: {
    label: 'Country',
    placeholder: 'Choose your country',
    helperText: 'Select your country of residence',
    options: countryOptions,
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const WithValue: Story = {
  args: {
    label: 'Priority Level',
    helperText: 'Set the priority for this task',
    options: priorityOptions,
    value: 'medium',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const ErrorState: Story = {
  args: {
    label: 'Required Field',
    placeholder: 'Please select an option',
    options: priorityOptions,
    variant: 'error',
    errorMessage: 'This field is required',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const SuccessState: Story = {
  args: {
    label: 'Size Selection',
    options: sizeOptions,
    value: 'md',
    variant: 'success',
    helperText: 'Perfect choice!',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    options: countryOptions,
    value: 'us',
    disabled: true,
    helperText: 'This field cannot be changed',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Field',
    options: priorityOptions,
    value: 'high',
    variant: 'readonly',
    helperText: 'This selection cannot be modified',
  },
};

// Sizes
export const Small: Story = {
  args: {
    label: 'Small Select',
    size: 'sm',
    options: sizeOptions,
    placeholder: 'Choose size',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const Medium: Story = {
  args: {
    label: 'Medium Select',
    size: 'md',
    options: sizeOptions,
    placeholder: 'Choose size (default)',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

export const Large: Story = {
  args: {
    label: 'Large Select',
    size: 'lg',
    options: sizeOptions,
    placeholder: 'Choose size',
  },
  render: (args) => (
    <InteractiveWrapper {...args}>
      <SelectField />
    </InteractiveWrapper>
  ),
};

// All States Showcase
export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <h3 className="text-lg font-semibold">Select Field States</h3>
      
      <SelectField
        label="Default State"
        placeholder="Choose an option..."
        options={priorityOptions}
        helperText="This is a helper text"
      />
      
      <SelectField
        label="Filled State"
        options={priorityOptions}
        value="medium"
        helperText="An option has been selected"
      />
      
      <SelectField
        label="Error State"
        placeholder="Select required option"
        options={priorityOptions}
        variant="error"
        errorMessage="This field is required"
      />
      
      <SelectField
        label="Success State"
        options={priorityOptions}
        value="high"
        variant="success"
        helperText="Great choice!"
      />
      
      <SelectField
        label="Disabled State"
        options={priorityOptions}
        value="low"
        disabled
        helperText="This field is disabled"
      />
      
      <SelectField
        label="Read Only State"
        options={priorityOptions}
        value="urgent"
        variant="readonly"
        helperText="This field is read only"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      country: '',
      priority: '',
      size: 'md',
      category: '',
    });
    
    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };
    
    const categoryOptions = [
      { value: '', label: 'Select category' },
      { value: 'bug', label: 'Bug Report' },
      { value: 'feature', label: 'Feature Request' },
      { value: 'support', label: 'Support' },
      { value: 'question', label: 'Question' },
    ];
    
    return (
      <div className="space-y-4 w-96">
        <h3 className="text-lg font-semibold">Issue Report Form</h3>
        
        <SelectField
          label="Country"
          placeholder="Select your country"
          options={countryOptions}
          value={formData.country}
          onChange={handleChange('country')}
          helperText="This helps us provide localized support"
        />
        
        <SelectField
          label="Issue Category"
          placeholder="What type of issue is this?"
          options={categoryOptions}
          value={formData.category}
          onChange={handleChange('category')}
          variant={!formData.category ? 'error' : 'default'}
          errorMessage={!formData.category ? 'Please select a category' : undefined}
        />
        
        <SelectField
          label="Priority Level"
          options={priorityOptions}
          value={formData.priority}
          onChange={handleChange('priority')}
          helperText="How urgent is this issue?"
        />
        
        <SelectField
          label="Affected Component Size"
          options={sizeOptions}
          value={formData.size}
          onChange={handleChange('size')}
          size="sm"
          helperText="Size of the affected component"
        />
        
        <div className="pt-4 border-t text-sm text-gray-600">
          <p>Form data: {JSON.stringify(formData, null, 2)}</p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

export const NestedOptions: Story = {
  render: () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    
    const categories = [
      { value: '', label: 'Select category' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
    ];
    
    const getItemsForCategory = (category: string) => {
      const items: Record<string, Array<{value: string, label: string}>> = {
        electronics: [
          { value: '', label: 'Select item' },
          { value: 'laptop', label: 'Laptop' },
          { value: 'phone', label: 'Smartphone' },
          { value: 'tablet', label: 'Tablet' },
        ],
        clothing: [
          { value: '', label: 'Select item' },
          { value: 'shirt', label: 'T-Shirt' },
          { value: 'jeans', label: 'Jeans' },
          { value: 'jacket', label: 'Jacket' },
        ],
        books: [
          { value: '', label: 'Select item' },
          { value: 'fiction', label: 'Fiction' },
          { value: 'nonfiction', label: 'Non-Fiction' },
          { value: 'textbook', label: 'Textbook' },
        ],
      };
      return items[category] || [{ value: '', label: 'Select category first' }];
    };
    
    return (
      <div className="space-y-4 w-96">
        <h3 className="text-lg font-semibold">Dependent Dropdowns</h3>
        
        <SelectField
          label="Product Category"
          options={categories}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedItem(''); // Reset item when category changes
          }}
          placeholder="Choose a category"
        />
        
        <SelectField
          label="Product Item"
          options={getItemsForCategory(selectedCategory)}
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          disabled={!selectedCategory}
          placeholder={selectedCategory ? "Choose an item" : "Select category first"}
          helperText={selectedCategory ? "Select a specific item" : "Choose a category above first"}
        />
        
        {selectedCategory && selectedItem && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
            Selected: {selectedCategory} → {selectedItem}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};