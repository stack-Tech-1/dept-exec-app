'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  ClipboardList, Users, Zap, Plus, Copy, CheckCheck,
  ChevronDown, ChevronUp, X, AlertCircle, Download, Lock
} from 'lucide-react'
import { io } from 'socket.io-client'
import { authService } from '@/services/auth'
import { attendanceService, type AttendanceSession } from '@/services/attendance'

// QR code must be client-only (no SSR)
const QRCodeSVG = dynamic(
  () => import('qrcode.react').then(m => m.QRCodeSVG),
  { ssr: false, loading: () => <div className="w-40 h-40 rounded-xl bg-white/[0.04] animate-pulse" /> }
)

/* ─── Helpers ──────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/* ─── Count-up ─────────────────────────────────────── */
function CountUp({ value, color }: { value: number; color: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0; const steps = 24; const inc = value / steps
    const t = setInterval(() => {
      i += inc
      if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i))
    }, 42)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{count}</span>
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white text-sm placeholder:text-white/25 outline-none focus:border-emerald-500/40
  focus:bg-white/[0.07] transition-all`
const labelCls = `block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5`

/* ═══════════════ CreateSessionModal ══════════════════ */
function CreateSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: AttendanceSession) => void }) {
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true); setErr('')
    try {
      const session = await attendanceService.createSession({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      })
      onCreated(session)
    } catch (e: any) {
      setErr(e.message || 'Failed to create session')
    } finally {
      setSaving(false)
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
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">New Session</p>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create Attendance Session</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{err}</p>
            </div>
          )}
          <div>
            <label className={labelCls}>Session Title *</label>
            <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 5 Department Meeting" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional context…" />
          </div>
          <p className="text-xs text-white/25">A unique 6-character code and QR code will be generated automatically.</p>
        </form>

        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold disabled:opacity-50 hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)] transition-all">
            {saving ? 'Creating…' : 'Create Session'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════ Session Card ════════════════════ */
type LiveAttendee = AttendanceSession['attendees'][0] & { _isNew?: boolean }

function SessionCard({
  session: initialSession, isAdmin, onStatusChange
}: {
  session: AttendanceSession
  isAdmin: boolean
  onStatusChange: (id: string, updated: AttendanceSession) => void
}) {
  const [session, setSession] = useState<AttendanceSession & { attendees: LiveAttendee[] }>(initialSession as any)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [closing, setClosing] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // Sync when parent updates (e.g. socket closes session)
  useEffect(() => {
    setSession(s => ({
      ...initialSession as any,
      // preserve live attendees that may not yet be in parent
      attendees: s.attendees.length >= initialSession.attendees.length
        ? s.attendees
        : initialSession.attendees,
    }))
  }, [initialSession])

  const attendUrl = origin ? `${origin}/attend/${session.sessionCode}` : ''

  const handleCopy = async () => {
    if (!attendUrl) return
    await navigator.clipboard.writeText(attendUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = async () => {
    setClosing(true)
    try {
      const updated = await attendanceService.closeSession(session._id)
      onStatusChange(session._id, updated)
      setSession(updated as any)
      setConfirmClose(false)
    } catch (e: any) {
      alert(e.message || 'Failed to close session')
    } finally {
      setClosing(false)
    }
  }

  const handleExport = () => attendanceService.exportSession(session._id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

      {/* Top status stripe */}
      <div className={`h-0.5 w-full ${session.status === 'OPEN' ? 'bg-emerald-400' : 'bg-white/[0.07]'}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-black text-white/90 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              {session.title}
            </h3>
            {session.description && (
              <p className="text-xs text-white/35 mt-0.5 truncate">{session.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs bg-white/[0.07] border border-white/[0.08] text-white/55 px-2 py-0.5 rounded-lg">
              {session.sessionCode}
            </span>
            {session.status === 'OPEN' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Open
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.05] text-white/30 border border-white/[0.07]">
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="text-white/45 font-medium">{session.createdBy?.name}</span>
          {session.createdBy?.position && <><span>·</span><span>{session.createdBy.position}</span></>}
          <span>·</span>
          <span>{timeAgo(session.createdAt)}</span>
          <span>·</span>
          <span className="text-emerald-400/70 font-semibold">{session.attendees.length} present</span>
        </div>

        {/* QR Code */}
        {session.status === 'OPEN' && origin && (
          <div className="flex flex-col items-center gap-3 py-4 px-4 rounded-xl bg-emerald-950/30 border border-emerald-500/10">
            <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.08]">
              <QRCodeSVG
                value={attendUrl}
                size={160}
                bgColor="transparent"
                fgColor="#e5e7eb"
                level="M"
              />
            </div>
            <p className="text-[11px] text-white/25 text-center font-mono break-all">{attendUrl}</p>
            <button onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/45 text-xs font-semibold hover:bg-white/[0.08] hover:text-white/65 transition-all">
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        {/* Attendees toggle */}
        <button onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/45 hover:text-white/65 hover:bg-white/[0.05] transition-all">
          <span className="font-semibold">
            {expanded ? 'Hide' : 'View'} Attendees ({session.attendees.length})
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Attendees list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="rounded-xl border border-white/[0.06] overflow-hidden max-h-64 overflow-y-auto">
                {session.attendees.length === 0 ? (
                  <div className="py-8 text-center text-xs text-white/22">No attendees yet</div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {['Name', 'Matric', 'Level', 'Time'].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-[10px] font-black text-white/18 tracking-[0.12em] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {session.attendees.map((a, i) => (
                        <motion.tr key={`${a.matricNumber}-${i}`}
                          initial={(a as LiveAttendee)._isNew ? { backgroundColor: 'rgba(52,211,153,0.12)' } : { backgroundColor: 'transparent' }}
                          animate={{ backgroundColor: 'transparent' }}
                          transition={{ duration: 1.5 }}
                          className="border-b border-white/[0.03] last:border-0">
                          <td className="py-2 px-3 text-xs text-white/65">{a.name}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-white/40">{a.matricNumber}</td>
                          <td className="py-2 px-3 text-[11px] text-white/35">{a.level}L</td>
                          <td className="py-2 px-3 text-[11px] text-white/25">{formatTime(a.markedAt)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
            {/* Export */}
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/35 text-xs font-semibold hover:text-white/60 hover:bg-white/[0.07] transition-all">
              <Download className="w-3 h-3" />Export
            </button>

            {/* Close session */}
            {session.status === 'OPEN' && (
              <div className="relative flex-1">
                {!confirmClose ? (
                  <button onClick={() => setConfirmClose(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-400/60 text-xs font-semibold hover:border-rose-500/40 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all">
                    <Lock className="w-3 h-3" />Close Session
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-[11px] text-rose-300/80 flex-1">Confirm close? Members can no longer sign in.</p>
                    <button onClick={handleClose} disabled={closing}
                      className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[11px] font-bold hover:bg-rose-500/30 transition-colors disabled:opacity-50">
                      {closing ? '…' : 'Close'}
                    </button>
                    <button onClick={() => setConfirmClose(false)} className="text-white/25 hover:text-white/55 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════ ROOT PAGE ═══════════════════════════ */
export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'active' | 'past'>('active')
  const [modal, setModal] = useState(false)

  const isAdmin = authService.isAdmin()

  useEffect(() => { fetchSessions() }, [])

  // Socket.io for live updates
  useEffect(() => {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '')
    const socket = io(baseUrl, { withCredentials: true, transports: ['websocket', 'polling'] })

    socket.on('attendance-update', ({ sessionCode, attendee }: { sessionCode: string; attendee: any }) => {
      setSessions(prev => prev.map(s =>
        s.sessionCode === sessionCode
          ? { ...s, attendees: [{ ...attendee, _isNew: true }, ...s.attendees] }
          : s
      ))
    })

    socket.on('attendance-closed', ({ sessionCode }: { sessionCode: string }) => {
      setSessions(prev => prev.map(s =>
        s.sessionCode === sessionCode ? { ...s, status: 'CLOSED' } : s
      ))
    })

    return () => { socket.disconnect() }
  }, [])

  const fetchSessions = async () => {
    setLoading(true); setError('')
    try {
      const res = await attendanceService.getSessions()
      setSessions(res.sessions ?? [])
    } catch (e: any) {
      setError(e.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (s: AttendanceSession) => {
    setSessions(prev => [s, ...prev])
    setModal(false)
  }

  const handleStatusChange = (id: string, updated: AttendanceSession) => {
    setSessions(prev => prev.map(s => s._id === id ? updated : s))
  }

  const displayed = sessions.filter(s =>
    tab === 'active' ? s.status === 'OPEN' : s.status === 'CLOSED'
  )

  // Stats
  const totalSessions   = sessions.length
  const openSessions    = sessions.filter(s => s.status === 'OPEN').length
  const totalAttendees  = sessions.reduce((sum, s) => sum + (s.attendees?.length ?? 0), 0)

  const statCards = [
    { value: totalSessions,  label: 'Total Sessions',  color: '#e5e7eb', Icon: ClipboardList },
    { value: openSessions,   label: 'Open Sessions',   color: '#10b981', Icon: Zap },
    { value: totalAttendees, label: 'Total Attendees', color: '#60a5fa', Icon: Users },
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

      <AnimatePresence>
        {modal && <CreateSessionModal onClose={() => setModal(false)} onCreated={handleCreated} />}
      </AnimatePresence>

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Attendance
            </h1>
            <p className="text-sm text-white/30 mt-1">QR-based attendance tracking for sessions</p>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setModal(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start sm:self-auto
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Session</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <CountUp value={s.value} color={s.color} />
                </p>
                <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{s.label}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '14', border: `1px solid ${s.color}22` }}>
                <s.Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          {(['active', 'past'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'text-emerald-400' : 'text-white/35 hover:text-white/60'
              }`}>
              {t === 'active' ? 'Active' : 'Past'}
              {tab === t && (
                <motion.div layoutId="attTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm flex-1">{error}</p>
            <button onClick={fetchSessions} className="text-xs text-rose-400/70 hover:text-rose-400 underline shrink-0">Retry</button>
          </motion.div>
        )}

        {/* ── Cards ── */}
        {displayed.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl bg-[#06100a] border border-white/[0.06] py-20 text-center">
            <ClipboardList className="w-10 h-10 text-white/8 mx-auto mb-3" />
            <p className="text-white/22 text-sm">
              {tab === 'active' ? 'No active sessions.' : 'No past sessions yet.'}
            </p>
            {isAdmin && tab === 'active' && (
              <button onClick={() => setModal(true)} className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline">
                Create a new session
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {displayed.map(session => (
                <SessionCard
                  key={session._id}
                  session={session}
                  isAdmin={isAdmin}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  )
}
