import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mikail Health Tracker",
  description: "Track your health metrics and medications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
