import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with customizable icons and states. Part of the RBI System atomic design components.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'active', 'filled', 'error', 'disabled']
    },
    showBefore: {
      control: 'boolean'
    },
    showAfter: {
      control: 'boolean'
    },
    beforeIcon: {
      control: false
    },
    afterIcon: {
      control: false
    },
    placeholder: {
      control: 'text'
    },
    error: {
      control: 'text'
    }
  }
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    showBefore: true,
    showAfter: true,
    state: 'default'
  }
}

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Search for residents...',
    showBefore: true,
    showAfter: true,
    state: 'default'
  }
}

export const NoIcons: Story = {
  args: {
    placeholder: 'Simple input',
    showBefore: false,
    showAfter: false,
    state: 'default'
  }
}

export const BeforeIconOnly: Story = {
  args: {
    placeholder: 'Search...',
    showBefore: true,
    showAfter: false,
    state: 'default'
  }
}

export const AfterIconOnly: Story = {
  args: {
    placeholder: 'Type and clear',
    showBefore: false,
    showAfter: true,
    state: 'default'
  }
}

export const ErrorState: Story = {
  args: {
    placeholder: 'Enter valid email',
    showBefore: true,
    showAfter: true,
    state: 'error',
    error: 'Please enter a valid email address'
  }
}

export const WithErrorMessage: Story = {
  args: {
    placeholder: 'Required field',
    showBefore: true,
    showAfter: true,
    error: 'This field is required'
  }
}

export const DisabledState: Story = {
  args: {
    placeholder: 'Disabled input',
    showBefore: true,
    showAfter: true,
    state: 'disabled',
    disabled: true
  }
}

export const CustomIcons: Story = {
  args: {
    placeholder: 'Custom icons example',
    showBefore: true,
    showAfter: true,
    beforeIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    afterIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  }
}

export const Filled: Story = {
  args: {
    placeholder: 'Enter text...',
    showBefore: true,
    showAfter: true,
    state: 'filled',
    defaultValue: 'John Doe'
  }
}

export const Active: Story = {
  args: {
    placeholder: 'Focused input',
    showBefore: true,
    showAfter: true,
    state: 'active',
    autoFocus: true
  }
}