// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardStats from '@/components/dashboard/stats-cards'
import RecentTasks from '@/components/dashboard/recent-tasks'
import UpcomingMeetings from '@/components/dashboard/upcoming-meetings'
import GoalProgress from '@/components/dashboard/goal-progress'
import QuickActions from '@/components/dashboard/quick-actions'
import { authService } from '@/services/auth'
import { Cpu } from 'lucide-react'
import Image from 'next/image'

/* ─── Time-based greeting ────────────────────────── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── Full-screen loading state ──────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
      />
      <p className="text-white/30 text-sm font-medium tracking-wide">Loading dashboard…</p>
    </div>
  )
}

/* ─── Section reveal wrapper ─────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting] = useState(getGreeting)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) return <LoadingScreen />

  const firstName = user?.name?.split(' ')[0] ?? 'Executive'
  const isAdmin = user?.role === 'ADMIN'

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

      <div className="space-y-6 p-4 sm:p-6 md:p-8 pb-28 md:pb-10">

        {/* ── Hero Greeting ── */}
        <Reveal delay={0}>
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #061510 0%, #0a1f12 60%, #051208 100%)' }}>

            {/* Animated mesh background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(13,124,61,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(10,90,45,0.2) 0%, transparent 40%)' }} />
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {/* Greeting line */}
                <motion.p
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="text-emerald-400/70 text-xs font-bold tracking-[0.22em] uppercase mb-1.5"
                >
                  {greeting}
                </motion.p>

                {/* Name */}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className="text-white font-black leading-tight"
                  style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
                >
                  {firstName} {/*👋*/}
                </motion.h1>

                {/* Role tag */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 mt-2"
                >
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border
                    ${isAdmin
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                      : 'bg-sky-400/10 text-sky-400 border-sky-400/20'
                    }`}>
                    <Cpu className="w-3 h-3" />
                    {isAdmin ? 'Full Admin Access' : 'Executive View'}
                  </span>
                  <span className="text-white/25 text-xs">· IESA Executive Portal</span>
                </motion.div>
              </div>

              {/* Right: live indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 18 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl
                  bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm self-start sm:self-auto"
              >
                <div className="text-right">
                  <p className="text-white/90 text-xs font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-white/30 text-[10px]">Academic session active</p>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-emerald-900/50">
                    <Image src="/icon.png" alt="IESA Logo" width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#061510]" />
                </div>
              </motion.div>
            </div>
          </div>
        </Reveal>

        {/* ── Stats ── */}
        <Reveal delay={0.1}>
          <DashboardStats />
        </Reveal>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <Reveal delay={0.2}>
              <RecentTasks />
            </Reveal>
            <Reveal delay={0.3}>
              <GoalProgress />
            </Reveal>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-5">
            <Reveal delay={0.25}>
              <UpcomingMeetings />
            </Reveal>
            <Reveal delay={0.35}>
              <QuickActions />
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}