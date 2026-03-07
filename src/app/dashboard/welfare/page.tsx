'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartHandshake, ChevronDown, ChevronUp, ExternalLink,
  MessageSquare, Clock, AlertTriangle, Loader2, Send, Lock, Users
} from 'lucide-react'
import API from '@/services/api'
import { welfareService, type WelfareTicket, type WelfareStats, type WelfareCategory, type WelfareStatus, type WelfarePriority } from '@/services/welfare'

/* ─── CountUp ────────────────────────────────────── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target === 0) { setValue(0); return }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

/* ─── Time ago ───────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ─── Category badge ─────────────────────────────── */
const CATEGORY_STYLES: Record<WelfareCategory, string> = {
  ACADEMIC:   'bg-blue-500/20 text-blue-400',
  FINANCIAL:  'bg-amber-500/20 text-amber-400',
  HARASSMENT: 'bg-rose-500/20 text-rose-400',
  GENERAL:    'bg-white/[0.07] text-white/50',
  SUGGESTION: 'bg-purple-500/20 text-purple-400',
}
const CATEGORY_LABELS: Record<WelfareCategory, string> = {
  ACADEMIC:   'Academic',
  FINANCIAL:  'Financial',
  HARASSMENT: 'Harassment',
  GENERAL:    'General',
  SUGGESTION: 'Suggestion',
}

