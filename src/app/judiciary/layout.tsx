import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Judiciary & Legal | Citizenly',
  description: 'Manage legal proceedings, dispute resolution, and judicial matters within the barangay jurisdiction.',
  keywords: ['judiciary', 'legal', 'disputes', 'mediation', 'barangay justice', 'legal proceedings'],
  openGraph: {
    title: 'Judiciary & Legal - Citizenly',
    description: 'Handle legal and judicial matters for your barangay',
    type: 'website'
  }
};

export default function JudiciaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}