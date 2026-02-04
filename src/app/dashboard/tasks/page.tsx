// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\tasks\page.tsx
'use client'
import { currentUser, ROLES } from '@/lib/constants';
import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Calendar, Flag, MoreVertical, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import CreateTaskModal from '@/components/tasks/create-task-modal'

// Initial tasks data
const initialTasks = [
  {
    id: 1,
    title: 'Prepare budget proposal for faculty board',
    description: 'Draft and finalize the quarterly budget proposal',
    assignedTo: { name: 'Treasurer', initials: 'TR', color: 'bg-blue-500' },
    dueDate: new Date('2024-12-15'),
    priority: 'high',
    status: 'in-progress',
    progress: 65,
  },
  {
    id: 2,
    title: 'Draft meeting agenda for executive meeting',
    description: 'Create agenda for upcoming executive committee meeting',
    assignedTo: { name: 'Secretary', initials: 'SC', color: 'bg-emerald-500' },
    dueDate: new Date('2024-12-10'),
    priority: 'medium',
    status: 'pending',
    progress: 30,
  },
  {
    id: 3,
    title: 'Coordinate with guest speaker for orientation',
    description: 'Finalize details with guest speaker for department orientation',
    assignedTo: { name: 'PRO', initials: 'PR', color: 'bg-purple-500' },
    dueDate: new Date('2024-12-05'),
    priority: 'high',
    status: 'overdue',
    progress: 90,
  },
  {
    id: 4,
    title: 'Update department social media handles',
    description: 'Refresh social media content and schedule posts',
    assignedTo: { name: 'Social Media Head', initials: 'SM', color: 'bg-pink-500' },
    dueDate: new Date('2024-12-20'),
    priority: 'low',
    status: 'completed',
    progress: 100,
  },
  {
    id: 5,
    title: 'Prepare faculty accreditation documents',
    description: 'Compile necessary documents for accreditation process',
    assignedTo: { name: 'Academic Head', initials: 'AH', color: 'bg-amber-500' },
    dueDate: new Date('2024-12-25'),
    priority: 'high',
    status: 'in-progress',
    progress: 45,
  },
]

// Executive members (for simulation)
const executives = [
  { id: 1, name: 'Treasurer', initials: 'TR', color: 'bg-blue-500' },
  { id: 2, name: 'Secretary', initials: 'SC', color: 'bg-emerald-500' },
  { id: 3, name: 'PRO', initials: 'PR', color: 'bg-purple-500' },
  { id: 4, name: 'Social Media Head', initials: 'SM', color: 'bg-pink-500' },
  { id: 5, name: 'Academic Head', initials: 'AH', color: 'bg-amber-500' },
]

