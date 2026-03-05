// src/components/tasks/create-task-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Target, Flame, Zap, Minus, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { tasksService } from '@/services/tasks'
import { userService } from '@/services/user'
import { goalsService } from '@/services/goals'

const PRIORITIES = [
  { value: 'HIGH',   Icon: Flame, label: 'High',   accent: '#f43f5e', base: 'border-white/[0.07] bg-white/[0.03]', glow: 'border-rose-500/50 bg-rose-500/12 shadow-[0_0_22px_rgba(244,63,94,0.22)]' },
  { value: 'MEDIUM', Icon: Zap,   label: 'Medium', accent: '#f59e0b', base: 'border-white/[0.07] bg-white/[0.03]', glow: 'border-amber-500/50 bg-amber-500/12 shadow-[0_0_22px_rgba(245,158,11,0.22)]' },
  { value: 'LOW',    Icon: Minus, label: 'Low',    accent: '#6b7280', base: 'border-white/[0.07] bg-white/[0.03]', glow: 'border-white/25 bg-white/[0.07] shadow-none' },
]

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (taskData: any) => void
}

const inputCls = `w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/18 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">{children}</p>
}

export default function CreateTaskModal({ isOpen, onClose, onCreateTask }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM', goalId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<{ id: string; name: string; position: string }[]>([])
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([])

  const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }))

  // Fetch users and goals when modal opens
  useEffect(() => {
    if (!isOpen) return
    userService.getAllUsers()
      .then(data => {
        const raw = Array.isArray(data) ? data : (data as any)?.users ?? (data as any)?.data ?? []
        setUsers(raw.map((u: any) => ({ id: u.id ?? u._id, name: u.name, position: u.position })))
      })
      .catch(() => {})
    goalsService.getDashboardGoals()
      .then((data: any[]) => setGoals(data.map(g => ({ id: g.id ?? g._id, title: g.title }))))
      .catch(() => {})
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.assignedTo) return
    setError('')
    setSubmitting(true)

    try {
      const created = await tasksService.createTask({
        title:       formData.title,
        description: formData.description,
        assignedTo:  formData.assignedTo,
        dueDate:     formData.dueDate,
        priority:    formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
      })
      setDone(true)
      setTimeout(() => {
        onCreateTask(created)
        setFormData({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM', goalId: '' })
        setSubmitting(false)
        setDone(false)
        onClose()
      }, 700)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create task. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.82)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Top shimmer */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0d7c3d]/20 border border-[#0d7c3d]/25 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create New Task</h2>
                  <p className="text-[11px] text-white/30">Assign to a department executive</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <Label>Task Title *</Label>
                <input type="text" value={formData.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g., Prepare budget proposal for faculty board"
                  className={inputCls} required />
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <textarea value={formData.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the task details, expectations, and deliverables…"
                  rows={3} className={`${inputCls} resize-none`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Assignee chips — real users from API */}
                <div>
                  <Label>Assign To Executive *</Label>
                  {users.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {users.map(user => (
                        <motion.button key={user.id} type="button" whileTap={{ scale: 0.92 }}
                          onClick={() => set('assignedTo', user.id)}
                          className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200
                            ${formData.assignedTo === user.id
                              ? 'border-emerald-500/60 bg-emerald-500/12 text-white shadow-[0_4px_16px_rgba(13,124,61,0.25)]'
                              : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                            }`}>
                          <div className="w-5 h-5 rounded-full bg-[#0d7c3d]/30 flex items-center justify-center text-[9px] font-black text-emerald-400">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          {user.name}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 py-2">Loading members…</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <Label>Due Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                    <input type="date" value={formData.dueDate} onChange={e => set('dueDate', e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className={`${inputCls} pl-10`} required />
                  </div>
                </div>

                {/* Priority visual tiles */}
                <div>
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {PRIORITIES.map(p => (
                      <motion.button key={p.value} type="button" whileTap={{ scale: 0.93 }}
                        onClick={() => set('priority', p.value)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[11px] font-bold transition-all duration-200
                          ${formData.priority === p.value ? p.glow : p.base}`}>
                        <p.Icon className="w-4 h-4" style={{ color: formData.priority === p.value ? p.accent : 'rgba(255,255,255,0.3)' }} />
                        <span style={{ color: formData.priority === p.value ? p.accent : 'rgba(255,255,255,0.3)' }}>{p.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Related goal — only shown if goals available */}
                {goals.length > 0 && (
                  <div>
                    <Label>Related Goal (Optional)</Label>
                    <div className="relative">
                      <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <select value={formData.goalId} onChange={e => set('goalId', e.target.value)}
                        className={`${inputCls} pl-10 appearance-none cursor-pointer`}>
                        <option value="" className="bg-[#07150f]">Select goal (optional)</option>
                        {goals.map(g => <option key={g.id} value={g.id} className="bg-[#07150f]">{g.title}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold
                    hover:text-white/70 hover:border-white/18 transition-colors">
                  Cancel
                </button>
                <motion.button type="submit"
                  disabled={submitting || !formData.assignedTo}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 relative overflow-hidden py-3 rounded-2xl
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                    shadow-[0_8px_24px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-[0_12px_32px_rgba(13,124,61,0.45)] transition-shadow">
                  {!submitting && (
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                      animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Task Created!
                        </motion.span>
                      ) : submitting ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Creating…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Create Task
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
