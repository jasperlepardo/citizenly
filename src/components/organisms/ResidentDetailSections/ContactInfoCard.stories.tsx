import type { Meta, StoryObj } from '@storybook/react';
import ContactInfoCard from './ContactInfoCard';

const meta = {
  title: 'Organisms/ResidentDetailSections/ContactInfoCard',
  component: ContactInfoCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A card component that displays contact information for a resident including email, phone numbers, and household details. Used in resident detail views.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resident: {
      control: { type: 'object' },
      description: 'Resident data object containing contact information',
    },
  },
} satisfies Meta<typeof ContactInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample resident with complete contact data
const sampleResident = {
  email: 'juan.delacruz@gmail.com',
  mobile_number: '+63 912 345 6789',
  telephone_number: '(02) 123-4567',
  household_code: 'HH-001',
  household: {
    name: 'Dela Cruz Family',
    house_number: '123',
    address: '123 Main St, Brgy. Central, Quezon City',
  },
};

// Resident with minimal contact data
const minimalResident = {
  email: '',
  mobile_number: '+63 917 123 4567',
  telephone_number: '',
  household_code: 'HH-002',
  household: {
    name: 'Santos Household',
  },
};

// Resident with no contact data
const emptyResident = {
  email: '',
  mobile_number: '',
  telephone_number: '',
  household_code: '',
  household: {
    name: '',
  },
};

// Business contact resident
const businessResident = {
  email: 'info@businessname.com.ph',
  mobile_number: '+63 999 888 7777',
  telephone_number: '(02) 555-0123',
  household_code: 'HH-003',
  household: {
    name: 'Business Household',
    house_number: '456',
    address: '456 Business Ave, Makati City',
  },
};

// Senior citizen with landline preference
const seniorResident = {
  email: '',
  mobile_number: '',
  telephone_number: '(032) 234-5678',
  household_code: 'HH-004',
  household: {
    name: 'Reyes Senior Household',
    house_number: '789',
    address: '789 Elder St, Brgy. San Jose, Cebu City',
  },
};

// Young professional
const youngProfessionalResident = {
  email: 'maria.santos@yahoo.com',
  mobile_number: '+63 918 765 4321',
  telephone_number: '',
  household_code: 'HH-005',
  household: {
    name: 'Santos Young Professional',
    house_number: '321',
    address: '321 Tech Hub, BGC, Taguig City',
  },
};

// Basic Examples
export const Default: Story = {
  args: {
    resident: sampleResident,
  },
};

export const MinimalContact: Story = {
  args: {
    resident: minimalResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card with minimal information - only mobile number and household name.',
      },
    },
  },
};

export const NoContactInfo: Story = {
  args: {
    resident: emptyResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card with no contact information available.',
      },
    },
  },
};

export const BusinessContact: Story = {
  args: {
    resident: businessResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card for a business-oriented resident with professional contact details.',
      },
    },
  },
};

export const SeniorCitizen: Story = {
  args: {
    resident: seniorResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card for senior citizen who prefers landline over mobile/email.',
      },
    },
  },
};

export const YoungProfessional: Story = {
  args: {
    resident: youngProfessionalResident,
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card for young professional with email and mobile, no landline.',
      },
    },
  },
};

