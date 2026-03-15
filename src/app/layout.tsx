
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeaderWrapper } from '@/components/layout/app-header-wrapper';
import { BottomNavWrapper } from '@/components/layout/bottom-nav-wrapper';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthGuard } from '@/components/layout/auth-guard';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'PitchMan',
  description: 'La tua app per la gestione della tua squadra',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#21416E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <ThemeProvider>
            <AuthGuard>
              <div className="relative flex min-h-screen w-full flex-col">
                <AppHeaderWrapper />
                <main className="flex-1 p-3 pb-20 md:p-4 lg:p-6">
                    {children}
                </main>
                <BottomNavWrapper />
              </div>
            </AuthGuard>
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
