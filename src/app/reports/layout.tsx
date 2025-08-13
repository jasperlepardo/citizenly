import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports | Citizenly',
  description:
    'Generate comprehensive reports on population demographics, household statistics, and barangay analytics.',
  keywords: [
    'reports',
    'analytics',
    'demographics',
    'statistics',
    'population data',
    'barangay reports',
  ],
  openGraph: {
    title: 'Reports & Analytics - Citizenly',
    description: 'Generate insights and reports from your barangay data',
    type: 'website',
  },
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
