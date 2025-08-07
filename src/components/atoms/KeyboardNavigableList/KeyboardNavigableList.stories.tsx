import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { KeyboardNavigableList, ListItem } from './KeyboardNavigableList';

// Mock the missing accessibility hook for Storybook
const mockUseArrowKeyNavigation = (length: number, onSelect: (index: number) => void) => {
  return { current: null };
};

// Note: This story may need the actual useArrowKeyNavigation hook implementation
const meta = {
  title: 'Atoms/KeyboardNavigableList',
  component: KeyboardNavigableList,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A keyboard-navigable list component with arrow key navigation support. Supports different roles (listbox, menu, tablist) and orientations. Note: Requires useArrowKeyNavigation hook implementation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: { type: 'select' },
      options: ['listbox', 'menu', 'tablist'],
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    wrap: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof KeyboardNavigableList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock icons for stories
const UserIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FileIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const sampleItems = [
  { id: '1', label: 'Profile', icon: UserIcon, value: 'profile' },
  { id: '2', label: 'Settings', icon: SettingsIcon, value: 'settings' },
  { id: '3', label: 'Documents', icon: FileIcon, value: 'documents' },
  { id: '4', label: 'Disabled Item', disabled: true, value: 'disabled' },
];

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('1');
    
    return (
      <div className="w-64">
        <KeyboardNavigableList
          items={sampleItems}
          selectedId={selected}
          onSelect={(item) => {
            setSelected(item.id);
            console.log('Selected:', item);
          }}
        />
      </div>
    );
  },
};

export const Menu: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('');
    
    const menuItems = [
      { id: 'new', label: 'New File', value: 'new' },
      { id: 'open', label: 'Open...', value: 'open' },
      { id: 'save', label: 'Save', value: 'save' },
      { id: 'separator', label: '---', disabled: true },
      { id: 'exit', label: 'Exit', value: 'exit' },
    ];
    
    return (
      <div className="w-48 border rounded-md bg-white shadow-lg">
        <KeyboardNavigableList
          role="menu"
          items={menuItems}
          selectedId={selected}
          onSelect={(item) => {
            if (item.value !== 'separator') {
              setSelected(item.id);
              console.log('Menu action:', item.value);
            }
          }}
          className="py-1"
        />
      </div>
    );
  },
};

export const HorizontalTabs: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('tab1');
    
    const tabItems = [
      { id: 'tab1', label: 'General', value: 'general' },
      { id: 'tab2', label: 'Security', value: 'security' },
      { id: 'tab3', label: 'Notifications', value: 'notifications' },
      { id: 'tab4', label: 'Advanced', value: 'advanced' },
    ];
    
    return (
      <div className="w-full">
        <div className="border-b">
          <KeyboardNavigableList
            role="tablist"
            orientation="horizontal"
            items={tabItems}
            selectedId={selected}
            onSelect={(item) => {
              setSelected(item.id);
              console.log('Tab selected:', item.value);
            }}
            className="flex border-b-0"
            itemClassName="border-b-2 border-transparent data-[selected=true]:border-blue-500 rounded-none"
          />
        </div>
        
        <div className="p-4 bg-gray-50">
          <p>Content for {tabItems.find(t => t.id === selected)?.label} tab</p>
        </div>
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('');
    
    const iconItems = [
      { 
        id: 'profile', 
        label: 'User Profile', 
        icon: UserIcon,
        value: 'profile' 
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: SettingsIcon,
        value: 'settings' 
      },
      { 
        id: 'documents', 
        label: 'My Documents', 
        icon: FileIcon,
        value: 'documents' 
      },
    ];
    
    return (
      <div className="w-64 border rounded-md">
        <KeyboardNavigableList
          items={iconItems}
          selectedId={selected}
          onSelect={(item) => {
            setSelected(item.id);
            console.log('Selected:', item);
          }}
          className="p-2"
        />
      </div>
    );
  },
};

export const ComposableListItems: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('item1');
    
    return (
      <div className="w-80 border rounded-md" role="listbox">
        <ListItem
          selected={selected === 'item1'}
          onClick={() => setSelected('item1')}
          className="p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              JD
            </div>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-gray-500">john@example.com</div>
            </div>
          </div>
        </ListItem>
        
        <ListItem
          selected={selected === 'item2'}
          onClick={() => setSelected('item2')}
          className="p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              JS
            </div>
            <div>
              <div className="font-medium">Jane Smith</div>
              <div className="text-sm text-gray-500">jane@example.com</div>
            </div>
          </div>
        </ListItem>
        
        <ListItem
          selected={selected === 'item3'}
          disabled
          className="p-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
              BJ
            </div>
            <div>
              <div className="font-medium">Bob Johnson</div>
              <div className="text-sm text-gray-500">Unavailable</div>
            </div>
          </div>
        </ListItem>
      </div>
    );
  },
};

export const LongList: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('');
    
    const longList = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      label: `List Item ${i + 1}`,
      value: `value-${i}`,
      disabled: i === 3 || i === 7, // Disable some items
    }));
    
    return (
      <div className="w-64 max-h-64 overflow-y-auto border rounded-md">
        <KeyboardNavigableList
          items={longList}
          selectedId={selected}
          onSelect={(item) => {
            setSelected(item.id);
            console.log('Selected:', item);
          }}
        />
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [selected, setSelected] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Keyboard Navigation Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Use <kbd className="px-1 py-0.5 bg-gray-100 rounded">↑</kbd> and <kbd className="px-1 py-0.5 bg-gray-100 rounded">↓</kbd> to navigate</li>
            <li>• Use <kbd className="px-1 py-0.5 bg-gray-100 rounded">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded">Space</kbd> to select</li>
            <li>• Focus starts on the first item</li>
          </ul>
        </div>
        
        <div className="w-64 border rounded-md">
          <KeyboardNavigableList
            items={sampleItems}
            selectedId={selected}
            onSelect={(item) => {
              setSelected(item.id);
              setMessage(`Selected: ${item.label}`);
            }}
          />
        </div>
        
        {message && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {message}
          </div>
        )}
      </div>
    );
  },
};