import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MigrationInformation, MigrationInformationData } from './MigrationInformation';

const meta = {
  title: 'Organisms/Form/Resident/MigrationInformation',
  component: MigrationInformation,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form section for collecting internal migration information. Features a searchable barangay selector that cascades geographic codes and fields for migration timeline and status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'object' },
      description: 'Current form values for migration information',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when any field value changes',
    },
    errors: {
      control: { type: 'object' },
      description: 'Error messages for each field',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof MigrationInformation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default empty state
const emptyData: MigrationInformationData = {
  previous_barangay_code: '',
  previous_city_municipality_code: '',
  previous_province_code: '',
  previous_region_code: '',
  length_of_stay_previous_months: undefined,
  reason_for_leaving: '',
  date_of_transfer: '',
  reason_for_transferring: '',
  duration_of_stay_current_months: undefined,
  is_intending_to_return: null,
};

// Sample migration data
const completeMigrationData: MigrationInformationData = {
  previous_barangay_code: '042114001',
  previous_city_municipality_code: '042114000',
  previous_province_code: '042100000',
  previous_region_code: '04',
  length_of_stay_previous_months: 24,
  reason_for_leaving: 'Employment opportunity',
  date_of_transfer: '2022-01-15',
  reason_for_transferring: 'Job relocation to current city',
  duration_of_stay_current_months: 18,
  is_intending_to_return: false,
};

export const Default: Story = {
  args: {
    value: emptyData,
    onChange: () => {},
    errors: {},
  },
};

export const CompleteMigration: Story = {
  args: {
    value: completeMigrationData,
    onChange: () => {},
    errors: {},
  },
};