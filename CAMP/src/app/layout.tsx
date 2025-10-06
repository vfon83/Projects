import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CAMP: Construction AI Management Platform',
  description: 'Efficiently classify, organize, and extract information from construction documents.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
