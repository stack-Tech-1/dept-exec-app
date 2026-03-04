// src/components/layout/dashboard-header.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, HelpCircle, X, Home, CheckSquare, Target,
  Calendar, FileText, BarChart3, Settings, ChevronRight, Cpu
} from 'lucide-react'
import { format } from 'date-fns'
import { usePathname, useRouter } from 'next/navigation'
import NotificationBell from '@/components/notifications/NotificationBell'
import UserSwitcher from '@/components/auth/UserSwitcher'
import GlobalSearch from '@/components/search/GlobalSearch'

/* ─── Live ticking clock ─────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(format(new Date(), 'HH:mm:ss'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="font-mono text-[11px] tabular-nums text-emerald-400/55 tracking-widest">
      {time}
    </span>
  )
}

/* ─── Breadcrumb ─────────────────────────────────── */
function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  return (
    <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 opacity-25" />}
          <span className={
            i === segments.length - 1
              ? 'text-emerald-400 font-bold capitalize'
              : 'capitalize'
          }>
            {seg}
          </span>
        </span>
      ))}
    </div>
  )
}

/* ─── Expandable search (desktop) ────────────────── */
function DesktopSearchBar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      animate={{ width: expanded ? 300 : 188 }}
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
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
            bg-white/[0.06] border border-white/[0.08] text-white/30 text-sm
            hover:bg-white/[0.09] hover:border-emerald-500/30 transition-all duration-200"
        >
          <Search className="w-4 h-4 shrink-0 text-emerald-400/50" />
          <span className="text-[13px]">Quick search…</span>
          <span className="ml-auto text-[10px] font-bold bg-white/[0.08] text-white/25
            rounded px-1.5 py-0.5 tracking-wide border border-white/[0.06]">⌘K</span>
        </button>
      )}
      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30
            hover:text-white/60 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   DESKTOP HEADER  —  deep green command bar
