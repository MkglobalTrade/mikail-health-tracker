import './globals.css';

export const metadata = {
  title: 'MK Health v3',
  description: 'Professional health tracker scaffold with AI, Supabase, and analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
