import type { Meta, StoryObj } from '@storybook/react';
import { CommandMenuEmpty } from './CommandMenuEmpty';

const meta: Meta<typeof CommandMenuEmpty> = {
  title: 'Molecules/CommandMenu/CommandMenuEmpty',
  component: CommandMenuEmpty,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] max-h-96 border border-gray-200 rounded-lg bg-white">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    query: { control: 'text' },
    className: { control: 'text' },
    children: { control: 'text' },
    onSuggestionClick: { action: 'suggestion-clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};

export const WithNumericQuery: Story = {
  name: 'No Results - Numeric Query',
  args: {
    query: '12345',
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};

export const WithNameQuery: Story = {
  name: 'No Results - Name Query',
  args: {
    query: 'Juan Dela Cruz',
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};

export const WithShortQuery: Story = {
  name: 'No Results - Short Query',
  args: {
    query: 'ab',
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};

export const WithCustomMessage: Story = {
  name: 'Custom Message',
  args: {
    query: 'test',
    children: 'This is a custom empty state message with workflow suggestions below.',
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};

export const WithHouseholdCodeQuery: Story = {
  name: 'No Results - Household Code Query',
  args: {
    query: 'HH-2024-001',
    onSuggestionClick: () => console.log('suggestion clicked'),
  },
};