import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from './StepIndicator';

const sampleSteps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic personal details',
    isValid: true,
  },
  {
    id: 'contact',
    title: 'Contact & Address',
    description: 'Contact information and address',
    isValid: true,
  },
  {
    id: 'additional',
    title: 'Additional Details',
    description: 'Additional resident information',
    isValid: false,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and submit',
    isValid: false,
  },
];

const meta = {
  title: 'Templates/ResidentFormWizard/Components/StepIndicator',
  component: StepIndicator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step indicator component for the resident form wizard. Shows the current step, completed steps, and remaining steps with visual indicators and step titles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    steps: {
      control: { type: 'object' },
      description: 'Array of form steps with titles and validation status',
    },
    currentStep: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Current active step number (1-based)',
    },
  },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

// First step
export const FirstStep: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator showing the first step as active.',
      },
    },
  },
};

// Second step
export const SecondStep: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator showing the second step as active with first step completed.',
      },
    },
  },
};

// Third step
export const ThirdStep: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator showing the third step as active with previous steps completed.',
      },
    },
  },
};

// Final step
export const FinalStep: Story = {
  args: {
    steps: sampleSteps,
    currentStep: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator showing the final review step as active.',
      },
    },
  },
};

// Two-step wizard
export const TwoStepWizard: Story = {
  args: {
    steps: [
      {
        id: 'info',
        title: 'Information',
        description: 'Basic information',
        isValid: true,
      },
      {
        id: 'submit',
        title: 'Submit',
        description: 'Review and submit',
        isValid: false,
      },
    ],
    currentStep: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator for a simple two-step wizard.',
      },
    },
  },
};

// Two-step wizard final
export const TwoStepWizardFinal: Story = {
  args: {
    steps: [
      {
        id: 'info',
        title: 'Information',
        description: 'Basic information',
        isValid: true,
      },
      {
        id: 'submit',
        title: 'Submit',
        description: 'Review and submit',
        isValid: false,
      },
    ],
    currentStep: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Final step of a two-step wizard.',
      },
    },
  },
};

// Complex wizard
export const ComplexWizard: Story = {
  args: {
    steps: [
      {
        id: 'personal',
        title: 'Personal',
        description: 'Personal information',
        isValid: true,
      },
      {
        id: 'contact',
        title: 'Contact',
        description: 'Contact details',
        isValid: true,
      },
      {
        id: 'address',
        title: 'Address',
        description: 'Address information',
        isValid: true,
      },
      {
        id: 'employment',
        title: 'Employment',
        description: 'Employment details',
        isValid: false,
      },
      {
        id: 'family',
        title: 'Family',
        description: 'Family information',
        isValid: false,
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Document uploads',
        isValid: false,
      },
      {
        id: 'review',
        title: 'Review',
        description: 'Final review',
        isValid: false,
      },
    ],
    currentStep: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator for a complex multi-step wizard.',
      },
    },
  },
};

// Long step titles
export const LongStepTitles: Story = {
  args: {
    steps: [
      {
        id: 'personal',
        title: 'Personal Information & Demographics',
        description: 'Complete personal details and demographic information',
        isValid: true,
      },
      {
        id: 'contact',
        title: 'Contact & Address Information',
        description: 'Contact details and complete address information',
        isValid: true,
      },
      {
        id: 'additional',
        title: 'Additional Details & Requirements',
        description: 'Additional information and special requirements',
        isValid: false,
      },
    ],
    currentStep: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator with longer step titles to test layout handling.',
      },
    },
  },
};

// Short step titles
export const ShortStepTitles: Story = {
  args: {
    steps: [
      {
        id: 'info',
        title: 'Info',
        description: 'Basic info',
        isValid: true,
      },
      {
        id: 'docs',
        title: 'Docs',
        description: 'Documents',
        isValid: false,
      },
      {
        id: 'done',
        title: 'Done',
        description: 'Complete',
        isValid: false,
      },
    ],
    currentStep: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator with very short step titles.',
      },
    },
  },
};

// All completed except last
export const AllCompletedExceptLast: Story = {
  args: {
    steps: sampleSteps.map((step, index) => ({
      ...step,
      isValid: index < sampleSteps.length - 1,
    })),
    currentStep: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator with all steps completed except the final step.',
      },
    },
  },
};

// Single step
export const SingleStep: Story = {
  args: {
    steps: [
      {
        id: 'form',
        title: 'Complete Form',
        description: 'Fill out the required information',
        isValid: false,
      },
    ],
    currentStep: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator for a single-step form.',
      },
    },
  },
};

// Five-step wizard
export const FiveStepWizard: Story = {
  args: {
    steps: [
      {
        id: 'basic',
        title: 'Basic Info',
        description: 'Basic information',
        isValid: true,
      },
      {
        id: 'personal',
        title: 'Personal Details',
        description: 'Personal information',
        isValid: true,
      },
      {
        id: 'contact',
        title: 'Contact Info',
        description: 'Contact information',
        isValid: true,
      },
      {
        id: 'additional',
        title: 'Additional',
        description: 'Additional details',
        isValid: false,
      },
      {
        id: 'confirm',
        title: 'Confirm',
        description: 'Confirm submission',
        isValid: false,
      },
    ],
    currentStep: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Step indicator for a five-step wizard showing third step as active.',
      },
    },
  },
};