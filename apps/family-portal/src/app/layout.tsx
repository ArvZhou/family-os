import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Family OS',
  description: 'A digital management platform for household scenarios',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
