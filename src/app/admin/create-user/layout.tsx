import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create User | Admin - Citizenly',
  description: 'Create new system users and assign roles for barangay officials and administrative staff.',
  keywords: ['create user', 'new user', 'user registration', 'admin creation', 'role assignment'],
  openGraph: {
    title: 'Create User - Admin Panel',
    description: 'Create new system users and assign roles',
    type: 'website'
  }
};

export default function CreateUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}