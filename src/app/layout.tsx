import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed due to module not found error
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppProviders from '@/components/layout/app-providers';

const geistSans = GeistSans;
// const geistMono = GeistMono; // Removed

export const metadata: Metadata = {
  title: 'Dungeon Scribbler',
  description: 'Your Co-Dungeon-Master Tool',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Use geistSans for both sans-serif and monospace for now */}
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
