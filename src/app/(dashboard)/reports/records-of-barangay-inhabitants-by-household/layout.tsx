import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RBI Form | Citizenly',
  description:
    'Records of Barangay Inhabitant (RBI) registration form for comprehensive resident data collection and household management.',
  keywords: [
    'RBI',
    'Records of Barangay Inhabitant',
    'resident registration',
    'household form',
    'demographic data',
  ],
  openGraph: {
    title: 'RBI Form - Citizenly',
    description: 'Complete the Records of Barangay Inhabitant registration',
    type: 'website',
  },
};

export default function RbiFormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
