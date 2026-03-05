// src/components/dashboard/stats-cards.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, Users, Calendar, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { dashboardService, type DashboardStats } from '@/services/dashboard'
import { authService } from '@/services/auth'

/* ─── Animated count-up number ──────────────────── */
function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const steps = 40
    const increment = target / steps
    const interval = (duration * 1000) / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, interval)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return <span ref={ref}>{value}</span>
}

/* ─── Thin arc progress ring ────────────────────── */
function ArcRing({ progress, color, size = 52, stroke = 4 }: {
  progress: number; color: string; size?: number; stroke?: number
}) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (progress / 100) * circ

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {/* Fill */}
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

/* ─── Individual stat card ───────────────────────── */
interface StatDef {
  title: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  accent: string        // tailwind text colour
  glow: string          // box-shadow colour
  arcColor: string      // hex/rgb for SVG
  progress: number
  bg: string            // card bg class
}

function StatCard({ stat, index }: { stat: StatDef; index: number }) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus
  const trendColor = stat.trend === 'up' ? '#34d399' : stat.trend === 'down' ? '#f59e0b' : '#6b7280'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 cursor-default select-none ${stat.bg}`}
      style={{ boxShadow: `0 4px 24px ${stat.glow}18` }}
    >
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${stat.arcColor}, transparent 70%)` }} />

      {/* Top row: icon + ring */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background: `${stat.arcColor}18` }}>
          <stat.icon className={`w-4.5 h-4.5 ${stat.accent}`} style={{ width: 18, height: 18 }} />
        </div>
        <ArcRing progress={stat.progress} color={stat.arcColor} size={44} stroke={3.5} />
      </div>

      {/* Value */}
      <div className="mb-1">
        <p className="text-2xl font-black text-white leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
          <CountUp target={stat.value} />
        </p>
      </div>

      {/* Title */}
      <p className="text-[11px] text-white/45 font-semibold tracking-wide uppercase mb-2.5 truncate">
        {stat.title}
      </p>

      {/* Trend chip */}
      <div className="flex items-center gap-1">
        <TrendIcon style={{ width: 11, height: 11, color: trendColor }} />
        <span className="text-[11px] font-semibold" style={{ color: trendColor }}>{stat.change}</span>
      </div>

      {/* Bottom accent bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{ background: `linear-gradient(to right, ${stat.arcColor}, transparent)` }}
        initial={{ width: 0 }}
        animate={{ width: `${stat.progress}%` }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 + index * 0.07 }}
      />
    </motion.div>
  )
}

/* ─── Loading skeleton ───────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#0d1f14] border border-white/[0.05] p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.07]" />
        <div className="w-11 h-11 rounded-full bg-white/[0.06]" />
      </div>
      <div className="h-7 w-10 bg-white/[0.07] rounded mb-1" />
      <div className="h-3 w-24 bg-white/[0.05] rounded mb-2.5" />
      <div className="h-3 w-14 bg-white/[0.05] rounded" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats()
        setStats(data)
      } catch {
        setStats({
          totalTasks: 0, completedTasks: 0, overdueTasks: 0,
          pendingTasks: 0, inProgressTasks: 0, totalMembers: 0,
          upcomingMeetings: 0, pendingMinutes: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const isAdmin = authService.isAdmin()
  const pct = (n: number) => stats.totalTasks > 0 ? Math.round((n / stats.totalTasks) * 100) : 0

  const statDefs: StatDef[] = [
    {
      title: 'Active Tasks',       value: stats.totalTasks,
      change: `+${stats.inProgressTasks} in progress`, trend: 'up',
      icon: CheckCircle,           accent: 'text-emerald-400',
      glow: '#0d7c3d',             arcColor: '#10b981',
      progress: pct(stats.inProgressTasks),
      bg: 'bg-[#0a1f12]',
    },
    {
      title: 'Overdue Tasks',      value: stats.overdueTasks,
      change: 'needs attention',   trend: 'down',
      icon: AlertCircle,           accent: 'text-amber-400',
      glow: '#d97706',             arcColor: '#f59e0b',
      progress: pct(stats.overdueTasks),
      bg: 'bg-[#1a1505]',
    },
    {
      title: 'Completed',          value: stats.completedTasks,
      change: `${pct(stats.completedTasks)}% of total`, trend: 'up',
      icon: CheckCircle,           accent: 'text-green-400',
      glow: '#16a34a',             arcColor: '#4ade80',
      progress: pct(stats.completedTasks),
      bg: 'bg-[#071a0d]',
    },
    {
      title: 'Total Members',      value: stats.totalMembers,
      change: '+2 this session',   trend: 'up',
      icon: Users,                 accent: 'text-sky-400',
      glow: '#0284c7',             arcColor: '#38bdf8',
      progress: 100,
      bg: 'bg-[#060f18]',
    },
    {
      title: 'Meetings This Week', value: stats.upcomingMeetings,
      change: '+1 scheduled',      trend: 'up',
      icon: Calendar,              accent: 'text-violet-400',
      glow: '#7c3aed',             arcColor: '#a78bfa',
      progress: stats.upcomingMeetings > 0 ? 80 : 0,
      bg: 'bg-[#0e0818]',
    },
    {
      title: 'Pending Minutes',    value: stats.pendingMinutes,
      change: isAdmin ? 'action required' : 'view only', trend: stats.pendingMinutes > 0 ? 'down' : 'neutral',
      icon: FileText,              accent: 'text-rose-400',
      glow: '#e11d48',             arcColor: '#fb7185',
      progress: stats.pendingMinutes > 0 ? 30 : 0,
      bg: 'bg-[#1a060c]',
    },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&display=swap');`}</style>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statDefs.map((stat, i) => <StatCard key={stat.title} stat={stat} index={i} />)}
      </div>
    </>
  )
}