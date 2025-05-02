import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Analytics & Habit Tracker',
  description: 'Track your daily habits and personal stats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans">{children}</body>
    </html>
  );
}