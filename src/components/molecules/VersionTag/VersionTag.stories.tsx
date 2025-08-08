import type { Meta, StoryObj } from '@storybook/react';
import { VersionTag } from './VersionTag';

const meta: Meta<typeof VersionTag> = {
  title: 'Molecules/VersionTag',
  component: VersionTag,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A version and environment indicator that appears in the corner of the application. Automatically shows version from package.json and detects the current environment.',
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      description: 'Position of the version tag on the screen',
    },
    showEnvironment: {
      control: 'boolean',
      description: 'Whether to show the environment name',
    },
    showVersion: {
      control: 'boolean',
      description: 'Whether to show the version number',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof VersionTag>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock environment variables for Storybook
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
});

export const Development: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: true,
    showVersion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Version tag as it appears in development environment with blue styling.',
      },
    },
  },
  decorators: [
    Story => {
      // Mock development environment
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      return <Story />;
    },
  ],
};

export const Staging: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: true,
    showVersion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Version tag for staging environment with yellow/orange styling.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NEXT_PUBLIC_APP_ENV = 'staging';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      return <Story />;
    },
  ],
};

export const Production: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: true,
    showVersion: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Version tag for production environment with green styling. Note: This is hidden by default in production unless NEXT_PUBLIC_SHOW_VERSION_TAG is set.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      process.env.NEXT_PUBLIC_SHOW_VERSION_TAG = 'true';
      return <Story />;
    },
  ],
};

export const VersionOnly: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: false,
    showVersion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only the version number without environment information.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      return <Story />;
    },
  ],
};

export const EnvironmentOnly: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: true,
    showVersion: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only the environment without version information.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NODE_ENV = 'development';
      return <Story />;
    },
  ],
};

export const AllPositions: Story = {
  args: {
    showEnvironment: true,
    showVersion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all possible positions for the version tag.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      return (
        <div className="relative h-screen">
          <VersionTag position="top-left" />
          <VersionTag position="top-right" />
          <VersionTag position="bottom-left" />
          <VersionTag position="bottom-right" />
        </div>
      );
    },
  ],
};

export const CustomStyling: Story = {
  args: {
    position: 'bottom-right',
    showEnvironment: true,
    showVersion: true,
    className: 'bg-purple-100 text-purple-800 border-purple-200 font-bold',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of custom styling overriding the default environment-based colors.',
      },
    },
  },
  decorators: [
    Story => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_APP_VERSION = '0.2.0';
      return <Story />;
    },
  ],
};
