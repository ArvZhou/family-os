import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family OS',
  description: 'A digital management platform for household scenarios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  );
}
