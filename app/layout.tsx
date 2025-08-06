import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Lazy Photos',
  description: 'Clone of Google Photos web UI',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
