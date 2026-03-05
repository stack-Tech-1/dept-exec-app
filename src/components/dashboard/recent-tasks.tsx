// src/components/dashboard/recent-tasks.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Clock, AlertCircle, MoreVertical, ArrowRight, Plus, Flame, Zap, Minus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { dashboardService, Task } from '@/services/dashboard'
import { format } from 'date-fns'
import Link from 'next/link'

/* ─── Status config ─────────────────────────────── */
const STATUS = {
  COMPLETED:   { label: 'Done',        dot: '#10b981', bar: '#10b981', bg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  IN_PROGRESS: { label: 'In Progress', dot: '#60a5fa', bar: '#3b82f6', bg: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  OVERDUE:     { label: 'Overdue',     dot: '#f59e0b', bar: '#f59e0b', bg: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  PENDING:     { label: 'Pending',     dot: '#6b7280', bar: '#6b7280', bg: 'bg-white/5 text-white/40 border-white/10' },
}

const PRIORITY_ICON: Record<string, React.ElementType> = {
  HIGH:   Flame,
  MEDIUM: Zap,
  LOW:    Minus,
}
const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'text-rose-400',
  MEDIUM: 'text-amber-400',
  LOW:    'text-white/30',
}

/* ─── Animated progress bar ──────────────────────── */
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="relative h-1 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ left: '-10%' }}
        animate={{ left: '110%' }}
        transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
      />
    </div>
  )
}

/* ─── Single task row ────────────────────────────── */
function TaskRow({ task, index }: { task: Task; index: number }) {
  const status = STATUS[task.status as keyof typeof STATUS] ?? STATUS.PENDING
  const PriorityIcon = PRIORITY_ICON[task.priority] ?? Minus
  const initials = task.assignedTo.name.slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="group relative px-5 py-4 hover:bg-white/[0.025] transition-colors duration-200"
    >
      {/* Priority left-bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${
        task.priority === 'HIGH' ? 'bg-rose-500' :
        task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-transparent'
      }`} />

      {/* Row layout */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 shrink-0 mt-0.5 ring-1 ring-white/[0.08]">
          <AvatarFallback className="text-[10px] font-bold bg-[#0d7c3d]/30 text-emerald-300">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <PriorityIcon className={`shrink-0 w-3.5 h-3.5 ${PRIORITY_COLOR[task.priority]}`} />
              <span className="text-sm font-medium text-white/85 truncate group-hover:text-white transition-colors">
                {task.title}
              </span>
            </div>
            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.bg}`}>
              {status.label}
            </span>
          </div>

          {/* Progress + meta row */}
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/25">{task.assignedTo.name}</span>
                <span className="text-[10px] font-semibold text-white/50">{task.progress ?? 0}%</span>
              </div>
              <ProgressBar progress={task.progress ?? 0} color={status.bar} />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-white/30 shrink-0">
              <Clock className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */
function TaskSkeleton() {
  return (
    <div className="px-5 py-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/[0.05] shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-white/[0.05] rounded w-3/4" />
          <div className="h-2 bg-white/[0.04] rounded w-full" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getRecentTasks(4)
      .then(data => setTasks(data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0d7c3d]/15 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Recent Tasks
              </h3>
              <p className="text-[11px] text-white/35">Needs immediate attention</p>
            </div>
          </div>
          <Link href="/dashboard/tasks"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400
              hover:text-emerald-300 transition-colors tracking-wide uppercase">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Task list */}
        <div className="divide-y divide-white/[0.04]">
          {loading
            ? [0,1,2,3].map(i => <TaskSkeleton key={i} />)
            : tasks.length === 0
              ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-sm text-white/30">No tasks yet</p>
                </div>
              )
              : tasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} />)
          }
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <Link href="/dashboard/tasks/create">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                border border-dashed border-white/10 text-white/30
                hover:border-emerald-500/30 hover:text-emerald-400
                text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Task
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  )
}