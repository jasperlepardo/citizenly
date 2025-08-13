import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Address Management | Citizenly',
  description:
    'Manage and configure geographic address data including regions, provinces, cities, and barangays with PSGC compliance.',
  keywords: ['addresses', 'geographic data', 'PSGC', 'regions', 'provinces', 'cities', 'barangays'],
  openGraph: {
    title: 'Address Management - Citizenly',
    description: 'Manage geographic and address data for your barangay',
    type: 'website',
  },
};

export default function AddressesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
