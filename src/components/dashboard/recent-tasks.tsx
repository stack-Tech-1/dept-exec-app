// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\recent-tasks.tsx
'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Clock, AlertCircle, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsxavatar'
import { dashboardService, Task } from '@/services/dashboard'
import { format } from 'date-fns'

export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentTasks()
  }, [])

  const fetchRecentTasks = async () => {
    try {
      const data = await dashboardService.getRecentTasks(4)
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (task: Task) => {
    const props = dashboardService.getStatusBadgeProps(task.status)
    
    switch (task.status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
            <CheckSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Completed</span>
          </span>
        )
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
            <AlertCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Overdue</span>
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
            <div className="h-3 w-3 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <span className="hidden sm:inline">In Progress</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 text-xs">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Pending</span>
          </span>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    return dashboardService.getPriorityColor(priority)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-28 sm:w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3.5 w-36 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-3.5 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 border-b border-gray-100 animate-pulse">
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3.5 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-36 sm:w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const displayTasks = tasks.length > 0 ? tasks : [
    {
      id: '1',
      title: 'Prepare budget proposal for faculty board',
      description: 'Review last year expenditures and draft new proposal.', 
      assignedTo: { id: '1', name: 'Treasurer', email: '' },
      createdBy: { id: '1', name: 'Admin', email: '' },
      dueDate: '2024-12-15',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      progress: 75
    },
    {
      id: '2',
      title: 'Draft meeting agenda for executive meeting',
      description: 'Outline key discussion points for the upcoming session.',
      assignedTo: { id: '2', name: 'Secretary', email: '' },
      createdBy: { id: '1', name: 'Admin', email: '' },
      dueDate: '2024-12-10',
      status: 'PENDING' as const,
      priority: 'MEDIUM' as const,
      progress: 30
    },
    {
      id: '3',
      title: 'Coordinate with guest speaker for orientation',
      description: 'Confirm availability and logistics for the event.',
      assignedTo: { id: '3', name: 'PRO', email: '' },
      createdBy: { id: '1', name: 'Admin', email: '' },
      dueDate: '2024-12-05',
      status: 'OVERDUE' as const,
      priority: 'HIGH' as const,
      progress: 90
    },
    {
      id: '4',
      title: 'Update department social media handles',
      description: 'Refresh profile pictures and cover photos across platforms.',
      assignedTo: { id: '4', name: 'Social Media Head', email: '' },
      createdBy: { id: '1', name: 'Admin', email: '' },
      dueDate: '2024-12-20',
      status: 'COMPLETED' as const,
      priority: 'LOW' as const,
      progress: 100
    },
  ]

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Tasks requiring immediate attention</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/tasks'}
            className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium self-start sm:self-center"
          >
            View all →
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {displayTasks.map((task) => (
          <div key={task.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  <span className="text-sm font-medium text-gray-900 truncate">{task.title}</span>
                  <div className="self-start sm:self-center">
                    {getStatusBadge(task)}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {task.assignedTo.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[80px] sm:max-w-none">
                        {task.assignedTo.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                    <div className="w-20 sm:w-32 flex-shrink-0">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-0.5 sm:mb-1">
                        <span>Progress</span>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="h-1 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            task.status === 'COMPLETED' ? 'bg-emerald-500' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                            task.status === 'PENDING' ? 'bg-gray-400' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-0.5 sm:p-1">
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 sm:p-6 border-t border-gray-100">
        <button 
          onClick={() => window.location.href = '/dashboard/tasks/create'}
          className="w-full py-2.5 sm:py-3 border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl text-gray-500 hover:text-[#0d7c3d] hover:border-[#0d7c3d]/30 transition-colors font-medium text-sm sm:text-base"
        >
          + Add New Task
        </button>
      </div>
    </div>
  )
}