export default function TasksPage() {
  const [view, setView] = useState('list')
  const [tasks, setTasks] = useState(initialTasks)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedPriority, setSelectedPriority] = useState('All Priorities')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('All Positions')
  const positions = Array.from(new Set(executives.map(e => e.name))).sort()

  // Auto-check for overdue tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const today = new Date()
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status !== 'completed' && task.dueDate < today) {
            return { ...task, status: 'overdue' }
          }
          return task
        })
      )
    }

    checkOverdueTasks()
    const interval = setInterval(checkOverdueTasks, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateTask = (newTask: any) => {
    setTasks(prev => [newTask, ...prev])
  }

  const handleStatusUpdate = (taskId: number, newStatus: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const progress = newStatus === 'completed' ? 100 : 
                          newStatus === 'in-progress' ? 50 : 
                          task.progress
          return { ...task, status: newStatus, progress }
        }
        return task
      })
    )
  }

    const PositionFilter = ({ positions, selectedPosition, onSelect }: any) => {
      return (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => onSelect('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedPosition === 'ALL'
                ? 'bg-[#0d7c3d] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Positions
          </button>
          {positions.map((position: string) => (
            <button
              key={position}
              onClick={() => onSelect(position)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedPosition === position
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {position}
            </button>
          ))}
        </div>
      )
    }

  const getAvailableStatusUpdates = (currentStatus: string) => {
    switch(currentStatus) {
      case 'pending':
        return ['in-progress']
      case 'in-progress':
        return ['completed']
      case 'completed':
        return []
      case 'overdue':
        return ['in-progress', 'completed']
      default:
        return []
    }
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <CheckSquare className="h-3 w-3" />
            <span className="hidden sm:inline">Completed</span>
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <AlertCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Overdue</span>
          </span>
        )
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <div className="h-3 w-3 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <span className="hidden sm:inline">In Progress</span>
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Pending</span>
          </span>
        )
      default:
        return null
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = selectedStatus === 'All Status' || task.status === selectedStatus.toLowerCase()
    const matchesPriority = selectedPriority === 'All Priorities' || task.priority === selectedPriority.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPosition = selectedPosition === 'All Positions' || 
      task.assignedTo.name === selectedPosition
    
    return matchesStatus && matchesPriority && matchesSearch && matchesPosition
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-600 mt-1">Assign, track, and manage all department tasks</p>
        </div>
        {/* SHOW BUTTON ONLY FOR ADMIN */}
        {currentUser.role === ROLES.ADMIN && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Stats Summary - Stack on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Tasks</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{tasks.length}</div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-600">
            {tasks.filter(t => t.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Overdue</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600">
            {tasks.filter(t => t.status === 'overdue').length}
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">In Progress</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {tasks.filter(t => t.status === 'in-progress').length}
          </div>
        </div>
      </div>

      {/* Filters - Stack on mobile */}
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, assignees..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 text-black rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Overdue</option>
          </select>
          
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        
        <button className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0d7c3d]/5 border border-[#0d7c3d]/20 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">More Filters</span>
          <span className="sm:hidden">Filters</span>
        </button>

        <select 
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
        >
          <option>All Positions</option>
          {positions.map(position => (
            <option key={position} value={position}>{position}</option>
          ))}
        </select>
      </div>

      {/* View Toggle and Results Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg sm:rounded-xl">
          {['list', 'board', 'calendar'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg capitalize font-medium text-xs sm:text-sm ${
                view === viewType 
                  ? 'bg-white shadow text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            > 
              {viewType === 'list' ? 'List' : 
               viewType === 'board' ? 'Board' : 'Calendar'}
            </button>
          ))}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Tasks Table - Scroll horizontally on mobile */}
      <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Task</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Assignee</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Due Date</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Priority</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const availableUpdates = getAvailableStatusUpdates(task.status)
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">
                          {task.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${task.assignedTo.color}`}>
                          {task.assignedTo.initials}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">
                          {task.assignedTo.name}
                        </span>
                        
                        {currentUser.role === ROLES.ADMIN && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 ml-1 sm:ml-2 hidden sm:inline">
                            Reassign
                          </button>
                        )}
                      </div>
                    </td>                     
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-900">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        {format(task.dueDate, 'MMM d, yyyy')}
                        
                        {currentUser.role === ROLES.ADMIN && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 ml-1 sm:ml-2 hidden sm:inline">
                            Edit
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' 
                          ? 'bg-red-50 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <Flag className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className="sm:hidden">
                          {task.priority.charAt(0).toUpperCase()}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {availableUpdates.length > 0 && (
                          <select
                            value=""
                            onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-1.5 py-1 sm:px-2 sm:py-1.5 focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] bg-white text-gray-900 hover:border-[#0d7c3d]/50 transition-colors cursor-pointer"
                          >
                            <option value="" className="text-gray-700 text-xs">Update</option>
                            {availableUpdates.map(status => (
                              <option key={status} value={status} className="text-gray-900 text-xs">
                                {status === 'in-progress' ? 'Start' :
                                status === 'completed' ? 'Complete' :
                                'Update'}
                              </option>
                            ))}
                          </select>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 p-0.5 sm:p-1">
                          <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}