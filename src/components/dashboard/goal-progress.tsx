// src/components/dashboard/goal-progress.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, ArrowRight, Plus, Flame, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { goalsService, type Goal } from '@/services/goals'
import Link from 'next/link'

/* ─── SVG circular progress ring ────────────────── */
function CircleRing({ progress, health, size = 64 }: {
  progress: number; health: 'healthy' | 'warning' | 'critical'; size?: number
}) {
  const stroke = 5
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (progress / 100) * circ

  const color = health === 'healthy' ? '#10b981' : health === 'warning' ? '#f59e0b' : '#f43f5e'
  const glow  = health === 'healthy' ? '#10b98140' : health === 'warning' ? '#f59e0b40' : '#f43f5e40'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
        />
      </svg>
      {/* Centre number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
          {progress}%
        </span>
      </div>
    </div>
  )
}

/* ─── Health icon ────────────────────────────────── */
function HealthBadge({ health }: { health: 'healthy' | 'warning' | 'critical' }) {
  if (health === 'healthy')  return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
  if (health === 'warning')  return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
  return <Flame className="w-3.5 h-3.5 text-rose-400" />
}

/* ─── Single goal row ────────────────────────────── */
function GoalRow({ goal, index }: { goal: Goal; index: number }) {
  const health = goalsService.calculateGoalHealth(goal) as 'healthy' | 'warning' | 'critical'
  const healthLabel = { healthy: 'On Track', warning: 'At Risk', critical: 'Overdue' }
  const healthColor = {
    healthy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    critical: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
      className="group relative px-5 py-4 hover:bg-white/[0.025] transition-colors duration-200 cursor-pointer"
    >
      {/* Left accent line */}
      <motion.div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: health === 'healthy' ? '#10b981' : health === 'warning' ? '#f59e0b' : '#f43f5e' }}
      />

      <div className="flex items-center gap-4">
        {/* Ring */}
        <CircleRing progress={goal.progress} health={health} size={60} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-white transition-colors">
              {goal.title}
            </h4>
            <Link href={`/dashboard/goals/${goal.id}`}
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Health badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${healthColor[health]}`}>
              <HealthBadge health={health} />
              {healthLabel[health]}
            </span>

            {/* Days remaining */}
            <span className="flex items-center gap-1 text-[11px] text-white/35">
              <Clock className="w-3 h-3" />
              {goal.daysRemaining}d left
            </span>

            {/* Tasks count */}
            <span className="text-[11px] text-white/35">
              {goal.tasks.length} tasks
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Loading skeleton ───────────────────────────── */
function GoalSkeleton() {
  return (
    <div className="px-5 py-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-15 h-15 rounded-full bg-white/[0.06] shrink-0" style={{ width: 60, height: 60 }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/[0.06] rounded w-3/4" />
          <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function GoalProgress() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    goalsService.getDashboardGoals(3)
      .then(setGoals)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&display=swap');`}</style>
      <div className="rounded-2xl bg-[#061510] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(13,124,61,0.12)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0d7c3d]/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Goal Progress
              </h3>
              <p className="text-[11px] text-white/35">Department objectives</p>
            </div>
          </div>
          <Link href="/dashboard/goals"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400
              hover:text-emerald-300 transition-colors tracking-wide uppercase">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Goals list */}
        <div className="divide-y divide-white/[0.04]">
          {loading
            ? [0,1,2].map(i => <GoalSkeleton key={i} />)
            : goals.length === 0
              ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    <Target className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-sm text-white/30">No active goals found</p>
                </div>
              )
              : goals.map((goal, i) => <GoalRow key={goal.id} goal={goal} index={i} />)
          }
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <Link href="/dashboard/goals/create">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                border border-dashed border-emerald-500/20 text-emerald-400/70
                hover:border-emerald-500/40 hover:text-emerald-400
                text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New Goal
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  )
}