import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Citizenly',
  description: 'Sign in to your barangay management system account. Access resident records, household data, and administrative tools.',
  keywords: ['login', 'sign in', 'authentication', 'barangay access', 'system login'],
  openGraph: {
    title: 'Login - Citizenly',
    description: 'Sign in to your barangay management system',
    type: 'website'
  }
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}