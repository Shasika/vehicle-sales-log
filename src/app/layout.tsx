import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Vehicle Sales Log - VSL',
  description: 'Comprehensive vehicle sales tracking and management system for dealerships',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: '32x32' },
      { url: '/favicon.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png?v=2', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon.png?v=2',
    shortcut: '/favicon.ico?v=2',
  },
  other: {
    'msapplication-TileColor': '#3B82F6',
    'msapplication-config': 'none',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 sm:pb-0 transition-colors duration-200">
        <ThemeProvider>
          <NavigationProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}