// src/app/dashboard/tasks/page.tsx
'use client'

import { authService } from '@/services/auth'
import { tasksService } from '@/services/tasks'
import { Task } from '@/services/dashboard'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, Plus, Calendar, MoreVertical, CheckSquare,
  Flame, Zap, Minus, ChevronDown,
  X, LayoutList, Columns, CalendarDays
} from 'lucide-react'
import { format } from 'date-fns'
import CreateTaskModal from '@/components/tasks/create-task-modal'

/* ─── Avatar helpers ─────────────────────────────── */
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
const AVATAR_COLORS = ['#3b82f6', '#10b981', '#a78bfa', '#f472b6', '#f59e0b', '#ef4444', '#06b6d4']
function getAvatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/* ─── Config ─────────────────────────────────────── */
const STATUS_CFG = {
  COMPLETED:   { label: 'Done',        dot: '#10b981', bar: '#10b981', pill: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  IN_PROGRESS: { label: 'In Progress', dot: '#60a5fa', bar: '#3b82f6', pill: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
  OVERDUE:     { label: 'Overdue',     dot: '#f59e0b', bar: '#f59e0b', pill: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  PENDING:     { label: 'Pending',     dot: '#6b7280', bar: '#4b5563', pill: 'bg-white/[0.05] text-white/40 border-white/10' },
}
const PRIORITY_CFG = {
  HIGH:   { Icon: Flame, pill: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  MEDIUM: { Icon: Zap,   pill: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  LOW:    { Icon: Minus, pill: 'bg-white/[0.04] text-white/30 border-white/[0.07]' },
}
const VIEWS = [
  { id: 'list', Icon: LayoutList, label: 'List' },
  { id: 'board', Icon: Columns, label: 'Board' },
  { id: 'calendar', Icon: CalendarDays, label: 'Calendar' },
]

/* ─── Status label → API key mapping ────────────── */
const STATUS_LABEL_TO_KEY: Record<string, string> = {
  'Pending':     'PENDING',
  'In Progress': 'IN_PROGRESS',
  'Completed':   'COMPLETED',
  'Overdue':     'OVERDUE',
}

/* ─── Animated progress bar ──────────────────────── */
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="relative h-1 w-24 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
        transition={{ duration: 1.1, ease: 'easeOut' }} />
      <motion.div className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-white/18 to-transparent"
        animate={{ left: ['-20%', '120%'] }}
        transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3.5 }} />
    </div>
  )
}

/* ─── Count-up stat chip ─────────────────────────── */
function StatChip({ value, label, color, delay = 0 }: { value: number; label: string; color: string; delay?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => {
      let i = 0; const steps = 28; const inc = value / steps
      const t = setInterval(() => {
        i += inc
        if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i))
      }, 38)
      return () => clearInterval(t)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: delay / 1000 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex flex-col gap-1">
      <span className="text-2xl font-black leading-none" style={{ fontFamily: 'Syne, sans-serif', color }}>{count}</span>
      <span className="text-[11px] text-white/30 font-bold tracking-[0.14em] uppercase">{label}</span>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function TasksPage() {
  const searchParams = useSearchParams()
  const [view, setView] = useState('list')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedPriority, setSelectedPriority] = useState('All Priorities')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('All Assignees')

  // Derive unique assignee names from loaded tasks
  const assigneeNames = Array.from(new Set(tasks.map(t => t.assignedTo.name))).sort()

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const raw = await tasksService.getTasks()
        const list: Task[] = Array.isArray(raw) ? raw : ((raw as any)?.tasks ?? (raw as any)?.data ?? [])
        setTasks(list)
      } catch (err) {
        console.error('Failed to load tasks:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  // Auto-open create modal when navigated here with ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsCreateModalOpen(true)
    }
  }, [searchParams])

  // Auto-mark overdue
  useEffect(() => {
    const check = () => {
      const today = new Date()
      setTasks(prev => prev.map(t =>
        t.status !== 'COMPLETED' && new Date(t.dueDate) < today ? { ...t, status: 'OVERDUE' as const } : t
      ))
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [])

  const handleCreateTask = (newTask: Task) => setTasks(prev => [newTask, ...prev])

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const updated = await tasksService.updateTaskStatus(taskId, { status: newStatus as any })
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  const getAvailableStatusUpdates = (s: string) => {
    if (s === 'PENDING') return ['IN_PROGRESS']
    if (s === 'IN_PROGRESS') return ['COMPLETED']
    if (s === 'OVERDUE') return ['IN_PROGRESS', 'COMPLETED']
    return []
  }

  const filteredTasks = tasks.filter(t => {
    const ms = selectedStatus === 'All Status' || t.status === STATUS_LABEL_TO_KEY[selectedStatus]
    const mp = selectedPriority === 'All Priorities' || t.priority === selectedPriority.toUpperCase()
    const mq = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase())
    const ma = selectedAssignee === 'All Assignees' || t.assignedTo.name === selectedAssignee
    return ms && mp && mq && ma
  })

  const statData = [
    { value: tasks.length,                                             label: 'Total Tasks',  color: '#e5e7eb', delay: 0 },
    { value: tasks.filter(t => t.status === 'COMPLETED').length,      label: 'Completed',    color: '#10b981', delay: 60 },
    { value: tasks.filter(t => t.status === 'OVERDUE').length,        label: 'Overdue',      color: '#f59e0b', delay: 120 },
    { value: tasks.filter(t => t.status === 'IN_PROGRESS').length,    label: 'In Progress',  color: '#60a5fa', delay: 180 },
  ]

  const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white/60 text-sm outline-none focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all cursor-pointer`

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} />

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Task Management
            </h1>
            <p className="text-sm text-white/30 mt-1">Assign, track and manage all department tasks</p>
          </div>
          {authService.isAdmin() && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start sm:self-auto
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Task</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statData.map(s => <StatChip key={s.label} {...s} />)}
        </div>

        {/* ── Filter Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#06100a] border border-white/[0.06]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/45" />
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks, assignees…"
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
            { val: selectedStatus,   set: setSelectedStatus,   opts: ['All Status','Pending','In Progress','Completed','Overdue'] },
            { val: selectedPriority, set: setSelectedPriority, opts: ['All Priorities','High','Medium','Low'] },
            { val: selectedAssignee, set: setSelectedAssignee, opts: ['All Assignees', ...assigneeNames] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.val} onChange={e => sel.set(e.target.value)} className={selCls}>
                {sel.opts.map(o => <option key={o} value={o} className="bg-[#06100a] text-white">{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* ── View Toggle + Count ── */}
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5 p-1 rounded-xl bg-[#06100a] border border-white/[0.06]">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                  ${view === v.id ? 'bg-[#0d7c3d] text-white shadow-[0_2px_12px_rgba(13,124,61,0.35)]' : 'text-white/30 hover:text-white/55'}`}>
                <v.Icon className="w-3.5 h-3.5" />{v.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-white/22 font-medium">{filteredTasks.length} of {tasks.length} tasks</span>
        </div>

        {/* ── Tasks Table ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>

          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full" />
              <p className="text-white/22 text-sm">Loading tasks…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Task','Assignee','Due Date','Priority','Status','Progress','Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, i) => {
                    const sCfg = STATUS_CFG[task.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.PENDING
                    const pCfg = PRIORITY_CFG[task.priority as keyof typeof PRIORITY_CFG] ?? PRIORITY_CFG.LOW
                    const updates = getAvailableStatusUpdates(task.status)
                    const initials = getInitials(task.assignedTo.name)
                    const avatarColor = getAvatarColor(task.assignedTo.name)

                    return (
                      <motion.tr key={task.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 + i * 0.055 }}
                        className="group relative border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors duration-200">

                        {/* Priority left bar */}
                        <td className="py-4 pl-5 pr-4">
                          <div className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            ${task.priority === 'HIGH' ? 'bg-rose-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-transparent'}`} />
                          <p className="text-sm font-semibold text-white/78 truncate max-w-[220px] group-hover:text-white transition-colors">{task.title}</p>
                          <p className="text-[11px] text-white/22 truncate max-w-[220px] mt-0.5">{task.description}</p>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                              style={{ background: avatarColor + '22', border: `1px solid ${avatarColor}38`, color: avatarColor }}>
                              {initials}
                            </div>
                            <span className="text-xs text-white/45 truncate max-w-[90px]">{task.assignedTo.name}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-white/38">
                            <Calendar className="w-3 h-3 text-emerald-400/35" />
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${pCfg.pill}`}>
                            <pCfg.Icon className="w-3 h-3" />
                            {task.priority[0] + task.priority.slice(1).toLowerCase()}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sCfg.pill}`}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sCfg.dot }} />
                            {sCfg.label}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <ProgressBar progress={task.progress ?? 0} color={sCfg.bar} />
                            <span className="text-[11px] text-white/28 w-7 shrink-0">{task.progress ?? 0}%</span>
                          </div>
                        </td>

                        <td className="py-4 pr-5 pl-4">
                          <div className="flex items-center gap-1.5">
                            {updates.length > 0 && (
                              <div className="relative">
                                <select value="" onChange={e => handleStatusUpdate(task.id, e.target.value)}
                                  className="appearance-none pl-3 pr-6 py-1.5 rounded-xl text-[11px] font-bold
                                    bg-[#0d7c3d]/12 border border-[#0d7c3d]/22 text-emerald-400
                                    outline-none cursor-pointer hover:bg-[#0d7c3d]/22 transition-colors">
                                  <option value="" className="bg-[#06100a]">Update</option>
                                  {updates.map(s => <option key={s} value={s} className="bg-[#06100a]">
                                    {s === 'IN_PROGRESS' ? 'Start' : s === 'COMPLETED' ? 'Complete' : 'Update'}
                                  </option>)}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400/45 pointer-events-none" />
                              </div>
                            )}
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/50 p-1">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>

              {filteredTasks.length === 0 && !loading && (
                <div className="py-16 flex flex-col items-center gap-3">
                  <CheckSquare className="w-10 h-10 text-white/8" />
                  <p className="text-white/22 text-sm">
                    {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
