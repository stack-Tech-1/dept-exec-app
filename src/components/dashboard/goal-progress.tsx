// Update C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\goal-progress.tsx
'use client'

import { useEffect, useState } from 'react'
import { Target, TrendingUp, MoreVertical, ArrowRight } from 'lucide-react'
import { goalsService, type Goal } from '@/services/goals'

export default function GoalProgress() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardGoals()
  }, [])

  const fetchDashboardGoals = async () => {
    try {
      const data = await goalsService.getDashboardGoals(3)
      setGoals(data)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-100 animate-pulse">
          <div className="space-y-2">
            <div className="h-5 w-32 sm:w-40 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-40 sm:w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
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

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
            <p className="text-sm text-gray-500 mt-1">Track department objectives</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/goals'}
            className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {goals.length === 0 ? (
        <div className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active goals found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {goals.map((goal) => {
            const statusColor = goalsService.getStatusColor(goal.status)
            const health = goalsService.calculateGoalHealth(goal)
            
            return (
              <div key={goal.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${statusColor.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                      <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${statusColor.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {goal.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Due {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      health === 'healthy' ? 'bg-emerald-500' :
                      health === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        health === 'healthy' ? 'bg-emerald-500' :
                        health === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">
                        {goal.tasks.length} tasks • {goal.daysRemaining} days left
                      </span>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/dashboard/goals/${goal.id}`}
                      className="text-[#0d7c3d] hover:text-[#0a5a2d] text-xs sm:text-sm font-medium self-start sm:self-center flex items-center gap-1"
                    >
                      View details
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="p-4 sm:p-6 border-t border-gray-100">
        <button 
          onClick={() => window.location.href = '/dashboard/goals/create'}
          className="w-full py-2.5 sm:py-3 bg-[#0d7c3d]/5 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
        >
          <Target className="h-4 w-4" />
          Create New Goal
        </button>
      </div>
    </div>
  )
}