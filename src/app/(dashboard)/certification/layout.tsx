import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Certification Services | Citizenly',
  description:
    'Generate and manage barangay certifications, clearances, and official documents for residents.',
  keywords: [
    'certification',
    'clearances',
    'certificates',
    'barangay documents',
    'official papers',
  ],
  openGraph: {
    title: 'Certification Services - Citizenly',
    description: 'Issue certifications and official barangay documents',
    type: 'website',
  },
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
