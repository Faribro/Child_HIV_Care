// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Model Paperless ART Centre Dashboard',
  description: 'MPAC Equipment and Staffing Mapping Portal - Alliance India',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-600/30 selection:text-white">
        {/* Skip to Main Content Link for Keyboard navigation (WCAG AA compliance) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-650 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
