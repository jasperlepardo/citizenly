import type { Meta, StoryObj } from '@storybook/react';
import PopulationPyramid from './PopulationPyramid';

const meta = {
  title: 'Dashboard/PopulationPyramid',
  component: PopulationPyramid,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An interactive population pyramid showing age and gender distribution in Filipino barangays. Features animated bars, tooltips, clickable age groups, and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of age group data with male/female counts and percentages',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onAgeGroupClick: {
      action: 'ageGroupClicked',
      description: 'Callback fired when an age group is clicked',
    },
  },
} satisfies Meta<typeof PopulationPyramid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Typical Filipino barangay population structure
export const TypicalBarangay: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 124, female: 118, malePercentage: 4.4, femalePercentage: 4.1 },
      { ageRange: '5-9', male: 142, female: 134, malePercentage: 5.0, femalePercentage: 4.7 },
      { ageRange: '10-14', male: 156, female: 148, malePercentage: 5.5, femalePercentage: 5.2 },
      { ageRange: '15-19', male: 167, female: 178, malePercentage: 5.9, femalePercentage: 6.3 },
      { ageRange: '20-24', male: 189, female: 203, malePercentage: 6.6, femalePercentage: 7.1 },
      { ageRange: '25-29', male: 178, female: 189, malePercentage: 6.3, femalePercentage: 6.6 },
      { ageRange: '30-34', male: 167, female: 178, malePercentage: 5.9, femalePercentage: 6.3 },
      { ageRange: '35-39', male: 145, female: 156, malePercentage: 5.1, femalePercentage: 5.5 },
      { ageRange: '40-44', male: 134, female: 145, malePercentage: 4.7, femalePercentage: 5.1 },
      { ageRange: '45-49', male: 123, female: 134, malePercentage: 4.3, femalePercentage: 4.7 },
      { ageRange: '50-54', male: 112, female: 123, malePercentage: 3.9, femalePercentage: 4.3 },
      { ageRange: '55-59', male: 98, female: 112, malePercentage: 3.4, femalePercentage: 3.9 },
      { ageRange: '60-64', male: 87, female: 98, malePercentage: 3.1, femalePercentage: 3.4 },
      { ageRange: '65-69', male: 78, female: 89, malePercentage: 2.7, femalePercentage: 3.1 },
      { ageRange: '70-74', male: 67, female: 78, malePercentage: 2.4, femalePercentage: 2.7 },
      { ageRange: '75-79', male: 45, female: 67, malePercentage: 1.6, femalePercentage: 2.4 },
      { ageRange: '80-84', male: 34, female: 56, malePercentage: 1.2, femalePercentage: 2.0 },
      { ageRange: '85-89', male: 23, female: 34, malePercentage: 0.8, femalePercentage: 1.2 },
      { ageRange: '90-94', male: 12, female: 23, malePercentage: 0.4, femalePercentage: 0.8 },
      { ageRange: '95-99', male: 5, female: 12, malePercentage: 0.2, femalePercentage: 0.4 },
      { ageRange: '100+', male: 1, female: 3, malePercentage: 0.0, femalePercentage: 0.1 },
    ],
  },
};

// Young population (high birth rate area)
export const YoungPopulation: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 234, female: 218, malePercentage: 8.2, femalePercentage: 7.7 },
      { ageRange: '5-9', male: 221, female: 207, malePercentage: 7.8, femalePercentage: 7.3 },
      { ageRange: '10-14', male: 198, female: 189, malePercentage: 7.0, femalePercentage: 6.7 },
      { ageRange: '15-19', male: 187, female: 198, malePercentage: 6.6, femalePercentage: 7.0 },
      { ageRange: '20-24', male: 178, female: 189, malePercentage: 6.3, femalePercentage: 6.7 },
      { ageRange: '25-29', male: 167, female: 178, malePercentage: 5.9, femalePercentage: 6.3 },
      { ageRange: '30-34', male: 156, female: 167, malePercentage: 5.5, femalePercentage: 5.9 },
      { ageRange: '35-39', male: 145, female: 156, malePercentage: 5.1, femalePercentage: 5.5 },
      { ageRange: '40-44', male: 123, female: 134, malePercentage: 4.3, femalePercentage: 4.7 },
      { ageRange: '45-49', male: 98, female: 112, malePercentage: 3.5, femalePercentage: 3.9 },
      { ageRange: '50-54', male: 87, female: 98, malePercentage: 3.1, femalePercentage: 3.5 },
      { ageRange: '55-59', male: 76, female: 87, malePercentage: 2.7, femalePercentage: 3.1 },
      { ageRange: '60-64', male: 65, female: 76, malePercentage: 2.3, femalePercentage: 2.7 },
      { ageRange: '65-69', male: 45, female: 56, malePercentage: 1.6, femalePercentage: 2.0 },
      { ageRange: '70-74', male: 34, female: 45, malePercentage: 1.2, femalePercentage: 1.6 },
      { ageRange: '75-79', male: 23, female: 34, malePercentage: 0.8, femalePercentage: 1.2 },
      { ageRange: '80+', male: 15, female: 25, malePercentage: 0.5, femalePercentage: 0.9 },
    ],
  },
};

