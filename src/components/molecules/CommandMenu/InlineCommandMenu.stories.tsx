import type { Meta, StoryObj } from '@storybook/react';
import { InlineCommandMenu } from './InlineCommandMenu';

const meta = {
  title: 'Molecules/CommandMenu/InlineCommandMenu',
  component: InlineCommandMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'An inline command menu that appears as a dropdown from a search input, providing quick access to commands, navigation, and search results.'
      }
    }
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input'
    },
    maxResults: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Maximum number of results to show'
    },
    showShortcuts: {
      control: 'boolean',
      description: 'Whether to show keyboard shortcuts in menu items'
    },
    showRecentSection: {
      control: 'boolean',
      description: 'Whether to show recent items section when no search query'
    },
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the dropdown'
    },
    emptyStateText: {
      control: 'text',
      description: 'Custom text to show when no results are found'
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineCommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search for anything...',
    maxResults: 10,
    showShortcuts: true,
    showRecentSection: true,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    placeholder: 'Search...',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    maxResults: 15,
  },
};

export const NoShortcuts: Story = {
  args: {
    ...Default.args,
    showShortcuts: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu without keyboard shortcut indicators'
      }
    }
  }
};

export const NoRecent: Story = {
  args: {
    ...Default.args,
    showRecentSection: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu without recent items section'
      }
    }
  }
};

export const CustomEmptyState: Story = {
  args: {
    ...Default.args,
    emptyStateText: 'No matching commands found. Try a different search term.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Command menu with custom empty state message'
      }
    }
  }
};

export const InHeaderLayout: Story = {
  args: {
    ...Default.args,
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="w-[497px]">
              <Story />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Header content</span>
            </div>
          </div>
        </div>
        <div className="p-6 text-sm text-gray-600 dark:text-gray-400">
          <p>This shows how the inline command menu appears in a header layout.</p>
          <p className="mt-2">Click the search bar to see the dropdown functionality.</p>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Example of how the inline command menu appears in a typical dashboard header layout'
      }
    }
  }
};