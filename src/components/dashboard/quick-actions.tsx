// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\quick-actions.tsx
import { Plus, FileText, Users, Bell, Calendar, Settings, Download, Upload } from 'lucide-react'

const quickActions = [
  { icon: Plus, label: 'Create Task', color: 'bg-blue-500', description: 'Assign new task to member' },
  { icon: FileText, label: 'Add Minutes', color: 'bg-emerald-500', description: 'Upload meeting records' },
  { icon: Users, label: 'Add Member', color: 'bg-purple-500', description: 'Invite new executive' },
  { icon: Calendar, label: 'Schedule Meeting', color: 'bg-rose-500', description: 'Set up new meeting' },
  { icon: Bell, label: 'Send Alert', color: 'bg-amber-500', description: 'Notify all members' },
  { icon: Settings, label: 'Settings', color: 'bg-gray-500', description: 'System configuration' },
]

export default function QuickActions() {
  return (
    <div className="bg-gradient-to-br from-[#0d7c3d]/5 via-white to-[#0d7c3d]/10 rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Frequent actions at your fingertips</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="group p-3 sm:p-4 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:border-[#0d7c3d]/30 hover:shadow-sm sm:hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`${action.color} p-1.5 sm:p-2 rounded-lg`}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-xs sm:text-sm group-hover:text-[#0d7c3d] truncate">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-600">System Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">All systems operational</span>
            <span className="sm:hidden">Operational</span>
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="flex-1 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Export Report</span>
          </button>
          <button className="flex-1 py-2 sm:py-2.5 bg-[#0d7c3d] text-white rounded-lg sm:rounded-xl hover:bg-[#0d7c3d]/90 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Upload Minutes</span>
          </button>
        </div>
      </div>
    </div>
  )
}