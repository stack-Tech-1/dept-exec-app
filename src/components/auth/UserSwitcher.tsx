'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'

export default function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Always run hooks in same order
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

  const getRoleColor = (role: string) =>
    role === 'ADMIN'
      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
      : 'bg-gradient-to-r from-emerald-500 to-emerald-600'

  const user = authService.getCurrentUser()

  // Render nothing until mounted (prevents hydration mismatch)
  if (!mounted || !user) return null


  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button - Compact on mobile */}
     <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm group"
      >
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${getRoleColor(user.role)}`}>
          <span className="text-white font-semibold text-xs sm:text-sm">{getInitials(user.name)}</span>
        </div>
        
        {/* Hide name and details on mobile */}
        <div className="hidden sm:block text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 max-w-[120px] truncate">{user.name}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {user.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email || user.department}</p>
        </div>
        
         <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Mobile optimized */}
      {isOpen && (
        <div className="fixed sm:absolute right-0 sm:right-0 mt-2 w-full sm:w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#0d7c3d]/5 to-[#0a5a2d]/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md ${getRoleColor(user.role)}`}>
                <span className="text-white font-semibold text-base">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-500 truncate">
                    {user.position || 'Executive Member'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Info */}
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-600 font-medium">Department</p>
            <p className="text-sm text-gray-900 mt-0.5 truncate">
              Industrial & Production Engineering
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                router.push('/profile')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Profile Settings</span>
            </button>
            
            <button
              onClick={() => {
                router.push('/notifications')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </div>
              </div>
              <span className="text-sm font-medium">Notifications</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Department Executive System v1.0
            </p>
          </div>
        </div>
      )}
    </div>
  )
}