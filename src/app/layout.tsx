import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Love Lens - Discover Your Relationship Health',
  description: 'Get instant, data-driven insights about your relationship health. Anonymous, science-backed, and used by 10,000+ couples worldwide.',
  keywords: 'relationship assessment, relationship health, couple compatibility, love analysis',
  openGraph: {
    title: 'Love Lens - Discover Your Relationship Health',
    description: 'Get instant, data-driven insights about your relationship health',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}