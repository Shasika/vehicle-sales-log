import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 sm:pb-0 transition-colors duration-200">
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}