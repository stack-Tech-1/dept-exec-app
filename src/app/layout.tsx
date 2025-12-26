import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DeptExec System | Department Executive Portal',
  description: 'Premium executive management system for university departments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}