// Aging population (out-migration of youth)
export const AgingPopulation: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 67, female: 62, malePercentage: 2.4, femalePercentage: 2.2 },
      { ageRange: '5-9', male: 78, female: 73, malePercentage: 2.8, femalePercentage: 2.6 },
      { ageRange: '10-14', male: 89, female: 84, malePercentage: 3.2, femalePercentage: 3.0 },
      { ageRange: '15-19', male: 98, female: 103, malePercentage: 3.5, femalePercentage: 3.7 },
      { ageRange: '20-24', male: 76, female: 87, malePercentage: 2.7, femalePercentage: 3.1 },
      { ageRange: '25-29', male: 65, female: 78, malePercentage: 2.3, femalePercentage: 2.8 },
      { ageRange: '30-34', male: 87, female: 98, malePercentage: 3.1, femalePercentage: 3.5 },
      { ageRange: '35-39', male: 123, female: 134, malePercentage: 4.4, femalePercentage: 4.8 },
      { ageRange: '40-44', male: 145, female: 156, malePercentage: 5.2, femalePercentage: 5.6 },
      { ageRange: '45-49', male: 167, female: 178, malePercentage: 6.0, femalePercentage: 6.4 },
      { ageRange: '50-54', male: 189, female: 203, malePercentage: 6.8, femalePercentage: 7.3 },
      { ageRange: '55-59', male: 198, female: 221, malePercentage: 7.1, femalePercentage: 7.9 },
      { ageRange: '60-64', male: 187, female: 218, malePercentage: 6.7, femalePercentage: 7.8 },
      { ageRange: '65-69', male: 156, female: 198, malePercentage: 5.6, femalePercentage: 7.1 },
      { ageRange: '70-74', male: 134, female: 178, malePercentage: 4.8, femalePercentage: 6.4 },
      { ageRange: '75-79', male: 112, female: 156, malePercentage: 4.0, femalePercentage: 5.6 },
      { ageRange: '80-84', male: 87, female: 134, malePercentage: 3.1, femalePercentage: 4.8 },
      { ageRange: '85+', male: 65, female: 123, malePercentage: 2.3, femalePercentage: 4.4 },
    ],
  },
};

// Urban professional area (rectangular pyramid)
export const UrbanProfessional: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 89, female: 84, malePercentage: 3.1, femalePercentage: 2.9 },
      { ageRange: '5-9', male: 98, female: 93, malePercentage: 3.4, femalePercentage: 3.2 },
      { ageRange: '10-14', male: 107, female: 102, malePercentage: 3.7, femalePercentage: 3.6 },
      { ageRange: '15-19', male: 123, female: 118, malePercentage: 4.3, femalePercentage: 4.1 },
      { ageRange: '20-24', male: 234, female: 267, malePercentage: 8.2, femalePercentage: 9.4 },
      { ageRange: '25-29', male: 298, female: 334, malePercentage: 10.5, femalePercentage: 11.7 },
      { ageRange: '30-34', male: 278, female: 312, malePercentage: 9.8, femalePercentage: 11.0 },
      { ageRange: '35-39', male: 234, female: 267, malePercentage: 8.2, femalePercentage: 9.4 },
      { ageRange: '40-44', male: 198, female: 221, malePercentage: 7.0, femalePercentage: 7.8 },
      { ageRange: '45-49', male: 167, female: 189, malePercentage: 5.9, femalePercentage: 6.6 },
      { ageRange: '50-54', male: 145, female: 167, malePercentage: 5.1, femalePercentage: 5.9 },
      { ageRange: '55-59', male: 123, female: 145, malePercentage: 4.3, femalePercentage: 5.1 },
      { ageRange: '60-64', male: 89, female: 107, malePercentage: 3.1, femalePercentage: 3.8 },
      { ageRange: '65-69', male: 67, female: 89, malePercentage: 2.4, femalePercentage: 3.1 },
      { ageRange: '70-74', male: 45, female: 67, malePercentage: 1.6, femalePercentage: 2.4 },
      { ageRange: '75+', male: 34, female: 56, malePercentage: 1.2, femalePercentage: 2.0 },
    ],
  },
};

