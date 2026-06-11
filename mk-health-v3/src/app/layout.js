import './globals.css';

export const metadata = {
  title: 'MK Health v3',
  description: 'Health tracking app scaffold with labs, glucose, medications, doctors, and AI insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