═══════════════════════════════════════════════════ */
function DesktopHeader() {
  const pathname = usePathname()
  const today = new Date()

  return (
    <header
      className="hidden lg:flex sticky top-0 z-40 h-[68px] items-center
        bg-[#061510] border-b border-white/[0.06]"
      style={{ boxShadow: '0 4px 28px rgba(0,0,0,0.4)' }}
    >
      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top shimmer line */}
      <div className="absolute top-0 inset-x-0 h-px
        bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent pointer-events-none" />

      {/* Bottom fade border */}
      <div className="absolute bottom-0 inset-x-0 h-px
        bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

      {/* Subtle left-side green ambient glow */}
      <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(13,124,61,0.08), transparent)' }} />

      <div className="relative z-10 flex flex-1 items-center justify-between px-6 xl:px-8 gap-4">

        {/* LEFT: logo mark + title + meta */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo chip */}
          <motion.div
            whileHover={{ scale: 1.07, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
              flex items-center justify-center border border-white/[0.1]"
            style={{ boxShadow: '0 4px 14px rgba(13,124,61,0.45)' }}
          >
            <Cpu className="w-4 h-4 text-white" />
          </motion.div>

          <div className="min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-3">
              <h2
                className="text-xl font-bold text-white tracking-tight truncate"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                IESA Executive Dashboard
              </h2>

              {/* Breathing pulse bar */}
              <motion.div
                className="hidden xl:block h-[2px] w-10 rounded-full
                  bg-gradient-to-r from-emerald-400 to-[#0d7c3d]"
                animate={{ scaleX: [1, 0.3, 1], opacity: [0.9, 0.35, 0.9] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />

              <LiveClock />
            </div>

            {/* Date + breadcrumb */}
            <div className="flex items-center gap-2 mt-[3px]">
              <span className="text-[11px] text-white/25">
                {format(today, 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="text-white/12">·</span>
              <Breadcrumb pathname={pathname} />
            </div>
          </div>
        </div>

        {/* RIGHT: tools */}
        <div className="flex items-center gap-2 shrink-0">
          <DesktopSearchBar />

          <div className="h-7 w-px bg-white/[0.08] mx-1" />

          {/* Notifications */}
          <div className="[&_button]:!text-emerald-300 [&_svg]:!text-emerald-300
            [&_button]:hover:!bg-white/[0.07] [&_button]:!rounded-xl">
            <NotificationBell />
          </div>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/35
              hover:text-white/75 hover:bg-white/[0.06] text-sm font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden xl:inline text-[13px]">Help</span>
          </motion.button>

          <div className="h-7 w-px bg-white/[0.08] mx-1" />

          {/* User switcher */}
          <UserSwitcher />
        </div>
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════
   MOBILE TOP BAR  —  dark green strip
═══════════════════════════════════════════════════ */
const mobileNavItems = [
  { icon: Home,        label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks',     href: '/dashboard/tasks' },
  { icon: Target,      label: 'Goals',     href: '/dashboard/goals' },
  { icon: Calendar,    label: 'Meetings',  href: '/dashboard/meetings' },
  { icon: FileText,    label: 'Minutes',   href: '/dashboard/minutes' },
  { icon: BarChart3,   label: 'Reports',   href: '/dashboard/reports' },
]

function MobileTopBar() {
  const today = new Date()
  const pathname = usePathname()

  const activeItem = mobileNavItems.find(
    i => pathname === i.href || pathname?.startsWith(i.href + '/')
  )

  return (
    <header
      className="lg:hidden sticky top-0 z-30 flex h-14 items-center
        bg-[#061510] border-b border-white/[0.06]"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.45)' }}
    >
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Top shimmer */}
      <div className="absolute top-0 inset-x-0 h-px
        bg-gradient-to-r from-transparent via-emerald-500/28 to-transparent pointer-events-none" />

      {/* Spacer for sidebar toggle button (rendered as fixed overlay elsewhere) */}
      <div className="w-10 shrink-0 relative z-10" />

      {/* Centre: active page label — absolutely centred */}
      <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
        <div className="flex items-center gap-1.5">
          {activeItem && (
            <activeItem.icon className="w-3 h-3 text-emerald-400/65" />
          )}
          <p
            className="text-[13px] font-bold text-white leading-none"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            {activeItem?.label ?? 'Dashboard'}
          </p>
        </div>
        <p className="text-[10px] text-emerald-400/45 mt-[3px] tracking-wide">
          {format(today, 'MMM d')}
        </p>
      </div>

      {/* Right: notifications + user */}
      <div className="ml-auto flex items-center gap-2.5 px-4 relative z-10">
        <div className="[&_button]:!text-emerald-300 [&_svg]:!text-emerald-300">
          <NotificationBell />
        </div>
        <UserSwitcher />
      </div>
    </header>
  )
}

/* ═══════════════════════════════════════════════════
   MOBILE FLOATING COMMAND PILL
═══════════════════════════════════════════════════ */
function MobileCommandPill() {
  const [expanded, setExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setExpanded(false) }, [pathname])

  useEffect(() => {
    if (expanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 220)
    }
  }, [expanded])

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
      {/* Overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="pill-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] lg:hidden"
            style={{ background: 'rgba(3,12,5,0.65)', backdropFilter: 'blur(5px)' }}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Pill */}
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
              background: 'linear-gradient(135deg, #061510 0%, #0b2115 100%)',
              boxShadow: expanded
                ? '0 -8px 60px rgba(13,124,61,0.38), 0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)'
                : '0 8px 36px rgba(13,124,61,0.32), 0 4px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Shimmer line */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px]
              bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            {/* ── COLLAPSED ── */}
            {!expanded && (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <button onClick={() => setExpanded(true)} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
                    flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50">
                    {activeItem
                      ? <activeItem.icon className="w-3.5 h-3.5 text-white" />
                      : <Home className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-white text-[11px] font-bold leading-none"
                      style={{ fontFamily: 'Syne, sans-serif' }}>
                      {activeItem?.label ?? 'Dashboard'}
                    </p>
                    <p className="text-emerald-400/55 text-[9px] mt-0.5 leading-none">
                      {format(today, 'EEE, MMM d')}
                    </p>
                  </div>
                </button>

                <div className="w-px h-6 bg-white/[0.1] mx-0.5" />

                <div className="scale-90 text-emerald-300">
                  <NotificationBell />
                </div>

                <button
                  onClick={() => setExpanded(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full
                    bg-white/[0.07] border border-white/[0.08] text-emerald-300
                    hover:bg-white/[0.12] transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setExpanded(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-full
                    bg-[#0d7c3d]/80 border border-emerald-500/25 text-white ml-0.5
                    hover:bg-[#0d7c3d] transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* ── EXPANDED ── */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <div>
                      <p className="text-[10px] text-emerald-400/55 font-bold tracking-[0.22em] uppercase">
                        Command Center
                      </p>
                      <p className="text-white font-bold text-sm mt-0.5"
                        style={{ fontFamily: 'Syne, sans-serif' }}>
                        {format(today, 'EEEE, MMMM d')}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpanded(false)}
                      className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/[0.08]
                        flex items-center justify-center text-emerald-400/60 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Search */}
                  <motion.div
                    className="px-4 mb-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                  >
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 w-3.5 h-3.5 text-emerald-400/50 shrink-0" />
                      <input
                        ref={inputRef}
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder="Search anything…"
                        className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm text-white
                          bg-white/[0.06] border border-white/[0.08] placeholder:text-white/22
                          outline-none focus:border-emerald-500/40 focus:bg-white/[0.09] transition-all"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      />
                      {searchValue && (
                        <button
                          onClick={() => setSearchValue('')}
                          className="absolute right-3 text-white/30 hover:text-white/60 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>

                  {/* Nav grid */}
                  <div className="px-4 pb-2">
                    <p className="text-[9px] text-emerald-400/38 font-bold tracking-[0.22em] uppercase mb-3 px-1">
                      Quick Navigate
                    </p>
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
                                ? 'bg-gradient-to-b from-[#0d7c3d] to-[#0a5a2d] border-emerald-500/25 shadow-[0_4px_16px_rgba(13,124,61,0.4)]'
                                : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08]'
                              }`}
                          >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400/65'}`} />
                            <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-white' : 'text-white/45'}`}>
                              {item.label}
                            </span>
                            {isActive && <div className="w-1 h-1 rounded-full bg-emerald-300/80" />}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bottom row */}
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
                        border border-white/[0.06] text-white/40 hover:text-white/70
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
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardHeader() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <DesktopHeader />
      <MobileTopBar />
      <MobileCommandPill />
    </>
  )
}