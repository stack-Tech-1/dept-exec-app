import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IESA Exec Portal',
  description: 'Industrial Engineering Students Association — University of Ibadan Executive Portal',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'IESA Exec Portal',
    description: 'IESA Executive Management Portal — University of Ibadan',
    url: 'https://www.ipeexecs.page',
    siteName: 'IESA Exec Portal',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}