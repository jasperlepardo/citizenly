import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Support | Citizenly',
  description:
    'Find assistance, documentation, and support resources for using the barangay management system effectively.',
  keywords: ['help', 'support', 'documentation', 'assistance', 'user guide', 'FAQ'],
  openGraph: {
    title: 'Help & Support - Citizenly',
    description: 'Get help and support for your barangay system',
    type: 'website',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
