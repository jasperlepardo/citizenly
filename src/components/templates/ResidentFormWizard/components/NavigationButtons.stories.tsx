import type { Meta, StoryObj } from '@storybook/react';
import { NavigationButtons } from './NavigationButtons';

const mockAction = (name: string) => () => {
  console.log(`${name} clicked`);
};

const meta = {
  title: 'Templates/ResidentFormWizard/Components/NavigationButtons',
  component: NavigationButtons,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Navigation buttons for the resident form wizard. Provides Previous/Next navigation and Submit functionality with loading states and conditional button visibility based on wizard state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Current step number (1-based)',
    },
    totalSteps: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Total number of steps in the wizard',
    },
    canGoBack: {
      control: { type: 'boolean' },
      description: 'Whether the Previous button should be enabled',
    },
    canProceed: {
      control: { type: 'boolean' },
      description: 'Whether the Next button should be enabled',
    },
    isSubmitting: {
      control: { type: 'boolean' },
      description: 'Whether form submission is in progress',
    },
    onPrevious: {
      description: 'Callback function called when Previous button is clicked',
    },
    onNext: {
      description: 'Callback function called when Next button is clicked',
    },
    onSubmit: {
      description: 'Callback function called when Submit button is clicked',
    },
  },
} satisfies Meta<typeof NavigationButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

// First step
export const FirstStep: Story = {
  args: {
    currentStep: 1,
    totalSteps: 5,
    canGoBack: false,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons on the first step with no Previous button.',
      },
    },
  },
};

// Middle step
export const MiddleStep: Story = {
  args: {
    currentStep: 3,
    totalSteps: 5,
    canGoBack: true,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons on a middle step with both Previous and Next buttons.',
      },
    },
  },
};

// Last step (Submit)
export const LastStep: Story = {
  args: {
    currentStep: 5,
    totalSteps: 5,
    canGoBack: true,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons on the last step showing Submit button instead of Next.',
      },
    },
  },
};

// Cannot proceed
export const CannotProceed: Story = {
  args: {
    currentStep: 2,
    totalSteps: 5,
    canGoBack: true,
    canProceed: false,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons with Next button disabled (validation failed).',
      },
    },
  },
};

// Submitting state
export const Submitting: Story = {
  args: {
    currentStep: 5,
    totalSteps: 5,
    canGoBack: true,
    canProceed: true,
    isSubmitting: true,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons in submitting state with loading spinner.',
      },
    },
  },
};

// Cannot go back
export const CannotGoBack: Story = {
  args: {
    currentStep: 3,
    totalSteps: 5,
    canGoBack: false,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons with Previous button hidden (cannot go back).',
      },
    },
  },
};

// Two-step wizard
export const TwoStepWizard: Story = {
  args: {
    currentStep: 1,
    totalSteps: 2,
    canGoBack: false,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons for a simple two-step wizard.',
      },
    },
  },
};

// Two-step wizard final step
export const TwoStepWizardFinal: Story = {
  args: {
    currentStep: 2,
    totalSteps: 2,
    canGoBack: true,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Final step of a two-step wizard showing Submit button.',
      },
    },
  },
};

// Single step (submit only)
export const SingleStep: Story = {
  args: {
    currentStep: 1,
    totalSteps: 1,
    canGoBack: false,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Single-step form with only Submit button visible.',
      },
    },
  },
};

// Blocked submission
export const BlockedSubmission: Story = {
  args: {
    currentStep: 5,
    totalSteps: 5,
    canGoBack: true,
    canProceed: false,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Last step with Submit button disabled due to validation errors.',
      },
    },
  },
};

// Complex wizard
export const ComplexWizard: Story = {
  args: {
    currentStep: 7,
    totalSteps: 10,
    canGoBack: true,
    canProceed: true,
    isSubmitting: false,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons in a complex 10-step wizard.',
      },
    },
  },
};

// All buttons disabled during processing
export const ProcessingState: Story = {
  args: {
    currentStep: 3,
    totalSteps: 5,
    canGoBack: true,
    canProceed: true,
    isSubmitting: true,
    onPrevious: mockAction('previous'),
    onNext: mockAction('next'),
    onSubmit: mockAction('submit'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Navigation buttons during processing with all buttons disabled.',
      },
    },
  },
};