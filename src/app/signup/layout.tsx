import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Citizenly',
  description:
    'Create your account to access the barangay management system. Register as a barangay official or administrator.',
  keywords: ['signup', 'registration', 'create account', 'barangay official', 'system access'],
  openGraph: {
    title: 'Sign Up - Citizenly',
    description: 'Create your account for barangay system access',
    type: 'website',
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
