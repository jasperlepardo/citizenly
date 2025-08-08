import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers/Providers';
import { VersionTag } from '@/components/molecules/VersionTag';

// Configure Montserrat font with Next.js font optimization
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'RBI System - Records of Barangay Inhabitant System',
  description: 'Complete digital solution for Philippine barangay resident management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
          <VersionTag />
        </Providers>
      </body>
    </html>
  );
}
