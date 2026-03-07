// src/components/goals/create-goal-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, Target, Flag, Tag, Users, DollarSign,
  BarChart, FileText, Plus, Minus, CheckCircle
} from 'lucide-react'
import { userService, type User } from '@/services/user'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGoal: (data: any) => Promise<void>
}

/* ─── Shared input style ─────────────────────────── */
const inp = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/18 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

function SectionHeader({ Icon, label }: { Icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-lg bg-[#0d7c3d]/20 border border-[#0d7c3d]/25 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <h3 className="text-sm font-black text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>{label}</h3>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/32 mb-1.5">{children}</p>
}

const CATEGORIES = [
  { value: 'academic',       label: 'Academic',       accent: '#a78bfa', cls: 'border-violet-500/45 bg-violet-500/12 text-violet-300' },
  { value: 'administrative', label: 'Admin',          accent: '#60a5fa', cls: 'border-sky-500/45 bg-sky-500/12 text-sky-300' },
  { value: 'social',         label: 'Social',         accent: '#f472b6', cls: 'border-pink-500/45 bg-pink-500/12 text-pink-300' },
  { value: 'infrastructure', label: 'Infrastructure', accent: '#f59e0b', cls: 'border-amber-500/45 bg-amber-500/12 text-amber-300' },
  { value: 'other',          label: 'Other',          accent: '#9ca3af', cls: 'border-white/25 bg-white/[0.06] text-white/50' },
]
const PRIORITIES = [
  { value: 'low',      label: 'Low',      accent: '#6b7280', cls: 'border-white/20 bg-white/[0.04] text-white/40' },
  { value: 'medium',   label: 'Medium',   accent: '#f59e0b', cls: 'border-amber-500/45 bg-amber-500/12 text-amber-300' },
  { value: 'high',     label: 'High',     accent: '#f43f5e', cls: 'border-rose-500/45 bg-rose-500/12 text-rose-300' },
  { value: 'critical', label: 'Critical', accent: '#ef4444', cls: 'border-red-500/55 bg-red-500/18 text-red-300' },
]
const AVATAR_COLORS = ['#3b82f6','#10b981','#a78bfa','#f472b6','#f59e0b','#34d399','#60a5fa']
const getColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

export default function CreateGoalModal({ isOpen, onClose, onCreateGoal }: CreateGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('administrative')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [department, setDepartment] = useState('IPE Department')
  const [assignedTo, setAssignedTo] = useState<string[]>([])
  const [kpis, setKpis] = useState<Array<{ name: string; target: number; unit: string }>>([])
  const [budget, setBudget] = useState({ allocated: 0, currency: 'NGN' })
  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; targetDate: string }>>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [executives, setExecutives] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingExecs, setLoadingExecs] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { if (isOpen) fetchExecs() }, [isOpen])

  const fetchExecs = async () => {
    try {
      setLoadingExecs(true)
      const data = await userService.getAllUsers()
      setExecutives(data.filter(u => u.role === 'EXEC' && u.isActive))
    } catch (e) { console.error(e) }
    finally { setLoadingExecs(false) }
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('administrative'); setTargetDate('')
    setPriority('medium'); setDepartment('IPE Department'); setAssignedTo([])
    setKpis([]); setBudget({ allocated: 0, currency: 'NGN' }); setMilestones([])
    setTags([]); setTagInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !targetDate) return
    setLoading(true)
    try {
      await onCreateGoal({ title, description, category, targetDate, priority, department, assignedTo, kpis: kpis.filter(k => k.name && k.target > 0), budget, milestones: milestones.filter(m => m.title && m.targetDate), tags })
      setDone(true)
      setTimeout(() => { resetForm(); setDone(false); onClose() }, 800)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleAssignee = (id: string) => setAssignedTo(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const addTag = () => { if (tagInput.trim() && !tags.includes(tagInput.trim())) { setTags(p => [...p, tagInput.trim()]); setTagInput('') } }

  if (typeof window === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.84)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 255, damping: 26 }}
            className="w-full max-w-4xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12)',
            }}>

            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0d7c3d]/18 border border-[#0d7c3d]/25 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create New Goal</h2>
                  <p className="text-[11px] text-white/30">Define a new department objective</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
              <div className="px-7 py-6 space-y-8">

                {/* ── Basic Info ── */}
                <div>
                  <SectionHeader Icon={Target} label="Basic Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Goal Title *</Label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g., Department Orientation 2025"
                        className={inp} required />
                    </div>
                    <div>
                      <Label>Target Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                        <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                          className={`${inp} pl-10`} required />
                      </div>
                    </div>

                    {/* Category tiles */}
                    <div>
                      <Label>Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(c => (
                          <motion.button key={c.value} type="button" whileTap={{ scale: 0.93 }}
                            onClick={() => setCategory(c.value)}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200
                              ${category === c.value ? c.cls : 'border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-white/55 hover:bg-white/[0.05]'}`}>
                            {c.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Priority tiles */}
                    <div>
                      <Label>Priority</Label>
                      <div className="flex flex-wrap gap-2">
                        {PRIORITIES.map(p => (
                          <motion.button key={p.value} type="button" whileTap={{ scale: 0.93 }}
                            onClick={() => setPriority(p.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200
                              ${priority === p.value ? p.cls : 'border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-white/55'}`}>
                            <Flag className="w-2.5 h-2.5" />
                            {p.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        rows={3} placeholder="Describe the goal, its purpose, and expected outcomes…"
                        className={`${inp} resize-none`} />
                    </div>
                  </div>
                </div>

                {/* ── Assignees ── */}
                <div>
                  <SectionHeader Icon={Users} label="Assignees" />
                  {loadingExecs ? (
                    <div className="flex items-center gap-3 text-white/30 text-sm">
                      <motion.div className="w-4 h-4 border-2 border-white/20 border-t-white/50 rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
                      Loading executives…
                    </div>
                  ) : executives.length === 0 ? (
                    <p className="text-white/25 text-sm">No executives found</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {executives.map(exec => {
                        const color = getColor(exec.name)
                        const selected = assignedTo.includes(exec.id)
                        return (
                          <motion.div key={exec.id} whileTap={{ scale: 0.97 }}
                            onClick={() => toggleAssignee(exec.id)}
                            className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200
                              ${selected ? 'border-[1.5px]' : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05]'}`}
                            style={selected ? { borderColor: color, background: color + '12', boxShadow: `0 4px 16px ${color}20` } : {}}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                              style={{ background: color + '22', border: `1.5px solid ${color}38`, color }}>
                              {exec.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white/80 truncate">{exec.name}</p>
                              <p className="text-[11px] text-white/30 truncate">{exec.position}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-none' : 'border-white/15 bg-transparent'}`}
                              style={selected ? { background: color } : {}}>
                              {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── KPIs ── */}
                <div>
                  <SectionHeader Icon={BarChart} label="Key Performance Indicators" />
                  <div className="space-y-2.5">
                    {kpis.map((kpi, idx) => (
                      <div key={idx} className="flex gap-2 items-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                          {[
                            { val: kpi.name, ph: 'KPI Name', onChange: (v: string) => { const k=[...kpis]; k[idx]={...k[idx],name:v}; setKpis(k) }, type: 'text' },
                            { val: kpi.target, ph: 'Target Value', onChange: (v: string) => { const k=[...kpis]; k[idx]={...k[idx],target:parseFloat(v)||0}; setKpis(k) }, type: 'number' },
                            { val: kpi.unit, ph: 'Unit (%, NGN…)', onChange: (v: string) => { const k=[...kpis]; k[idx]={...k[idx],unit:v}; setKpis(k) }, type: 'text' },
                          ].map((f, fi) => (
                            <input key={fi} type={f.type} value={f.val as any} onChange={e => f.onChange(e.target.value)}
                              placeholder={f.ph} className={inp} />
                          ))}
                        </div>
                        <button type="button" onClick={() => setKpis(kpis.filter((_,i)=>i!==idx))}
                          className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setKpis([...kpis, { name:'', target:0, unit:'' }])}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/[0.08] text-white/30 hover:text-emerald-400 hover:border-emerald-500/25 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />Add KPI
                    </button>
                  </div>
                </div>

                {/* ── Budget ── */}
                <div>
                  <SectionHeader Icon={DollarSign} label="Budget" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Allocated Budget</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                        <input type="number" value={budget.allocated} min="0" step="0.01"
                          onChange={e => setBudget({...budget, allocated: parseFloat(e.target.value)||0})}
                          className={`${inp} pl-10`} placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <select value={budget.currency} onChange={e => setBudget({...budget, currency: e.target.value})}
                        className={`${inp} appearance-none cursor-pointer`}>
                        {['NGN - Nigerian Naira','USD - US Dollar','EUR - Euro','GBP - British Pound'].map(c => (
                          <option key={c} value={c.split(' ')[0]} className="bg-[#07150f]">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Milestones ── */}
                <div>
                  <SectionHeader Icon={FileText} label="Milestones" />
                  <div className="space-y-2.5">
                    {milestones.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input type="text" value={m.title}
                              onChange={e => { const ms=[...milestones]; ms[idx]={...ms[idx],title:e.target.value}; setMilestones(ms) }}
                              placeholder="Milestone Title" className={inp} />
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                              <input type="date" value={m.targetDate}
                                onChange={e => { const ms=[...milestones]; ms[idx]={...ms[idx],targetDate:e.target.value}; setMilestones(ms) }}
                                className={`${inp} pl-10`} />
                            </div>
                          </div>
                          <button type="button" onClick={() => setMilestones(milestones.filter((_,i)=>i!==idx))}
                            className="w-7 h-7 mt-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea value={m.description} rows={2}
                          onChange={e => { const ms=[...milestones]; ms[idx]={...ms[idx],description:e.target.value}; setMilestones(ms) }}
                          placeholder="Milestone description…" className={`${inp} resize-none`} />
                      </div>
                    ))}
                    <button type="button" onClick={() => setMilestones([...milestones, {title:'',description:'',targetDate:''}])}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/[0.08] text-white/30 hover:text-emerald-400 hover:border-emerald-500/25 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />Add Milestone
                    </button>
                  </div>
                </div>

                {/* ── Tags ── */}
                <div>
                  <SectionHeader Icon={Tag} label="Tags" />
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="Add a tag and press Enter…" className={`${inp} flex-1`} />
                    <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={addTag}
                      className="px-4 py-2.5 rounded-xl bg-[#0d7c3d]/80 border border-[#0d7c3d]/40 text-white text-sm font-bold hover:bg-[#0d7c3d] transition-colors">
                      Add
                    </motion.button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0d7c3d]/15 border border-[#0d7c3d]/25 text-emerald-400 text-[11px] font-semibold">
                          {t}
                          <button type="button" onClick={() => setTags(tags.filter(x => x !== t))}
                            className="text-emerald-400/60 hover:text-emerald-400">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-7 py-5 border-t border-white/[0.05]">
                <button type="button" onClick={onClose} disabled={loading}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold hover:text-white/70 hover:border-white/18 transition-colors">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 relative overflow-hidden py-3 rounded-2xl
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                    shadow-[0_8px_24px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-[0_12px_32px_rgba(13,124,61,0.45)] transition-shadow">
                  {!loading && <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />Goal Created!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Creating…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />Create Goal
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
    </AnimatePresence>,
    document.body
  )
}