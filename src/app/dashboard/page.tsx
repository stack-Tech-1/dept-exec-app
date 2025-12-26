// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\page.tsx
'use client'

import { useEffect, useState } from 'react'
import DashboardStats from '@/components/dashboard/stats-cards'
import RecentTasks from '@/components/dashboard/recent-tasks'
import UpcomingMeetings from '@/components/dashboard/upcoming-meetings'
import GoalProgress from '@/components/dashboard/goal-progress'
import QuickActions from '@/components/dashboard/quick-actions'
import { authService } from '@/services/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#0d7c3d]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header with UserSwitcher - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Welcome back, {user?.name || 'Executive'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {user?.role === 'ADMIN' 
              ? 'Full administrative access to department systems' 
              : 'Executive view-only access'}
          </p>
        </div>       
      </div>

      {/* Stats Cards - Stack on mobile */}
      <DashboardStats />

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <RecentTasks />
          <GoalProgress />
        </div>

        {/* Right Column - Full width on mobile, 1/3 on desktop */}
        <div className="space-y-6 sm:space-y-8">
          <UpcomingMeetings />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}