// Rural agricultural area (traditional pyramid)
export const RuralAgricultural: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 167, female: 156, malePercentage: 5.9, femalePercentage: 5.5 },
      { ageRange: '5-9', male: 178, female: 167, malePercentage: 6.3, femalePercentage: 5.9 },
      { ageRange: '10-14', male: 189, female: 178, malePercentage: 6.7, femalePercentage: 6.3 },
      { ageRange: '15-19', male: 198, female: 189, malePercentage: 7.0, femalePercentage: 6.7 },
      { ageRange: '20-24', male: 187, female: 198, malePercentage: 6.6, femalePercentage: 7.0 },
      { ageRange: '25-29', male: 178, female: 189, malePercentage: 6.3, femalePercentage: 6.7 },
      { ageRange: '30-34', male: 167, female: 178, malePercentage: 5.9, femalePercentage: 6.3 },
      { ageRange: '35-39', male: 156, female: 167, malePercentage: 5.5, femalePercentage: 5.9 },
      { ageRange: '40-44', male: 145, female: 156, malePercentage: 5.1, femalePercentage: 5.5 },
      { ageRange: '45-49', male: 134, female: 145, malePercentage: 4.7, femalePercentage: 5.1 },
      { ageRange: '50-54', male: 123, female: 134, malePercentage: 4.3, femalePercentage: 4.7 },
      { ageRange: '55-59', male: 112, female: 123, malePercentage: 3.9, femalePercentage: 4.3 },
      { ageRange: '60-64', male: 98, female: 112, malePercentage: 3.5, femalePercentage: 3.9 },
      { ageRange: '65-69', male: 87, female: 98, malePercentage: 3.1, femalePercentage: 3.5 },
      { ageRange: '70-74', male: 76, female: 87, malePercentage: 2.7, femalePercentage: 3.1 },
      { ageRange: '75-79', male: 56, female: 76, malePercentage: 2.0, femalePercentage: 2.7 },
      { ageRange: '80+', male: 34, female: 67, malePercentage: 1.2, femalePercentage: 2.4 },
    ],
  },
};

// Mining community (male-skewed working age)
export const MiningCommunity: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 123, female: 118, malePercentage: 4.3, femalePercentage: 4.1 },
      { ageRange: '5-9', male: 134, female: 129, malePercentage: 4.7, femalePercentage: 4.5 },
      { ageRange: '10-14', male: 145, female: 140, malePercentage: 5.1, femalePercentage: 4.9 },
      { ageRange: '15-19', male: 156, female: 134, malePercentage: 5.5, femalePercentage: 4.7 },
      { ageRange: '20-24', male: 289, female: 198, malePercentage: 10.2, femalePercentage: 7.0 },
      { ageRange: '25-29', male: 334, female: 221, malePercentage: 11.8, femalePercentage: 7.8 },
      { ageRange: '30-34', male: 312, female: 207, malePercentage: 11.0, femalePercentage: 7.3 },
      { ageRange: '35-39', male: 278, female: 189, malePercentage: 9.8, femalePercentage: 6.7 },
      { ageRange: '40-44', male: 234, female: 167, malePercentage: 8.2, femalePercentage: 5.9 },
      { ageRange: '45-49', male: 198, female: 145, malePercentage: 7.0, femalePercentage: 5.1 },
      { ageRange: '50-54', male: 167, female: 123, malePercentage: 5.9, femalePercentage: 4.3 },
      { ageRange: '55-59', male: 134, female: 98, malePercentage: 4.7, femalePercentage: 3.5 },
      { ageRange: '60-64', male: 98, female: 76, malePercentage: 3.5, femalePercentage: 2.7 },
      { ageRange: '65-69', male: 67, female: 56, malePercentage: 2.4, femalePercentage: 2.0 },
      { ageRange: '70+', male: 45, female: 67, malePercentage: 1.6, femalePercentage: 2.4 },
    ],
  },
};