function CategoryBadge({ category }: { category: WelfareCategory }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_STYLES[category]}`}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}

/* ─── Priority badge ─────────────────────────────── */
const PRIORITY_STYLES: Record<WelfarePriority, string> = {
  URGENT: 'bg-rose-500/20 text-rose-400',
  HIGH:   'bg-orange-500/20 text-orange-400',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  LOW:    'bg-emerald-500/20 text-emerald-400',
}

function PriorityBadge({ priority }: { priority: WelfarePriority }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  )
}

/* ─── Status badge ───────────────────────────────── */
function StatusBadge({ status }: { status: WelfareStatus }) {
  if (status === 'OPEN') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Open
    </span>
  )
  if (status === 'IN_PROGRESS') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
      In Progress
    </span>
  )
  if (status === 'RESOLVED') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500">
      Resolved
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] text-white/40">
      Dismissed
    </span>
  )
}

/* ─── Ticket expanded content ────────────────────── */
function TicketDetail({
  ticket, execUsers, onUpdate
}: {
  ticket: WelfareTicket
  execUsers: Array<{ _id: string; name: string; position: string }>
  onUpdate: (t: WelfareTicket) => void
}) {
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [responding, setResponding] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleRespond = async () => {
    if (!message.trim()) return
    setResponding(true)
    try {
      const updated = await welfareService.respondToTicket(ticket._id, message.trim(), isInternal)
      onUpdate(updated)
      setMessage('')
      setIsInternal(false)
    } catch { /* ignore */ }
    finally { setResponding(false) }
  }

  const handleUpdate = async (data: { status?: string; priority?: string; assignedTo?: string }) => {
    setUpdating(true)
    try {
      const updated = await welfareService.updateTicket(ticket._id, data)
      onUpdate(updated)
    } catch { /* ignore */ }
    finally { setUpdating(false) }
  }

  const selectCls = `w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]
    text-white text-xs outline-none focus:border-emerald-500/40 transition-all`

  return (
    <div className="border-t border-white/[0.06] px-4 pb-4 pt-4 space-y-5">

      {/* Full description */}
      <div>
        <p className="text-[10px] font-bold text-white/30 tracking-[0.15em] uppercase mb-2">Description</p>
        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-white/30 tracking-[0.12em] uppercase mb-1.5">Status</label>
          <select value={ticket.status} disabled={updating}
            onChange={e => handleUpdate({ status: e.target.value })}
            className={selectCls}>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-white/30 tracking-[0.12em] uppercase mb-1.5">Priority</label>
          <select value={ticket.priority} disabled={updating}
            onChange={e => handleUpdate({ priority: e.target.value })}
            className={selectCls}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-white/30 tracking-[0.12em] uppercase mb-1.5">Assigned To</label>
          <select
            value={ticket.assignedTo ? execUsers.find(u => u.name === ticket.assignedTo?.name)?._id ?? '' : ''}
            disabled={updating}
            onChange={e => handleUpdate({ assignedTo: e.target.value || undefined })}
            className={selectCls}>
            <option value="">Unassigned</option>
            {execUsers.map(u => (
              <option key={u._id} value={u._id}>{u.name} — {u.position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Responses */}
      {ticket.responses.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/30 tracking-[0.15em] uppercase">Responses</p>
          {ticket.responses.map((r, i) => (
            <div key={i} className={`rounded-xl px-4 py-3 space-y-1.5 ${
              r.isInternal
                ? 'bg-white/[0.03] border border-white/[0.05]'
                : 'bg-emerald-950/30 border border-emerald-500/15'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white/60">{r.responderName || r.responder?.name}</span>
                {r.isInternal && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.07] text-[10px] text-white/40 font-bold">
                    <Lock className="w-2.5 h-2.5" />Internal
                  </span>
                )}
                <span className="text-[10px] text-white/30 ml-auto">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-sm text-white/65 leading-relaxed">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Response form */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-white/30 tracking-[0.15em] uppercase">Add Response</p>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write a response or internal note…"
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
            text-white text-sm placeholder:text-white/20 outline-none resize-none
            focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setIsInternal(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${isInternal ? 'bg-white/30' : 'bg-white/[0.08]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isInternal ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-white/40">Internal note</span>
          </label>
          <button type="button" onClick={handleRespond} disabled={responding || !message.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
              text-white text-xs font-bold disabled:opacity-40 transition-all shadow-[0_4px_12px_rgba(13,124,61,0.3)]">
            {responding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {responding ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Ticket card ────────────────────────────────── */
function TicketCard({
  ticket, expanded, onToggle, execUsers, onUpdate
}: {
  ticket: WelfareTicket
  expanded: boolean
  onToggle: () => void
  execUsers: Array<{ _id: string; name: string; position: string }>
  onUpdate: (t: WelfareTicket) => void
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.09] transition-colors">
      {/* Collapsed header — clickable */}
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="p-4 flex items-start gap-4">
          {/* Badges column */}
          <div className="flex flex-col gap-1.5 shrink-0 min-w-[90px]">
            <span className="font-mono text-[10px] font-bold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              {ticket.ticketId}
            </span>
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white/90 truncate">{ticket.subject}</p>
            <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">{ticket.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-white/30">
              {ticket.isAnonymous ? (
                <span>Anonymous</span>
              ) : (
                <span>{ticket.submitterName ?? 'Unknown'}{ticket.submitterMatric ? ` · ${ticket.submitterMatric}` : ''}</span>
              )}
              <span>·</span>
              <span>{timeAgo(ticket.createdAt)}</span>
              {ticket.responses.length > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {ticket.responses.length}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={ticket.status} />
            {expanded
              ? <ChevronUp className="w-4 h-4 text-white/30" />
              : <ChevronDown className="w-4 h-4 text-white/30" />
            }
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <TicketDetail ticket={ticket} execUsers={execUsers} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function WelfarePage() {
  const [tickets, setTickets] = useState<WelfareTicket[]>([])
  const [stats, setStats] = useState<WelfareStats>({ total: 0, open: 0, inProgress: 0, resolved: 0, byCategory: {} })
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [execUsers, setExecUsers] = useState<Array<{ _id: string; name: string; position: string }>>([])

  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const countTotal = useCountUp(stats.total)
  const countOpen = useCountUp(stats.open)
  const countInProgress = useCountUp(stats.inProgress)
  const countResolved = useCountUp(stats.resolved)

  useEffect(() => {
    Promise.all([
      welfareService.getStats().catch(() => ({ total: 0, open: 0, inProgress: 0, resolved: 0, byCategory: {} })),
      (API.get('/users') as any).catch(() => []),
    ]).then(([s, users]) => {
      setStats(s)
      const list = Array.isArray(users) ? users : (users?.users ?? [])
      setExecUsers(list.map((u: any) => ({ _id: u._id, name: u.name, position: u.position })))
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (filterStatus) params.status = filterStatus
    if (filterCategory) params.category = filterCategory
    if (filterPriority) params.priority = filterPriority

    welfareService.getTickets(params)
      .then(data => setTickets(data.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [filterStatus, filterCategory, filterPriority])

  const updateTicket = (updated: WelfareTicket) => {
    setTickets(prev => prev.map(t => t._id === updated._id ? updated : t))
  }

  const statCards = [
    { label: 'Total Tickets', value: countTotal,      color: 'text-white/80',     bg: 'bg-white/[0.03] border-white/[0.07]' },
    { label: 'Open',          value: countOpen,        color: 'text-emerald-400',  bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'In Progress',   value: countInProgress,  color: 'text-blue-400',     bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Resolved',      value: countResolved,    color: 'text-emerald-500',  bg: 'bg-emerald-950/40 border-emerald-500/15' },
  ]

  const selectCls = `px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07]
    text-white/60 text-xs outline-none focus:border-emerald-500/30 transition-all`

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#06100a] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">IESA</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Welfare & Complaints
            </h1>
          </div>
          <a href="/welfare" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04]
              text-white/60 text-sm font-medium hover:bg-white/[0.07] hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
            Public Submission Page
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.bg} p-5`}>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls}>
            <option value="">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="FINANCIAL">Financial</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="GENERAL">General</option>
            <option value="SUGGESTION">Suggestion</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={selectCls}>
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <TicketCard
                key={t._id}
                ticket={t}
                expanded={expandedId === t._id}
                onToggle={() => setExpandedId(expandedId === t._id ? null : t._id)}
                execUsers={execUsers}
                onUpdate={updated => {
                  updateTicket(updated)
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
