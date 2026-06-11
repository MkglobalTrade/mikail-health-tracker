import './globals.css'
export const metadata = { title: 'MK Health', description: 'Personal Health Monitor — Mikail Kocak' }
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MK Health" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
