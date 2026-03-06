'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone, Send, ChevronDown, X, AlertCircle,
  Users, Mail, Bell, Copy, CheckCheck, Clock
} from 'lucide-react'
import { authService } from '@/services/auth'
import { announcementsService, type Announcement } from '@/services/announcements'

/* ─── Helpers ──────────────────────────────────────── */
const AUDIENCE_LABELS: Record<string, string> = {
  ALL:          'All Members & Exec',
  MEMBERS_ONLY: 'Members Only',
  EXEC_ONLY:    'Exec Only',
  LEVEL_100:    '100 Level',
  LEVEL_200:    '200 Level',
  LEVEL_300:    '300 Level',
  LEVEL_400:    '400 Level',
  LEVEL_500:    '500 Level',
}

const AUDIENCE_OPTIONS = [
  { value: 'ALL',          label: 'All Members & Exec' },
  { value: 'MEMBERS_ONLY', label: 'Members Only' },
  { value: 'EXEC_ONLY',    label: 'Exec Only' },
  { value: 'LEVEL_100',    label: '100 Level Only' },
  { value: 'LEVEL_200',    label: '200 Level Only' },
  { value: 'LEVEL_300',    label: '300 Level Only' },
  { value: 'LEVEL_400',    label: '400 Level Only' },
  { value: 'LEVEL_500',    label: '500 Level Only' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

/* ─── Count-up ─────────────────────────────────────── */
function CountUp({ value, color, suffix = '' }: { value: number; color: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0; const steps = 24; const inc = value / steps
    const t = setInterval(() => {
      i += inc
      if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i))
    }, 42)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{count}{suffix}</span>
}

/* ─── Status badge ─────────────────────────────────── */
function StatusBadge({ status }: { status: Announcement['status'] }) {
  const cfg = {
    SENDING: { cls: 'bg-amber-400/10 text-amber-400 border-amber-400/20', label: 'Sending…' },
    SENT:    { cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20', label: 'Sent' },
    FAILED:  { cls: 'bg-rose-400/10 text-rose-400 border-rose-400/20', label: 'Failed' },
  }[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

/* ─── Audience badge ───────────────────────────────── */
function AudienceBadge({ audience }: { audience: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-400/10 text-sky-400 border border-sky-400/20">
      {AUDIENCE_LABELS[audience] ?? audience}
    </span>
  )
}

/* ─── Toast ────────────────────────────────────────── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl
        bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-semibold
        shadow-[0_8px_32px_rgba(13,124,61,0.5)] border border-emerald-400/20 max-w-sm">
      <CheckCheck className="w-4 h-4 shrink-0" />
      {message}
      <button onClick={onDone} className="ml-1 text-white/50 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

/* ═══════════════════ ComposeModal ═══════════════════ */
const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white text-sm placeholder:text-white/25 outline-none focus:border-emerald-500/40
  focus:bg-white/[0.07] transition-all`
const labelCls = `block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5`

function ComposeModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    audience: 'ALL',
    priority: 'normal',
  })
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setConfirm(false) }

  const whatsappText = form.priority === 'urgent'
    ? `🚨 *URGENT: ${form.title}* — IESA\n\n${form.body}\n\n_Sent by IESA Executive_`
    : `📢 *${form.title}* — IESA\n\n${form.body}\n\n_Sent by IESA Executive_`

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(whatsappText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const handleSend = async () => {
    if (!form.title.trim()) { setErr('Title is required'); return }
    if (!form.body.trim())  { setErr('Body is required'); return }
    if (!confirm) { setConfirm(true); return }
    setSending(true); setErr('')
    try {
      await announcementsService.sendAnnouncement(form)
      onSent()
    } catch (e: any) {
      setErr(e.message || 'Failed to send announcement')
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a1c11 0%, #06100a 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '-24px 0 64px rgba(0,0,0,0.5)',
        }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">Compose</p>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>New Announcement</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{err}</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. General Meeting Notice" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Body *</label>
              <span className="text-[10px] text-white/25">{form.body.length} chars</span>
            </div>
            <textarea className={inputCls + ' resize-none'} rows={8}
              value={form.body} onChange={e => set('body', e.target.value)}
              placeholder="Write your announcement here…" />
          </div>

          <div>
            <label className={labelCls}>Audience</label>
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8 cursor-pointer'} value={form.audience} onChange={e => set('audience', e.target.value)}>
                {AUDIENCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#06100a]">{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Priority</label>
            <div className="flex gap-2">
              {(['normal', 'urgent'] as const).map(p => (
                <button key={p} type="button" onClick={() => set('priority', p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border capitalize transition-all ${
                    form.priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/50'
                  }`}>
                  {p === 'urgent' ? '🚨 Urgent' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.body) && (
            <div>
              <label className={labelCls}>Email Preview</label>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-[#0a5a2d] flex items-center justify-center">
                    <Megaphone className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] text-white/35 font-semibold">IESA Executive · {AUDIENCE_LABELS[form.audience]}</span>
                </div>
                {form.priority === 'urgent' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 mb-2">
                    🚨 URGENT
                  </span>
                )}
                <p className="text-sm font-bold text-white/90">{form.title || 'Announcement Title'}</p>
                <p className="text-xs text-white/45 whitespace-pre-wrap leading-relaxed">{form.body || 'Your announcement body will appear here.'}</p>
                <p className="text-[10px] text-white/20 pt-2 border-t border-white/[0.05]">Sent by IESA Executive</p>
              </div>
            </div>
          )}

          {/* WhatsApp copy */}
          <button onClick={handleCopyWhatsApp}
            className="w-full py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/50 text-sm font-semibold
              hover:bg-white/[0.06] hover:text-white/75 transition-all flex items-center justify-center gap-2">
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy for WhatsApp'}
          </button>

          {/* Confirm notice */}
          <AnimatePresence>
            {confirm && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-sm">
                This will email <strong>all {AUDIENCE_LABELS[form.audience]}</strong> recipients. Click Send again to confirm.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
              confirm
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_4px_16px_rgba(245,158,11,0.35)]'
                : 'bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)]'
            }`}>
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending…' : confirm ? 'Confirm Send' : 'Send'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════ ROOT PAGE ═══════════════════════════ */
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [compose, setCompose] = useState(false)
  const [toast, setToast] = useState('')

  const isAdmin = authService.isAdmin()

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    setLoading(true); setError('')
    try {
      const res = await announcementsService.getAnnouncements()
      setAnnouncements(res.announcements ?? [])
    } catch (e: any) {
      setError(e.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleSent = async () => {
    setCompose(false)
    await fetchAnnouncements()
    setToast('Announcement sent! Emailing recipients in background.')
  }

  // Stats
  const totalSent       = announcements.length
  const sentThisMonth   = announcements.filter(a => isThisMonth(a.createdAt)).length
  const totalRecipients = announcements.reduce((s, a) => s + (a.recipientCount ?? 0), 0)
  const totalEmails     = announcements.reduce((s, a) => s + (a.emailsSent ?? 0), 0)
  const avgDelivery     = totalRecipients > 0 ? Math.round((totalEmails / totalRecipients) * 100) : 0

  const statCards = [
    { value: totalSent,       label: 'Total Sent',        color: '#e5e7eb', Icon: Megaphone, suffix: '' },
    { value: sentThisMonth,   label: 'Sent This Month',   color: '#60a5fa', Icon: Clock,     suffix: '' },
    { value: totalRecipients, label: 'Recipients Reached',color: '#10b981', Icon: Users,     suffix: '' },
    { value: avgDelivery,     label: 'Avg Delivery',      color: '#f59e0b', Icon: Mail,      suffix: '%' },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
          animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Compose modal */}
      <AnimatePresence>
        {compose && <ComposeModal onClose={() => setCompose(false)} onSent={handleSent} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Communications</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Announcements
            </h1>
            <p className="text-sm text-white/30 mt-1">Broadcast messages to members and executives</p>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setCompose(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start sm:self-auto
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Send className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Announcement</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <CountUp value={s.value} color={s.color} suffix={s.suffix} />
                </p>
                <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{s.label}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '14', border: `1px solid ${s.color}22` }}>
                <s.Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm flex-1">{error}</p>
            <button onClick={fetchAnnouncements} className="text-xs text-rose-400/70 hover:text-rose-400 underline shrink-0">Retry</button>
          </motion.div>
        )}

        {/* ── Announcement list ── */}
        {announcements.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[#06100a] border border-white/[0.06] py-20 text-center">
            <Megaphone className="w-10 h-10 text-white/8 mx-auto mb-3" />
            <p className="text-white/22 text-sm">No announcements sent yet</p>
            {isAdmin && (
              <button onClick={() => setCompose(true)} className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline">
                Send your first announcement
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a, i) => (
              <motion.div key={a._id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.055 }}
                className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-5 space-y-3"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>

                {/* Top row: title + badges */}
                <div className="flex flex-wrap items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white/90">{a.title}</h3>
                      {a.priority === 'urgent' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                          🚨 Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/40 mt-1 leading-relaxed">
                      {a.body.length > 120 ? a.body.slice(0, 120) + '…' : a.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={a.status} />
                    <AudienceBadge audience={a.audience} />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.04]" />

                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-[9px] font-black text-emerald-400">
                        {(a.sentBy?.name ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white/45 font-medium">{a.sentBy?.name ?? '—'}</span>
                    {a.sentBy?.position && <><span>·</span><span>{a.sentBy.position}</span></>}
                    <span>·</span>
                    <span>{timeAgo(a.createdAt)}</span>
                  </div>

                  {/* Stats chips */}
                  <div className="flex items-center gap-3 text-[11px] text-white/30">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-white/20" />
                      <span><span className="text-white/55 font-semibold">{a.recipientCount ?? 0}</span> recipients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-white/20" />
                      <span><span className="text-white/55 font-semibold">{a.emailsSent ?? 0}</span> emails</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bell className="w-3 h-3 text-white/20" />
                      <span><span className="text-white/55 font-semibold">{a.notificationsSent ?? 0}</span> notifs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
