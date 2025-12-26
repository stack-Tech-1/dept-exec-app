// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\layout\dashboard-header.tsx
'use client'

import { Search, Bell, HelpCircle, ChevronDown, Menu } from 'lucide-react'
import { format } from 'date-fns'
import NotificationBell from '@/components/notifications/NotificationBell' 
import UserSwitcher from '@/components/auth/UserSwitcher'

export default function DashboardHeader() {
  const today = new Date()

  return (
    <header className="sticky top-0 z-40 flex h-16 sm:h-20 items-center border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="flex flex-1 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Left side - Mobile: show menu icon, Desktop: show title */}
        <div className="flex items-center gap-4">
          {/* Mobile menu icon - hidden on desktop */}
          <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:block">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">IESA Executive Dashboard</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          
          {/* Mobile title */}
          <div className="lg:hidden">
            <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
            <p className="text-xs text-gray-600">
              {format(today, 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Right side - Mobile: icons only, Desktop: full features */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Mobile search icon */}
          <button className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl">
            <Search className="h-5 w-5" />
          </button>
          
          {/* Desktop search bar */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search tasks, meetings, members..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] focus:bg-white w-48 md:w-64 transition-all duration-200"
            />
          </div>

          {/* Notification - Mobile icon only */}
          <div className="relative">
            <NotificationBell />
          </div>

          {/* Help - Mobile icon only */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only lg:not-sr-only lg:ml-2 lg:text-sm lg:font-medium">
              Help
            </span>
          </button>

          {/* User menu - Compact on mobile */}
          <div className="scale-90 sm:scale-100">
            <UserSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}