// University area (youth bulge)
export const UniversityArea: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 56, female: 52, malePercentage: 2.0, femalePercentage: 1.8 },
      { ageRange: '5-9', male: 67, female: 63, malePercentage: 2.4, femalePercentage: 2.2 },
      { ageRange: '10-14', male: 78, female: 74, malePercentage: 2.8, femalePercentage: 2.6 },
      { ageRange: '15-19', male: 298, female: 334, malePercentage: 10.5, femalePercentage: 11.8 },
      { ageRange: '20-24', male: 387, female: 423, malePercentage: 13.6, femalePercentage: 14.9 },
      { ageRange: '25-29', male: 234, female: 267, malePercentage: 8.2, femalePercentage: 9.4 },
      { ageRange: '30-34', male: 145, female: 167, malePercentage: 5.1, femalePercentage: 5.9 },
      { ageRange: '35-39', male: 123, female: 134, malePercentage: 4.3, femalePercentage: 4.7 },
      { ageRange: '40-44', male: 98, female: 112, malePercentage: 3.5, femalePercentage: 3.9 },
      { ageRange: '45-49', male: 87, female: 98, malePercentage: 3.1, femalePercentage: 3.5 },
      { ageRange: '50-54', male: 76, female: 87, malePercentage: 2.7, femalePercentage: 3.1 },
      { ageRange: '55-59', male: 65, female: 76, malePercentage: 2.3, femalePercentage: 2.7 },
      { ageRange: '60+', male: 89, female: 134, malePercentage: 3.1, femalePercentage: 4.7 },
    ],
  },
};

// Small island community (outmigration)
export const IslandCommunity: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 34, female: 32, malePercentage: 4.6, femalePercentage: 4.3 },
      { ageRange: '5-9', male: 42, female: 39, malePercentage: 5.7, femalePercentage: 5.3 },
      { ageRange: '10-14', male: 48, female: 45, malePercentage: 6.5, femalePercentage: 6.1 },
      { ageRange: '15-19', male: 23, female: 28, malePercentage: 3.1, femalePercentage: 3.8 },
      { ageRange: '20-24', male: 18, female: 21, malePercentage: 2.4, femalePercentage: 2.8 },
      { ageRange: '25-29', male: 15, female: 18, malePercentage: 2.0, femalePercentage: 2.4 },
      { ageRange: '30-34', male: 21, female: 25, malePercentage: 2.8, femalePercentage: 3.4 },
      { ageRange: '35-39', male: 28, female: 32, malePercentage: 3.8, femalePercentage: 4.3 },
      { ageRange: '40-44', male: 35, female: 39, malePercentage: 4.7, femalePercentage: 5.3 },
      { ageRange: '45-49', male: 42, female: 45, malePercentage: 5.7, femalePercentage: 6.1 },
      { ageRange: '50-54', male: 48, female: 52, malePercentage: 6.5, femalePercentage: 7.0 },
      { ageRange: '55-59', male: 45, female: 58, malePercentage: 6.1, femalePercentage: 7.8 },
      { ageRange: '60-64', male: 39, female: 52, malePercentage: 5.3, femalePercentage: 7.0 },
      { ageRange: '65-69', male: 32, female: 45, malePercentage: 4.3, femalePercentage: 6.1 },
      { ageRange: '70+', male: 28, female: 48, malePercentage: 3.8, femalePercentage: 6.5 },
    ],
  },
};

// Empty data
export const EmptyData: Story = {
  args: {
    data: [],
  },
};

// Single age group
export const SingleAgeGroup: Story = {
  args: {
    data: [
      { ageRange: '25-29', male: 500, female: 450, malePercentage: 52.6, femalePercentage: 47.4 },
    ],
  },
};

// With zero values in some groups
export const WithZeroValues: Story = {
  args: {
    data: [
      { ageRange: '0-4', male: 124, female: 118, malePercentage: 8.7, femalePercentage: 8.4 },
      { ageRange: '5-9', male: 142, female: 134, malePercentage: 10.2, femalePercentage: 9.6 },
      { ageRange: '10-14', male: 0, female: 0, malePercentage: 0.0, femalePercentage: 0.0 },
      { ageRange: '15-19', male: 167, female: 178, malePercentage: 12.0, femalePercentage: 12.7 },
      { ageRange: '20-24', male: 189, female: 203, malePercentage: 13.6, femalePercentage: 14.5 },
      { ageRange: '25-29', male: 178, female: 0, malePercentage: 12.8, femalePercentage: 0.0 },
      { ageRange: '30-34', male: 167, female: 178, malePercentage: 12.0, femalePercentage: 12.7 },
      { ageRange: '35-39', male: 145, female: 156, malePercentage: 10.4, femalePercentage: 11.1 },
      { ageRange: '40+', male: 0, female: 134, malePercentage: 0.0, femalePercentage: 9.6 },
    ],
  },
};

