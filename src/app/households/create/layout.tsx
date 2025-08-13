import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Household | Citizenly',
  description: 'Register a new household with family composition, address information, and household head details.',
  keywords: ['create household', 'new household', 'household registration', 'family registration', 'household head'],
  openGraph: {
    title: 'Create New Household - Citizenly',
    description: 'Register a new household in the barangay system',
    type: 'website'
  }
};

export default function CreateHouseholdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}