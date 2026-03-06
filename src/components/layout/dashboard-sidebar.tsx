// src/components/layout/dashboard-sidebar.tsx
'use client'

import { ROLES } from '@/lib/constants'
import { authService } from '@/services/auth'
import { notificationsService } from '@/services/notifications'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, Target, Calendar,
  Users, Users2, FileText, Bell, Settings, X, Cpu, BarChart3,
  ChevronRight, Zap, HelpCircle
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/* ─── Types ──────────────────────────────────────── */
interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

/* ─── Animated icon wrapper ─────────────────────── */
function NavIcon({ Icon, isActive }: { Icon: React.ElementType; isActive: boolean }) {
  return (
    <motion.div
      animate={isActive ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="shrink-0"
    >
      <Icon className={`h-[18px] w-[18px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#5aad7a]'}`} />
    </motion.div>
  )
}

/* ─── Pulse dot (live system indicator) ─────────── */
function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  )
}

/* ─── Desktop sidebar nav link ───────────────────── */
function DesktopNavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
          transition-colors duration-200 cursor-pointer select-none
          ${isActive
            ? 'text-white'
            : 'text-[#7bc99a] hover:text-white hover:bg-white/[0.06]'
          }`}
      >
        {/* Active background */}
        {isActive && (
          <motion.div
            layoutId="activeNav"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0e9147]
              shadow-[0_4px_20px_rgba(13,124,61,0.5)]"
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          />
        )}

        {/* Left glow edge on active */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-full bg-emerald-300/80" />
        )}

        <NavIcon Icon={item.icon} isActive={isActive} />

        <span className="relative z-10 flex-1 truncate tracking-wide">{item.name}</span>

        {item.badge !== undefined && item.badge > 0 && (
          <span className={`relative z-10 min-w-[20px] text-center text-[10px] font-bold rounded-full px-1.5 py-0.5
            ${isActive ? 'bg-white/20 text-white' : 'bg-[#0d7c3d] text-white'}`}>
            {item.badge}
          </span>
        )}

        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10"
          >
            <ChevronRight className="h-3.5 w-3.5 text-white/60" />
          </motion.div>
        )}
      </motion.div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════
   MOBILE SIDEBAR — Radial arc sweep drawer
═══════════════════════════════════════════════════ */
function MobileSidebar({
  open, onClose, navigation, pathname, user, unreadCount
}: {
  open: boolean
  onClose: () => void
  navigation: NavItem[]
  pathname: string
  user: { name: string; position: string } | null
  unreadCount: number
}) {
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GS'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Dark panel */}
          <motion.div
            key="panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="sidebar fixed inset-y-0 left-0 z-50 w-72 lg:hidden flex flex-col
              bg-[#051208] border-r border-white/[0.06] overflow-hidden"
          >
            {/* Top green glow */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0d7c3d]/25 to-transparent pointer-events-none" />
            {/* Bottom glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a5a2d]/20 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-5">
              <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
                  flex items-center justify-center shadow-lg shadow-emerald-900/50">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm tracking-tight leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
                    IESA Exec Portal
                  </p>
                  <p className="text-[#5aad7a] text-[10px] tracking-widest uppercase mt-0.5">IPE Department</p>
                </div>
              </Link>
              <motion.button
                whileTap={{ scale: 0.9, rotate: 90 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center
                  border border-white/[0.08] text-[#5aad7a] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* User card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative z-10 mx-4 mb-5 rounded-2xl bg-white/[0.05] border border-white/[0.07]
                px-4 py-3 flex items-center gap-3"
            >
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-[#0d7c3d]/60">
                  <AvatarImage src="/avatar.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#051208] rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{user?.name ?? 'Loading...'}</p>
                <p className="text-[#5aad7a] text-[11px] truncate">{user?.position ?? ''} · Online</p>
              </div>
              <PulseDot />
            </motion.div>

            {/* Nav items — fan in with stagger */}
            <nav className="relative z-10 flex-1 px-3 space-y-1 overflow-y-auto">
              <p className="text-[#3d7a55] text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-3">Navigation</p>
              {navigation.map((item, i) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.055, type: 'spring', stiffness: 280, damping: 24 }}
                  >
                    <Link href={item.href} onClick={onClose}>
                      <div className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium
                        transition-all duration-200 cursor-pointer
                        ${isActive
                          ? 'bg-gradient-to-r from-[#0d7c3d] to-[#0e8f47] text-white shadow-[0_4px_16px_rgba(13,124,61,0.4)]'
                          : 'text-[#7bc99a] hover:bg-white/[0.05] hover:text-white'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-full bg-emerald-300" />
                        )}
                        <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : 'text-[#5aad7a]'}`} />
                        <span className="flex-1 truncate">{item.name}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
                            ${isActive ? 'bg-white/20 text-white' : 'bg-[#0d7c3d] text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Bottom links */}
            <div className="relative z-10 px-3 py-4 border-t border-white/[0.06] space-y-1">
              {[
                { href: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
                { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                { href: '/dashboard/help', icon: HelpCircle, label: 'Help & Support' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                >
                  <Link href={item.href} onClick={onClose}>
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      text-[#7bc99a] hover:bg-white/[0.05] hover:text-white transition-all duration-200 cursor-pointer">
                      <item.icon className="h-[18px] w-[18px] text-[#5aad7a]" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#0d7c3d] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════════
   DESKTOP SIDEBAR
═══════════════════════════════════════════════════ */
function DesktopSidebar({
  navigation, pathname, user, unreadCount
}: {
  navigation: NavItem[]
  pathname: string
  user: { name: string; position: string } | null
  unreadCount: number
}) {
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GS'

  return (
    <aside className="sidebar hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col
      bg-[#061510] border-r border-white/[0.05]">

      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d7c3d]/15 via-transparent to-[#0a3d20]/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.06]">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
            flex items-center justify-center shadow-lg shadow-emerald-950/60 shrink-0"
        >
          <Cpu className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="text-white font-bold text-sm tracking-tight leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
            IESA Exec Portal
          </h1>
          <p className="text-[#4a9966] text-[10px] tracking-[0.18em] uppercase mt-0.5">IPE Department</p>
        </div>
      </div>

      {/* User profile */}
      <div className="relative z-10 px-4 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-3 py-3">
          <div className="relative">
            <Avatar className="h-9 w-9 ring-2 ring-[#0d7c3d]/50">
              <AvatarImage src="/avatar.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#061510] rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? 'Loading...'}</p>
            <p className="text-[#4a9966] text-[10px] truncate">{user?.position ?? ''}</p>
          </div>
          <PulseDot />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[#2d5c3f] text-[10px] font-bold tracking-[0.22em] uppercase px-3 mb-3">Main Menu</p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return <DesktopNavLink key={item.name} item={item} isActive={isActive} />
        })}
      </nav>

      {/* Bottom section */}
      <div className="relative z-10 px-3 py-3 border-t border-white/[0.05] space-y-0.5">
        {[
          { href: '/dashboard/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
          { href: '/dashboard/help', icon: HelpCircle, label: 'Help & Support' },
        ].map((item) => {
          const isActive = pathname === item.href
          return (
            <Link href={item.href} key={item.label}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                  transition-colors duration-200 cursor-pointer
                  ${isActive ? 'text-white bg-white/[0.07]' : 'text-[#7bc99a] hover:text-white hover:bg-white/[0.05]'}`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? 'text-emerald-300' : 'text-[#5aad7a]'}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#0d7c3d] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}

        {/* System status */}
        <div className="mt-3 mx-1 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5
          flex items-center gap-2.5">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] text-[#4a9966] flex-1">System Online</span>
          <PulseDot />
        </div>
      </div>
    </aside>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authUser, setAuthUser] = useState<{ name: string; position: string; role: string } | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => setSidebarOpen(false), [pathname])

  useEffect(() => {
    if (!mounted) return
    const user = authService.getCurrentUser()
    if (user) setAuthUser({ name: user.name, position: user.position, role: user.role })

    notificationsService.getUnreadCount()
      .then(count => setUnreadCount(count))
      .catch(() => {})
  }, [mounted])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
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
    return () => { document.body.style.overflow = 'unset' }
  }, [sidebarOpen])

  if (!mounted) return null

  const isAdmin = authUser?.role === ROLES.ADMIN

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard',            icon: LayoutDashboard },
    { name: 'Tasks',     href: '/dashboard/tasks',      icon: CheckSquare },
    { name: 'Goals',     href: '/dashboard/goals',      icon: Target },
    { name: 'Meetings',  href: '/dashboard/meetings',   icon: Calendar },
    { name: 'Minutes',   href: '/dashboard/minutes',    icon: FileText },
    { name: 'Reports',   href: '/dashboard/reports',    icon: BarChart3 },
    ...(isAdmin
      ? [
          { name: 'Users',   href: '/dashboard/users',   icon: Users  },
          { name: 'Members', href: '/dashboard/members', icon: Users2 },
        ]
      : []),
  ]

  return (
    <>
      {/* Google Fonts (Syne) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      <DesktopSidebar navigation={navigation} pathname={pathname} user={authUser} unreadCount={unreadCount} />

      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        pathname={pathname}
        user={authUser}
        unreadCount={unreadCount}
      />

      {/* Mobile open button — only shown when drawer is closed */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            key="menu-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            className="mobile-menu-button fixed left-3.5 top-3.5 z-[9999] lg:hidden
              w-10 h-10 flex items-center justify-center rounded-xl
              bg-[#0d7c3d] shadow-[0_4px_18px_rgba(13,124,61,0.5)]
              border border-emerald-400/20"
          >
            <Cpu className="h-5 w-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
