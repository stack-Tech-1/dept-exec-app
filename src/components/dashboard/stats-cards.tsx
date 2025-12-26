// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\stats-cards.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertCircle, Target, Users, Calendar, FileText } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { dashboardService, type DashboardStats } from '@/services/dashboard'
import { authService } from '@/services/auth'

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({
        totalTasks: 24,
        completedTasks: 12,
        overdueTasks: 3,
        pendingTasks: 6,
        inProgressTasks: 3,
        totalMembers: 15,
        upcomingMeetings: 4,
        pendingMinutes: 2
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 animate-pulse"
          >
            <div className="h-4 w-4 sm:h-6 sm:w-6 bg-gray-300 rounded-lg sm:rounded-xl mb-2 sm:mb-4"></div>
            <div className="h-5 sm:h-8 w-10 sm:w-16 bg-gray-300 rounded mb-1 sm:mb-2"></div>
            <div className="h-3 sm:h-4 w-16 sm:w-24 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const isAdmin = authService.isAdmin()

  const statCards = [
    {
      title: 'Active Tasks',
      value: stats.totalTasks.toString(),
      change: `+${stats.inProgressTasks}`,
      icon: CheckCircle,
      color: 'text-[#0d7c3d]',
      bgColor: 'bg-[#0d7c3d]/10',
      progress: stats.totalTasks > 0 
        ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100)
        : 0,
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks.toString(),
      change: `-${stats.overdueTasks > 0 ? '⚠️' : '0'}`,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      progress: stats.totalTasks > 0 
        ? Math.round((stats.overdueTasks / stats.totalTasks) * 100)
        : 0,
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks.toString(),
      change: `+${stats.completedTasks}`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      progress: stats.totalTasks > 0 
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0,
    },
    {
      title: 'Total Members',
      value: stats.totalMembers.toString(),
      change: '+2',
      icon: Users,
      color: 'text-[#0d7c3d]',
      bgColor: 'bg-[#0d7c3d]/10',
      progress: 100,
    },
    {
      title: 'Meetings This Week',
      value: stats.upcomingMeetings.toString(),
      change: '+1',
      icon: Calendar,
      color: 'text-[#0d7c3d]',
      bgColor: 'bg-[#0d7c3d]/10',
      progress: stats.upcomingMeetings > 0 ? 80 : 0,
    },
    {
      title: 'Pending Minutes',
      value: stats.pendingMinutes.toString(),
      change: isAdmin ? '-1' : 'N/A',
      icon: FileText,
      color: 'text-[#0d7c3d]',
      bgColor: 'bg-[#0d7c3d]/10',
      progress: stats.pendingMinutes > 0 ? 30 : 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.color}`} />
            </div>
            <span className={`text-xs sm:text-sm font-medium ${
              stat.title === 'Overdue Tasks' ? 'text-amber-600' : 'text-[#0d7c3d]'
            }`}>
              {stat.change}
            </span>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
            </div>
            <Progress value={stat.progress} className="h-1 sm:h-2" />
            <p className="text-xs text-gray-500">{stat.progress}% complete</p>
          </div>
        </div>
      ))}
    </div>
  )
}