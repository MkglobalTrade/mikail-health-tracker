import './globals.css'

export const metadata = {
  title: 'Health Tracker — Mikail',
  description: 'Diabetes, Kidney & Lipids Monitor',
  manifest: '/manifest.json',
  themeColor: '#0d0f14',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Health MK" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
