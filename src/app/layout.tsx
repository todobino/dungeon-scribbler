import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed due to module not found error
import './globals.css';
import AppProviders from '@/components/layout/app-providers';
import ClientToaster from '@/components/layout/client-toaster';


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
          <ClientToaster />
        </AppProviders>
      </body>
    </html>
  );
}
