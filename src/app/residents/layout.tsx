import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Residents Management | Citizenly',
  description: 'Comprehensive resident registration, profile management, and information system for efficient barangay administration.',
  keywords: ['residents', 'registration', 'profiles', 'barangay management', 'RBI', 'citizen records'],
  openGraph: {
    title: 'Residents Management - Citizenly',
    description: 'Streamline resident registration and profile management',
    type: 'website'
  }
};

export default function ResidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}