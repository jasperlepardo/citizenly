import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}