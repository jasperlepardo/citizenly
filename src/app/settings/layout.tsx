import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Citizenly',
  description: 'Configure your account preferences, system settings, and barangay-specific configurations.',
  keywords: ['settings', 'preferences', 'configuration', 'account settings', 'system preferences'],
  openGraph: {
    title: 'Settings - Citizenly',
    description: 'Manage your system settings and preferences',
    type: 'website'
  }
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}