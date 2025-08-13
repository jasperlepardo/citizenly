import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications | Citizenly',
  description: 'Manage system notifications, alerts, and communication preferences for your barangay operations.',
  keywords: ['notifications', 'alerts', 'messages', 'system updates', 'communication'],
  openGraph: {
    title: 'Notifications - Citizenly',
    description: 'Stay updated with system notifications and alerts',
    type: 'website'
  }
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}