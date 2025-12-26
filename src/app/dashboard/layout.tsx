// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const isAuthenticated = true;
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#0d7c3d]/5">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader />
        
        {/* Page Content - Mobile responsive padding */}
        <main className="py-4 px-3 sm:py-6 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="px-1 sm:px-2 md:px-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}