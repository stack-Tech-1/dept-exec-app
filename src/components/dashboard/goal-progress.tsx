// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\goal-progress.tsx
import { Target, TrendingUp, MoreVertical } from 'lucide-react'

const goals = [
  {
    id: 1,
    title: 'Department Orientation 2024',
    progress: 75,
    tasks: { completed: 15, total: 20 },
    deadline: 'Dec 20, 2024',
    status: 'on-track',
  },
  {
    id: 2,
    title: 'Faculty Accreditation',
    progress: 45,
    tasks: { completed: 9, total: 20 },
    deadline: 'Jan 15, 2025',
    status: 'needs-attention',
  },
  {
    id: 3,
    title: 'Alumni Networking Event',
    progress: 30,
    tasks: { completed: 6, total: 20 },
    deadline: 'Feb 10, 2025',
    status: 'behind',
  },
]

export default function GoalProgress() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
            <p className="text-sm text-gray-500 mt-1">Track department objectives</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">+18% overall progress</span>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {goals.map((goal) => (
          <div key={goal.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#0d7c3d]/10">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-[#0d7c3d]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {goal.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">Due {goal.deadline}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{goal.progress}%</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    goal.status === 'on-track' ? 'bg-emerald-500' :
                    goal.status === 'needs-attention' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      goal.status === 'on-track' ? 'bg-emerald-500' :
                      goal.status === 'needs-attention' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="capitalize text-gray-600">{goal.status.replace('-', ' ')}</span>
                  </div>
                  <span className="text-gray-500">
                    {goal.tasks.completed}/{goal.tasks.total} tasks
                  </span>
                </div>
                <button className="text-[#0d7c3d] hover:text-[#0a5a2d] text-xs sm:text-sm font-medium self-start sm:self-center">
                  View details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 sm:p-6 border-t border-gray-100">
        <button className="w-full py-2.5 sm:py-3 bg-[#0d7c3d]/5 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm sm:text-base">
          + Create New Goal
        </button>
      </div>
    </div>
  )
}