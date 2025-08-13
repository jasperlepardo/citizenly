import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Admin - Citizenly',
  description: 'Manage system users, roles, and permissions for barangay officials and administrative staff.',
  keywords: ['user management', 'admin users', 'roles', 'permissions', 'system administration'],
  openGraph: {
    title: 'User Management - Admin Panel',
    description: 'Manage users, roles, and permissions',
    type: 'website'
  }
};

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}