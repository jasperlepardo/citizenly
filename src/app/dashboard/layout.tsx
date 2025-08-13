import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Citizenly',
  description: 'Monitor and analyze your barangay statistics, demographics, and key performance indicators in real-time.',
  keywords: ['dashboard', 'analytics', 'barangay statistics', 'demographics', 'residents', 'households'],
  openGraph: {
    title: 'Barangay Dashboard - Citizenly',
    description: 'Real-time insights into your barangay community',
    type: 'website'
  }
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}