
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppHeaderWrapper } from '@/components/layout/app-header-wrapper';
import { BottomNavWrapper } from '@/components/layout/bottom-nav-wrapper';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthGuard } from '@/components/layout/auth-guard';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-pt-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'PitchMan',
  description: 'La tua app per la gestione della tua squadra',
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PitchMan',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head />
      <body className={`font-body antialiased ${ptSans.variable}`}>
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
