import { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { BottomNav } from '@/components/BottomNav'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/toast-provider'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'VitaTrack — Your Health Companion',
  description: 'Personal health tracker with AI doctor, lab uploads, blood sugar monitoring, blood pressure tracking, medications, and longevity news.',
  keywords: ['health tracker', 'glucose monitor', 'blood pressure', 'medication', 'longevity', 'health'],
  authors: [{ name: 'VitaTrack' }],
  openGraph: {
    title: 'VitaTrack — Your Health Companion',
    description: 'Track your health, labs, glucose, blood pressure, medications, and longevity insights.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background flex flex-col">
              <Navigation />
              <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
                {children}
              </main>
              <BottomNav />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
