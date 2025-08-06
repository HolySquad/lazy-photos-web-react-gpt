import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import Header from "./header";

export const metadata = {
  title: "Lazy Photos",
  description: "A geeky photo storage app",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
