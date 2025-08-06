import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Lazy Photos',
  description: 'Clone of Google Photos web UI',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
