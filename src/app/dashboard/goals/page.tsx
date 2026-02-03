// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\goals\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Target, TrendingUp, Calendar, Users, Flag, Plus, MoreVertical, CheckCircle, AlertCircle, Clock, ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import CreateGoalModal from '@/components/goals/create-goal-modal'
import { goalsService, type Goal } from '@/services/goals'
import { authService } from '@/services/auth'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const data = await goalsService.getAllGoals()
      setGoals(data)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (newGoal: any) => {
    try {
      await goalsService.createGoal(newGoal)
      fetchGoals() // Refresh list
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      // Use updateGoal with proper typing
      await goalsService.updateGoal(goalId, { 
        progress,
        status: progress === 100 ? 'completed' : 'in-progress' 
      } as any); // Temporary fix, better to update the type definition
      fetchGoals() // Refresh list
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  // Get unique categories, statuses, priorities
  const categories = Array.from(new Set(goals.map(g => g.category))).filter(Boolean)
  const statuses = Array.from(new Set(goals.map(g => g.status))).filter(Boolean)
  const priorities = Array.from(new Set(goals.map(g => g.priority))).filter(Boolean)

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    const matchesCategory = selectedCategory === 'All' || goal.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || goal.status === selectedStatus
    const matchesPriority = selectedPriority === 'All' || goal.priority === selectedPriority
    const matchesSearch = searchQuery === '' || 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesStatus && matchesPriority && matchesSearch
  })

  // Calculate statistics
  const statistics = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    atRisk: goals.filter(g => g.status === 'at-risk').length,
    averageProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0,
  }

  return (
    <div className="space-y-6">
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Department Goals</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage long-term department objectives</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>New Goal</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Goals</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{statistics.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-600">{statistics.completed}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{statistics.inProgress}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">At Risk</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600">{statistics.atRisk}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Avg Progress</div>
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{statistics.averageProgress}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals, tags..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>

          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <button className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0d7c3d]/5 border border-[#0d7c3d]/20 text-[#0d7c3d] font-medium rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">More Filters</span>
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-medium">No goals found</h3>
          <p className="text-gray-500 mt-1">Create your first department goal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const goalHealth = goalsService.calculateGoalHealth(goal)
            const statusColor = goalsService.getStatusColor(goal.status)
            const priorityColor = goalsService.getPriorityColor(goal.priority)
            const categoryColor = goalsService.getCategoryColor(goal.category)
            
            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${categoryColor.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        <Target className={`h-4 w-4 ${categoryColor.replace('bg-', 'text-')}`} />
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityColor.replace('bg-', 'bg-').replace('-500', '-50')} ${priorityColor.replace('bg-', 'text-').replace('-500', '-700')}`}>
                        <Flag className="h-3 w-3" />
                        {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor.replace('bg-', 'bg-').replace('-500', '-50')} ${statusColor.replace('bg-', 'text-').replace('-500', '-700')}`}>
                        {goal.status === 'completed' ? <CheckCircle className="h-3 w-3" /> :
                         goal.status === 'at-risk' ? <AlertCircle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {goal.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{goal.description}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress Section */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{goal.progress}%</span>
                      {goalHealth === 'healthy' && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs">
                          <ArrowUpRight className="h-3 w-3" />
                          +{goal.progress - goal.expectedProgress}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        goalHealth === 'healthy' ? 'bg-emerald-500' :
                        goalHealth === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Expected: {goal.expectedProgress}%</span>
                    <span>{goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Overdue'}</span>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Due {format(new Date(goal.targetDate), 'MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{goal.assignedTo.length} assigned</span>
                  </div>
                </div>

                {/* Tags */}
                {goal.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {goal.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {goal.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{goal.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/dashboard/goals/${goal.id}`}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-medium rounded-lg hover:shadow-[#0d7c3d]/20 transition-all"
                  >
                    View Details
                  </button>
                  <button className="py-2 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Add Task
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}