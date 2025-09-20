import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}