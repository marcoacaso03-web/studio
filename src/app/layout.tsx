import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';

export const metadata: Metadata = {
  title: 'Squadra+',
  description: 'La tua app per la gestione della squadra',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex min-h-screen w-full flex-col">
          <AppHeader />
          <main className="flex-1 p-4 pb-20 md:pb-4 lg:p-6">
              {children}
          </main>
          <BottomNav />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
