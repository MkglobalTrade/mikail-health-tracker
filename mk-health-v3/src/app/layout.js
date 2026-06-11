import './globals.css';

export const metadata = {
  title: 'MK Health v3',
  description: 'Professional health tracker with AI insights and structured care workflows.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
