// Suppress Next.js warnings before anything else loads
import '@/lib/utils/suppress-next-warnings';
import ClientInit from './client-init';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import { VersionTag } from '@/components/molecules/VersionTag';
import { PWAInstallPrompt } from '@/components/molecules/PWAInstallPrompt';
import { PWAStatus } from '@/components/molecules/PWAStatus';
import { AuthDebug } from '@/components/molecules/AuthDebug';
import { ConnectionStatus, PWADevTools } from '@/components';
import LastVisitedTracker from '@/components/providers/LastVisitedTracker';
import { ErrorSuppressor } from '@/components/utils/ErrorSuppressor';

// Configure Montserrat font with Next.js font optimization
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Citizenly - Barangay Management System',
  description: 'Modern barangay management system for efficient resident data management and community services',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Citizenly',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  keywords: [
    'barangay',
    'management',
    'residents',
    'government',
    'Philippines',
    'PWA',
    'local government',
    'community',
  ],
  authors: [{ name: 'Citizenly Team' }],
  creator: 'Citizenly',
  publisher: 'Citizenly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#111827',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        {/* Suppress Next.js warnings before anything else loads */}
        {process.env.NODE_ENV === 'development' && (
          <script dangerouslySetInnerHTML={{ __html: `
            // Suppress Next.js OuterLayoutRouter warnings in development
            (function() {
              const originalError = console.error;
              console.error = function() {
                const msg = typeof arguments[0] === 'string' ? arguments[0] : '';
                if (msg.includes('Each child in a list should have a unique "key" prop') && 
                    msg.includes('OuterLayoutRouter')) {
                  return;
                }
                return originalError.apply(console, arguments);
              };
            })();
          `}} />
        )}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" />
        <script src="https://kit.fontawesome.com/ccbd88a632.js" crossOrigin="anonymous" async></script>
      </head>
      <body className={montserrat.className} suppressHydrationWarning={true}>
        <ClientInit />
        <ErrorSuppressor />
        <Providers>
          <LastVisitedTracker />
          <ConnectionStatus />
          {children}
          <VersionTag />
          <PWAInstallPrompt />
          <PWAStatus />
          <PWADevTools />
          <AuthDebug />
        </Providers>
      </body>
    </html>
  );
}
