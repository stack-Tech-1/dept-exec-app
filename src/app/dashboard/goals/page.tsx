// src/app/dashboard/goals/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Target, Calendar, Users, Flag, Plus,
  MoreVertical, CheckCircle, AlertCircle, Clock,
  ArrowUpRight, Flame, Zap, Minus, ChevronDown, X, TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import CreateGoalModal from '@/components/goals/create-goal-modal'
import { goalsService, type Goal } from '@/services/goals'
import { authService } from '@/services/auth'

/* ─── SVG Arc ring ───────────────────────────────── */
function ArcRing({ progress, health, size = 52 }: { progress: number; health: string; size?: number }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const color = health === 'healthy' ? '#10b981' : health === 'warning' ? '#f59e0b' : '#f43f5e'
  const offset = circ - (progress / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 5px ${color}80)` }} />
    </svg>
  )
}

/* ─── Count-up chip ──────────────────────────────── */
function StatChip({ value, label, color, delay = 0 }: { value: number; label: string; color: string; delay?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let i = 0; const steps = 26; const inc = value / steps
      const id = setInterval(() => { i += inc; if (i >= value) { setCount(value); clearInterval(id) } else setCount(Math.floor(i)) }, 40)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay / 1000 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex flex-col gap-1">
      <span className="text-2xl font-black leading-none" style={{ fontFamily: 'Syne, sans-serif', color }}>{count}</span>
      <span className="text-[11px] text-white/30 font-bold tracking-[0.14em] uppercase">{label}</span>
    </motion.div>
  )
}

/* ─── Helpers ────────────────────────────────────── */
const CATEGORY_CFG: Record<string, { bg: string; border: string; text: string }> = {
  academic:       { bg: 'bg-violet-500/12', border: 'border-violet-500/25', text: 'text-violet-400' },
  administrative: { bg: 'bg-sky-500/12',    border: 'border-sky-500/25',    text: 'text-sky-400' },
  social:         { bg: 'bg-pink-500/12',   border: 'border-pink-500/25',   text: 'text-pink-400' },
  infrastructure: { bg: 'bg-amber-500/12',  border: 'border-amber-500/25',  text: 'text-amber-400' },
  other:          { bg: 'bg-white/[0.05]',  border: 'border-white/[0.08]',  text: 'text-white/40' },
}
const PRIORITY_CFG = {
  critical: { Icon: Flame, pill: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  high:     { Icon: Flame, pill: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  medium:   { Icon: Zap,   pill: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  low:      { Icon: Minus, pill: 'bg-white/[0.04] text-white/30 border-white/[0.07]' },
}
const STATUS_CFG = {
  completed:   { label: 'Completed',   dot: '#10b981', pill: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', Icon: CheckCircle },
  'in-progress':{ label: 'In Progress',dot: '#60a5fa', pill: 'bg-blue-400/10 text-blue-400 border-blue-400/20',         Icon: Clock },
  'at-risk':   { label: 'At Risk',     dot: '#f59e0b', pill: 'bg-amber-400/10 text-amber-400 border-amber-400/20',     Icon: AlertCircle },
  planned:     { label: 'Planned',     dot: '#6b7280', pill: 'bg-white/[0.04] text-white/35 border-white/[0.07]',      Icon: Clock },
}
const cap = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')
  const currentUser = authService.getCurrentUser()

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    try { setGoals(await goalsService.getAllGoals()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCreateGoal = async (data: any) => {
    try { await goalsService.createGoal(data); fetchGoals() }
    catch (e) { console.error(e) }
  }

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      await goalsService.updateGoal(goalId, { progress, status: progress === 100 ? 'completed' : 'in-progress' } as any)
      fetchGoals()
    } catch (e) { console.error(e) }
  }

  const categories = Array.from(new Set(goals.map(g => g.category))).filter(Boolean)
  const statuses   = Array.from(new Set(goals.map(g => g.status))).filter(Boolean)
  const priorities = Array.from(new Set(goals.map(g => g.priority))).filter(Boolean)

  const filteredGoals = goals.filter(g =>
    (selectedCategory === 'All' || g.category === selectedCategory) &&
    (selectedStatus   === 'All' || g.status   === selectedStatus) &&
    (selectedPriority === 'All' || g.priority === selectedPriority) &&
    (!searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    atRisk: goals.filter(g => g.status === 'at-risk').length,
    avgProgress: goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0,
  }

  const statData = [
    { value: stats.total,      label: 'Total Goals',  color: '#e5e7eb', delay: 0 },
    { value: stats.completed,  label: 'Completed',    color: '#10b981', delay: 60 },
    { value: stats.inProgress, label: 'In Progress',  color: '#60a5fa', delay: 120 },
    { value: stats.atRisk,     label: 'At Risk',      color: '#f59e0b', delay: 180 },
    { value: stats.avgProgress,label: 'Avg Progress', color: '#a78bfa', delay: 240 },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <CreateGoalModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateGoal={handleCreateGoal} />

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Department Goals
            </h1>
            <p className="text-sm text-white/30 mt-1">Track and manage long-term department objectives</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Goal</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statData.map(s => <StatChip key={s.label} {...s} />)}
        </div>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#06100a] border border-white/[0.06]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/45" />
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search goals, tags…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white text-sm placeholder:text-white/18 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {[
            { val: selectedCategory, set: setSelectedCategory, opts: ['All', ...categories.map(c => c)], labels: ['All Categories', ...categories.map(cap)] },
            { val: selectedStatus,   set: setSelectedStatus,   opts: ['All', ...statuses],   labels: ['All Status', ...statuses.map(cap)] },
            { val: selectedPriority, set: setSelectedPriority, opts: ['All', ...priorities], labels: ['All Priorities', ...priorities.map(cap)] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.val} onChange={e => sel.set(e.target.value)} className={selCls}>
                {sel.opts.map((o, j) => <option key={o} value={o} className="bg-[#06100a] text-white">{sel.labels[j]}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          ))}
          <span className="text-xs text-white/22 ml-auto">{filteredGoals.length} of {goals.length}</span>
        </motion.div>

        {/* ── Goals Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-6 space-y-3 animate-pulse">
                <div className="h-4 w-3/4 bg-white/[0.05] rounded" />
                <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                <div className="h-1.5 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 rounded-2xl bg-[#06100a] border border-white/[0.06]">
            <Target className="w-10 h-10 text-white/8" />
            <p className="text-white/22 text-sm">No goals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredGoals.map((goal, i) => {
              const health = goalsService.calculateGoalHealth(goal)
              const catCfg = CATEGORY_CFG[goal.category] ?? CATEGORY_CFG.other
              const priCfg = PRIORITY_CFG[goal.priority as keyof typeof PRIORITY_CFG] ?? PRIORITY_CFG.low
              const staCfg = STATUS_CFG[goal.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.planned
              const healthColor = health === 'healthy' ? '#10b981' : health === 'warning' ? '#f59e0b' : '#f43f5e'

              return (
                <motion.div key={goal.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.07 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="group rounded-2xl bg-[#06100a] border border-white/[0.06] p-5 relative overflow-hidden"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>

                  {/* Health accent top bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, transparent, ${healthColor}80, transparent)` }} />

                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-4">
                      {/* Tags row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catCfg.bg} ${catCfg.border} ${catCfg.text}`}>
                          {cap(goal.category)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priCfg.pill}`}>
                          <priCfg.Icon className="w-2.5 h-2.5" />
                          {cap(goal.priority)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${staCfg.pill}`}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: staCfg.dot }} />
                          {staCfg.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                        {goal.title}
                      </h3>
                      <p className="text-[11px] text-white/28 mt-1 line-clamp-2 leading-relaxed">{goal.description}</p>
                    </div>

                    {/* Arc ring */}
                    <div className="shrink-0 relative flex items-center justify-center w-14 h-14">
                      <ArcRing progress={goal.progress} health={health} size={52} />
                      <span className="absolute text-[11px] font-black leading-none"
                        style={{ fontFamily: 'Syne, sans-serif', color: healthColor }}>
                        {goal.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Progress meta */}
                  <div className="flex items-center justify-between text-[11px] mb-3">
                    <span className="text-white/28">Expected: {goal.expectedProgress}%</span>
                    {health === 'healthy' && goal.progress > goal.expectedProgress && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ArrowUpRight className="w-3 h-3" />
                        +{goal.progress - goal.expectedProgress}% ahead
                      </span>
                    )}
                    <span className={`text-xs font-semibold ${goal.daysRemaining > 0 ? 'text-white/40' : 'text-rose-400'}`}>
                      {goal.daysRemaining > 0 ? `${goal.daysRemaining}d left` : 'Overdue'}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-[11px] text-white/30 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-emerald-400/35" />
                      {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-sky-400/35" />
                      {goal.assignedTo.length} assigned
                    </div>
                  </div>

                  {/* Tags */}
                  {goal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {goal.tags.slice(0, 3).map((tag, j) => (
                        <span key={j} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] text-white/35 text-[10px] rounded-lg">
                          {tag}
                        </span>
                      ))}
                      {goal.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] text-white/25 text-[10px] rounded-lg">
                          +{goal.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => window.location.href = `/dashboard/goals/${goal.id}`}
                      className="relative overflow-hidden flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                        text-white text-xs font-bold shadow-[0_4px_16px_rgba(13,124,61,0.3)]">
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                        animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} />
                      <span className="relative z-10">View Details</span>
                    </motion.button>
                    <button className="py-2.5 px-4 rounded-xl border border-white/[0.09] text-white/45 text-xs font-semibold
                      hover:text-white/70 hover:border-white/18 transition-colors">
                      Add Task
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}