// Comparative analysis
export const RegionalComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-gray-50 min-h-screen">
      <PopulationPyramid
        data={[
          { ageRange: '0-4', male: 234, female: 218, malePercentage: 8.2, femalePercentage: 7.7 },
          { ageRange: '5-9', male: 221, female: 207, malePercentage: 7.8, femalePercentage: 7.3 },
          { ageRange: '10-14', male: 198, female: 189, malePercentage: 7.0, femalePercentage: 6.7 },
          { ageRange: '15-19', male: 187, female: 198, malePercentage: 6.6, femalePercentage: 7.0 },
          { ageRange: '20-24', male: 178, female: 189, malePercentage: 6.3, femalePercentage: 6.7 },
          { ageRange: '25-29', male: 167, female: 178, malePercentage: 5.9, femalePercentage: 6.3 },
          { ageRange: '30-34', male: 156, female: 167, malePercentage: 5.5, femalePercentage: 5.9 },
          { ageRange: '35-39', male: 145, female: 156, malePercentage: 5.1, femalePercentage: 5.5 },
          { ageRange: '40-44', male: 123, female: 134, malePercentage: 4.3, femalePercentage: 4.7 },
          { ageRange: '45-49', male: 98, female: 112, malePercentage: 3.5, femalePercentage: 3.9 },
          { ageRange: '50+', male: 234, female: 289, malePercentage: 8.3, femalePercentage: 10.2 },
        ]}
      />
      <PopulationPyramid
        data={[
          { ageRange: '0-4', male: 89, female: 84, malePercentage: 3.1, femalePercentage: 2.9 },
          { ageRange: '5-9', male: 98, female: 93, malePercentage: 3.4, femalePercentage: 3.2 },
          { ageRange: '10-14', male: 107, female: 102, malePercentage: 3.7, femalePercentage: 3.6 },
          { ageRange: '15-19', male: 123, female: 118, malePercentage: 4.3, femalePercentage: 4.1 },
          { ageRange: '20-24', male: 234, female: 267, malePercentage: 8.2, femalePercentage: 9.4 },
          { ageRange: '25-29', male: 298, female: 334, malePercentage: 10.5, femalePercentage: 11.7 },
          { ageRange: '30-34', male: 278, female: 312, malePercentage: 9.8, femalePercentage: 11.0 },
          { ageRange: '35-39', male: 234, female: 267, malePercentage: 8.2, femalePercentage: 9.4 },
          { ageRange: '40-44', male: 198, female: 221, malePercentage: 7.0, femalePercentage: 7.8 },
          { ageRange: '45-49', male: 167, female: 189, malePercentage: 5.9, femalePercentage: 6.6 },
          { ageRange: '50+', male: 456, female: 567, malePercentage: 16.0, femalePercentage: 19.9 },
        ]}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Different community types
export const CommunityTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-center">Rural Agricultural</h3>
        <PopulationPyramid
          data={[
            { ageRange: '0-14', male: 234, female: 218, malePercentage: 16.5, femalePercentage: 15.4 },
            { ageRange: '15-29', male: 298, female: 312, malePercentage: 21.0, femalePercentage: 22.0 },
            { ageRange: '30-44', male: 267, female: 278, malePercentage: 18.8, femalePercentage: 19.6 },
            { ageRange: '45-59', male: 189, female: 203, malePercentage: 13.3, femalePercentage: 14.3 },
            { ageRange: '60+', male: 156, female: 234, malePercentage: 11.0, femalePercentage: 16.5 },
          ]}
          className="h-96"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-center">Urban Professional</h3>
        <PopulationPyramid
          data={[
            { ageRange: '0-14', male: 145, female: 134, malePercentage: 10.2, femalePercentage: 9.4 },
            { ageRange: '15-29', male: 423, female: 456, malePercentage: 29.8, femalePercentage: 32.1 },
            { ageRange: '30-44', male: 367, female: 389, malePercentage: 25.9, femalePercentage: 27.4 },
            { ageRange: '45-59', male: 234, female: 267, malePercentage: 16.5, femalePercentage: 18.8 },
            { ageRange: '60+', male: 123, female: 178, malePercentage: 8.7, femalePercentage: 12.5 },
          ]}
          className="h-96"
        />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-center">Retirement Community</h3>
        <PopulationPyramid
          data={[
            { ageRange: '0-14', male: 45, female: 42, malePercentage: 6.3, femalePercentage: 5.9 },
            { ageRange: '15-29', male: 67, female: 73, malePercentage: 9.4, femalePercentage: 10.3 },
            { ageRange: '30-44', male: 89, female: 98, malePercentage: 12.5, femalePercentage: 13.8 },
            { ageRange: '45-59', male: 156, female: 178, malePercentage: 21.9, femalePercentage: 25.0 },
            { ageRange: '60+', male: 234, female: 367, malePercentage: 32.9, femalePercentage: 51.6 },
          ]}
          className="h-96"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};