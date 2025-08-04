import type { Metadata } from 'next'
import './globals.css'
import ClientProviders from '@/components/providers/ClientProviders'

export const metadata: Metadata = {
  title: 'RBI System - Records of Barangay Inhabitant System',
  description: 'Complete digital solution for Philippine barangay resident management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}