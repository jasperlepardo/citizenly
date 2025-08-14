import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Households Management | Citizenly',
  description:
    'Comprehensive household registration, management, and family relationship tracking system for effective barangay administration.',
  keywords: [
    'households',
    'families',
    'household registration',
    'barangay management',
    'family records',
    'household head',
  ],
  openGraph: {
    title: 'Households Management - Citizenly',
    description: 'Streamline household registration and family management',
    type: 'website',
  },
};

export default function HouseholdsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
