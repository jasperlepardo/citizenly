import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Resident | Citizenly',
  description:
    'Register a new resident with comprehensive demographic information, family relationships, and address details.',
  keywords: [
    'create resident',
    'new resident',
    'resident registration',
    'RBI form',
    'demographic registration',
  ],
  openGraph: {
    title: 'Create New Resident - Citizenly',
    description: 'Register a new resident in the barangay system',
    type: 'website',
  },
};

export default function CreateResidentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
