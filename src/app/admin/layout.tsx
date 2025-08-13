import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel | Citizenly',
  description: 'Administrative interface for user management, system configuration, and barangay operation oversight.',
  keywords: ['admin', 'administration', 'user management', 'system configuration', 'barangay admin'],
  openGraph: {
    title: 'Admin Panel - Citizenly',
    description: 'Administrative control and management interface',
    type: 'website'
  }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}