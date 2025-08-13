import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Business Management | Citizenly',
  description: 'Manage business permits, registrations, and commercial activities within the barangay jurisdiction.',
  keywords: ['business', 'permits', 'commercial', 'business registration', 'barangay business'],
  openGraph: {
    title: 'Business Management - Citizenly',
    description: 'Handle business permits and commercial activities',
    type: 'website'
  }
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}