// Different Phone Number Formats
export const PhoneNumberFormats: Story = {
  render: () => {
    const phoneFormats = [
      {
        label: 'International Format',
        resident: {
          ...sampleResident,
          mobile_number: '+63 912 345 6789',
          telephone_number: '+63 2 123 4567',
        },
      },
      {
        label: 'Local Format',
        resident: {
          ...sampleResident,
          mobile_number: '0912 345 6789',
          telephone_number: '(02) 123-4567',
        },
      },
      {
        label: 'Compact Format',
        resident: {
          ...sampleResident,
          mobile_number: '09123456789',
          telephone_number: '021234567',
        },
      },
      {
        label: 'Formatted with Dashes',
        resident: {
          ...sampleResident,
          mobile_number: '0912-345-6789',
          telephone_number: '02-123-4567',
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Phone Number Formats</h3>
        <div className="grid gap-4">
          {phoneFormats.map((format, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {format.label}
              </h4>
              <ContactInfoCard resident={format.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different phone number formatting styles.',
      },
    },
  },
};

// Different Email Types
export const EmailTypes: Story = {
  render: () => {
    const emailTypes = [
      {
        label: 'Personal Gmail',
        resident: { ...sampleResident, email: 'juan.delacruz@gmail.com' },
      },
      {
        label: 'Personal Yahoo',
        resident: { ...sampleResident, email: 'maria.santos@yahoo.com' },
      },
      {
        label: 'Work Email',
        resident: { ...sampleResident, email: 'j.delacruz@company.com' },
      },
      {
        label: 'Government Email',
        resident: { ...sampleResident, email: 'juan.delacruz@gov.ph' },
      },
      {
        label: 'Educational Email',
        resident: { ...sampleResident, email: 'j.delacruz@university.edu.ph' },
      },
      {
        label: 'No Email',
        resident: { ...sampleResident, email: '' },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Different Email Types</h3>
        <div className="grid gap-4">
          {emailTypes.map((type, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {type.label}: {type.resident.email || 'None'}
              </h4>
              <ContactInfoCard resident={type.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different types of email addresses.',
      },
    },
  },
};

// Household Name Variations
export const HouseholdNameVariations: Story = {
  render: () => {
    const householdVariations = [
      {
        label: 'Family Name',
        resident: {
          ...sampleResident,
          household: { name: 'Dela Cruz Family' },
        },
      },
      {
        label: 'Household Description',
        resident: {
          ...sampleResident,
          household: { name: 'Senior Citizens Household' },
        },
      },
      {
        label: 'Extended Family',
        resident: {
          ...sampleResident,
          household: { name: 'Santos-Reyes Extended Family' },
        },
      },
      {
        label: 'Single Person',
        resident: {
          ...sampleResident,
          household: { name: 'Garcia Single Household' },
        },
      },
      {
        label: 'Business Household',
        resident: {
          ...sampleResident,
          household: { name: 'Commercial Building Residents' },
        },
      },
      {
        label: 'No Household Name',
        resident: {
          ...sampleResident,
          household: { name: '' },
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Household Name Variations</h3>
        <div className="grid gap-4">
          {householdVariations.map((variation, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {variation.label}: {variation.resident.household?.name || 'None'}
              </h4>
              <ContactInfoCard resident={variation.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Examples showing different household name formats and types.',
      },
    },
  },
};

// Contact Preference Patterns
export const ContactPreferencePatterns: Story = {
  render: () => {
    const contactPatterns = [
      {
        label: 'Full Contact Info',
        description: 'All contact methods available',
        resident: sampleResident,
      },
      {
        label: 'Mobile Only',
        description: 'Prefers mobile communication',
        resident: {
          ...sampleResident,
          email: '',
          telephone_number: '',
        },
      },
      {
        label: 'Email Only',
        description: 'Digital communication preference',
        resident: {
          ...sampleResident,
          mobile_number: '',
          telephone_number: '',
        },
      },
      {
        label: 'Landline Only',
        description: 'Traditional communication preference',
        resident: {
          ...sampleResident,
          email: '',
          mobile_number: '',
        },
      },
      {
        label: 'No Contact Method',
        description: 'No contact information available',
        resident: emptyResident,
      },
      {
        label: 'Business Communication',
        description: 'Professional contact setup',
        resident: businessResident,
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Contact Preference Patterns</h3>
        <div className="grid gap-4">
          {contactPatterns.map((pattern, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {pattern.label}
              </h4>
              <p className="mb-2 text-xs text-gray-500">{pattern.description}</p>
              <ContactInfoCard resident={pattern.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Different contact preference patterns and communication styles.',
      },
    },
  },
};

// Age-Based Contact Patterns
export const AgeBasedContactPatterns: Story = {
  render: () => {
    const ageBasedPatterns = [
      {
        label: 'Gen Z (Digital Native)',
        resident: {
          email: 'carlos.mendoza@gmail.com',
          mobile_number: '+63 917 888 9999',
          telephone_number: '',
          household_code: 'HH-010',
          household: { name: 'Mendoza Young Adults' },
        },
      },
      {
        label: 'Millennial (Mixed Preference)',
        resident: {
          email: 'maria.santos@yahoo.com',
          mobile_number: '+63 918 765 4321',
          telephone_number: '(02) 456-7890',
          household_code: 'HH-011',
          household: { name: 'Santos Professional Family' },
        },
      },
      {
        label: 'Gen X (Balanced)',
        resident: {
          email: 'juan.garcia@company.com',
          mobile_number: '+63 912 345 6789',
          telephone_number: '(02) 123-4567',
          household_code: 'HH-012',
          household: { name: 'Garcia Family Household' },
        },
      },
      {
        label: 'Baby Boomer (Traditional)',
        resident: {
          email: '',
          mobile_number: '',
          telephone_number: '(032) 234-5678',
          household_code: 'HH-013',
          household: { name: 'Reyes Senior Household' },
        },
      },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Age-Based Contact Patterns</h3>
        <div className="grid gap-4">
          {ageBasedPatterns.map((pattern, index) => (
            <div key={index}>
              <h4 className="mb-2 text-sm font-medium text-gray-600">
                {pattern.label}
              </h4>
              <ContactInfoCard resident={pattern.resident} />
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact patterns typical of different age groups and generations.',
      },
    },
  },
};

// Dark Mode Example
export const DarkMode: Story = {
  args: {
    resident: sampleResident,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2937' }],
    },
    docs: {
      description: {
        story: 'Contact information card in dark mode theme.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};

// Long Contact Information
export const LongContactInfo: Story = {
  args: {
    resident: {
      email: 'very.long.email.address.with.many.parts@government.department.philippines.gov.ph',
      mobile_number: '+63 912 345 6789 (Primary)',
      telephone_number: '(02) 123-4567 ext. 1234',
      household_code: 'HH-VERY-LONG-CODE-001',
      household: {
        name: 'Very Long Household Name with Multiple Family Names and Descriptions',
        house_number: '1234-A',
        address: '1234-A Very Long Street Name, Barangay with Very Long Name, Municipality with Long Name, Province Name, Region',
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Contact card with very long contact information to test layout handling.',
      },
    },
  },
};