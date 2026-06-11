import './globals.css'
export const metadata = { title: 'MK Health', description: 'Health Tracker Mikail Kocak' }
export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MK Health" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
