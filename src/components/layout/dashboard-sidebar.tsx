// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\layout\dashboard-sidebar.tsx
'use client'

import { ROLES, currentUser } from '@/lib/constants'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Target, Calendar, Users, FileText, Bell, Settings, Menu, X, Cpu, BarChart3 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsxavatar'

export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => setSidebarOpen(false), [pathname])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (sidebarOpen && !target.closest('.sidebar') && !target.closest('.mobile-menu-button')) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [sidebarOpen])

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

  if (!mounted) return null // prevent hydration errors

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'Meetings', href: '/dashboard/meetings', icon: Calendar },
    { name: 'Minutes', href: '/dashboard/minutes', icon: FileText },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    ...(currentUser.role === ROLES.ADMIN ? [{ name: 'Members', href: '/dashboard/users', icon: Users }] : []),
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-[#0d7c3d]/5 border-r border-gray-100">
          {/* Logo - Mobile compact */}
          <div className="flex h-16 sm:h-20 items-center justify-between border-b border-gray-100 px-4 sm:px-6">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] shadow-lg">
                <Cpu className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">IESA Exec Portal</h1>
                <p className="text-xs text-gray-500">IPE Department</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900">IESA Portal</h1>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </button>
          </div>

          {/* User Profile - Mobile compact */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ring-1 sm:ring-2 ring-white shadow">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback className="bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] text-white text-xs sm:text-sm">
                  GS
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">General Secretary</h3>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation - Mobile compact */}
          <nav className="flex-1 space-y-1 p-2 sm:p-3 md:p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white shadow-md shadow-[#0d7c3d]/20'
                      : 'text-gray-600 hover:bg-[#0d7c3d]/5 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section - Mobile compact */}
          <div className="p-2 sm:p-3 md:p-4 border-t border-gray-100 space-y-1">
            <Link
              href="/dashboard/notifications"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium text-gray-600 hover:bg-[#0d7c3d]/5 hover:text-gray-900"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="truncate">Notifications</span>
              <span className="ml-auto bg-[#0d7c3d] text-white text-xs rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1">
                3
              </span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium text-gray-600 hover:bg-[#0d7c3d]/5 hover:text-gray-900"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="truncate">Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="mobile-menu-button fixed left-3 top-3 z-[9999] lg:hidden bg-white shadow-md rounded-xl p-2 hover:shadow-lg transition-shadow"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>
    </>
  )
}