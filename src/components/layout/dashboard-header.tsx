// src/components/layout/dashboard-header.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Search, HelpCircle, X, Home, CheckSquare, Target, Calendar, FileText, BarChart3, Settings, Bell, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { usePathname, useRouter } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSwitcher from '@/components/auth/UserSwitcher'
import GlobalSearch from '@/components/search/GlobalSearch'

/* ─── Live ticking clock (desktop header) ───────── */
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(format(new Date(), 'HH:mm:ss'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-xs tabular-nums text-gray-400 tracking-widest">
      {time}
    </span>
  )
}

/* ─── Breadcrumb trail from pathname ─────────────── */
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  return (
    <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 font-medium">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 opacity-40" />}
          <span className={i === segments.length - 1 ? 'text-[#0d7c3d] font-semibold capitalize' : 'capitalize'}>
            {seg}
          </span>
        </span>
      ))}
    </div>
  )
}

/* ─── Expandable desktop search bar ─────────────── */
function DesktopSearchBar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      animate={{ width: expanded ? 320 : 200 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="relative hidden lg:block"
    >
      {expanded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlobalSearch />
        </motion.div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
            bg-gray-50 border border-gray-100 text-gray-400 text-sm
            hover:border-[#0d7c3d]/30 hover:bg-[#0d7c3d]/[0.03] transition-all duration-200"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="text-sm">Quick search…</span>
          <span className="ml-auto text-[10px] font-bold bg-gray-200 text-gray-500 rounded px-1.5 py-0.5 tracking-wide">⌘K</span>
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MOBILE FLOATING COMMAND PILL
   
   Concept: A morphing capsule docked at the bottom of the screen.
   Default state: compact pill showing logo + date + 2 quick actions.
   Expanded state: blooms upward into a full command panel with 
   nav shortcuts, search, and contextual actions.
═══════════════════════════════════════════════════════════════════ */
const mobileNavItems = [
  { icon: Home,        label: 'Dashboard',  href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks',      href: '/dashboard/tasks' },
  { icon: Target,      label: 'Goals',      href: '/dashboard/goals' },
  { icon: Calendar,    label: 'Meetings',   href: '/dashboard/meetings' },
  { icon: FileText,    label: 'Minutes',    href: '/dashboard/minutes' },
  { icon: BarChart3,   label: 'Reports',    href: '/dashboard/reports' },
]

function MobileCommandPill() {
  const [expanded, setExpanded] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on route change
  useEffect(() => { setExpanded(false); setSearchActive(false) }, [pathname])

  // Focus search when activated
  useEffect(() => {
    if (searchActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [searchActive])

  const today = new Date()
  const activeItem = mobileNavItems.find(
    i => pathname === i.href || pathname?.startsWith(i.href + '/')
  )

  const handleNavClick = (href: string) => {
    router.push(href)
    setExpanded(false)
  }

  return (
    <>
      {/* Overlay when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="pill-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] lg:hidden"
            style={{ background: 'rgba(5,18,8,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setExpanded(false); setSearchActive(false) }}
          />
        )}
      </AnimatePresence>

      {/* The pill itself */}
      <div className="fixed bottom-5 inset-x-0 z-[999] flex justify-center lg:hidden">
      <motion.div
        layout
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 0.3 }}
      >
        <motion.div
          layout
          animate={{
            width: expanded ? 'min(88vw, 440px)' : 'auto',
            borderRadius: expanded ? 28 : 50,
          }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #061510 0%, #0a1f10 100%)',
            boxShadow: expanded
              ? '0 -8px 60px rgba(13,124,61,0.35), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 8px 32px rgba(13,124,61,0.3), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.06)',
            //maxWidth: '440px',
          }}
        >
          {/* Top green shimmer line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* ── COLLAPSED STATE ── */}
          {!expanded && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              {/* Current page indicator */}
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
                  flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50">
                  {activeItem ? <activeItem.icon className="w-3.5 h-3.5 text-white" /> : <Home className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="text-left">
                  <p className="text-white text-[11px] font-bold leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {activeItem?.label ?? 'Dashboard'}
                  </p>
                  <p className="text-emerald-400/60 text-[9px] mt-0.5 leading-none">
                    {format(today, 'EEE, MMM d')}
                  </p>
                </div>
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-white/10 mx-0.5" />

              {/* Quick action: notifications */}
              <div className="scale-90 text-emerald-300">
                <NotificationBell />
              </div>

              {/* Quick action: search */}
              <button
                onClick={() => { setExpanded(true); setSearchActive(true) }}
                className="w-7 h-7 flex items-center justify-center rounded-full
                  bg-white/[0.07] border border-white/[0.08] text-emerald-300
                  hover:bg-white/[0.12] transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* Expand handle */}
              <button
                onClick={() => setExpanded(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full
                  bg-[#0d7c3d]/80 border border-emerald-500/20 text-white ml-0.5
                  hover:bg-[#0d7c3d] transition-colors"
              >
                <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </button>
            </motion.div>
          )}

          {/* ── EXPANDED STATE ── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                {/* Header row */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <div>
                    <p className="text-[10px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">Command Center</p>
                    <p className="text-white font-bold text-sm mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {format(today, 'EEEE, MMMM d')}
                    </p>
                  </div>
                  <button
                    onClick={() => { setExpanded(false); setSearchActive(false) }}
                    className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.08]
                      flex items-center justify-center text-[#5aad7a] hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search bar */}
                <motion.div
                  className="px-4 mb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                >
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                    <input
                      ref={inputRef}
                      value={searchValue}
                      onChange={e => setSearchValue(e.target.value)}
                      placeholder="Search anything…"
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white
                        bg-white/[0.06] border border-white/[0.08]
                        placeholder:text-white/25 outline-none
                        focus:border-[#0d7c3d]/60 focus:bg-white/[0.08] transition-all"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    />
                    {searchValue && (
                      <button onClick={() => setSearchValue('')}
                        className="absolute right-3 text-white/30 hover:text-white/60 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Nav grid */}
                <div className="px-4 pb-2">
                  <p className="text-[9px] text-emerald-400/40 font-bold tracking-[0.22em] uppercase mb-3 px-1">Quick Navigate</p>
                  <div className="grid grid-cols-3 gap-2">
                    {mobileNavItems.map((item, i) => {
                      const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                      return (
                        <motion.button
                          key={item.href}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.08 + i * 0.04, type: 'spring', stiffness: 300, damping: 22 }}
                          onClick={() => handleNavClick(item.href)}
                          className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2
                            transition-all duration-200 border
                            ${isActive
                              ? 'bg-gradient-to-b from-[#0d7c3d] to-[#0a5a2d] border-emerald-500/20 shadow-[0_4px_16px_rgba(13,124,61,0.4)]'
                              : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'
                            }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/70'}`} />
                          <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white' : 'text-white/50'}`}>
                            {item.label}
                          </span>
                          {isActive && <div className="w-1 h-1 rounded-full bg-emerald-300" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Quick actions row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-2 px-4 py-4 border-t border-white/[0.05] mt-2"
                >
                  <div className="flex-1 scale-95 origin-left text-emerald-300">
                    <NotificationBell />
                  </div>
                  <button
                    onClick={() => handleNavClick('/dashboard/settings')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04]
                      border border-white/[0.06] text-white/50 hover:text-white/80
                      text-[11px] font-medium transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </button>                  
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   DESKTOP HEADER
═══════════════════════════════════════════════════ */
function DesktopHeader() {
  const pathname = usePathname()
  const today = new Date()

  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-[72px] items-center
      border-b border-gray-100/80 bg-white/96 backdrop-blur-md">

      {/* Left accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]
        bg-gradient-to-r from-transparent via-[#0d7c3d]/20 to-transparent pointer-events-none" />

      <div className="flex flex-1 items-center justify-between px-8">
        {/* Left: title + breadcrumb + clock */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              IESA Executive Dashboard
            </h2>
            {/* Thin live pulse line */}
            <motion.div
              className="hidden xl:block h-[2px] w-12 rounded-full bg-gradient-to-r from-[#0d7c3d] to-emerald-400"
              animate={{ scaleX: [1, 0.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <LiveClock />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{format(today, 'EEEE, MMMM d, yyyy')}</span>
            <span className="text-gray-200">·</span>
            <Breadcrumb pathname={pathname} />
          </div>
        </div>

        {/* Right: search + bells + help + user */}
        <div className="flex items-center gap-3">
          <DesktopSearchBar />

          <div className="h-8 w-px bg-gray-100" />

          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500
              hover:text-gray-800 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline">Help</span>
          </motion.button>

          <div className="h-8 w-px bg-gray-100" />

          {/* User switcher */}
          <UserSwitcher />
        </div>
      </div>
    </header>
  )
}

/* ─── Minimal mobile sticky bar (just top safe area) ─ */
function MobileTopBar() {
  const today = new Date()
  const pathname = usePathname()

  const activeItem = mobileNavItems.find(
    i => pathname === i.href || pathname?.startsWith(i.href + '/')
  )

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between
      px-5 bg-white/95 backdrop-blur-md border-b border-gray-100/80"
    >
      {/* Left spacer for sidebar open button */}
      <div className="w-10" />
  
      {/* Centre: page label */}
      <div className="flex flex-col items-center ml-12">
        <p
          className="text-sm font-bold text-gray-900"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {activeItem?.label ?? 'Dashboard'}
        </p>
        <p className="text-[10px] text-gray-400">
          {format(today, 'MMM d')}
        </p>
      </div>
  
      {/* Right side grouped */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserSwitcher />
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardHeader() {
  return (
    <>
      {/* Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Desktop: full command header */}
      <DesktopHeader />

      {/* Mobile: minimal sticky top bar */}
      <MobileTopBar />

      {/* Mobile: floating command pill */}
      <MobileCommandPill />
    </>
  )
}