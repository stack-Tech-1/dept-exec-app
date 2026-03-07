'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Vote, Plus, X, Share2, Trash2, ChevronDown,
  Users, Trophy, BarChart2, Check, AlertTriangle, Loader2
} from 'lucide-react'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'
import { electionsService, type Election, type Candidate } from '@/services/elections'
import { socket } from '@/lib/socket'

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

/* ─── Status badge ───────────────────────────────── */
function StatusBadge({ status }: { status: Election['status'] }) {
  if (status === 'OPEN') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      OPEN
    </span>
  )
  if (status === 'CLOSED') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400">
      CLOSED
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.07] text-white/50">
      PENDING
    </span>
  )
}

/* ─── Candidate avatar ───────────────────────────── */
function CandidateAvatar({ candidate }: { candidate: Candidate }) {
  if (candidate.photo) return (
    <img src={candidate.photo} alt={candidate.name}
      className="w-8 h-8 rounded-full object-cover shrink-0" />
  )
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{candidate.name[0]?.toUpperCase()}</span>
    </div>
  )
}

/* ─── Vote bar ───────────────────────────────────── */
function VoteBar({ candidate, totalVotes }: { candidate: Candidate; totalVotes: number }) {
  const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <CandidateAvatar candidate={candidate} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/80 font-medium truncate">{candidate.name}</span>
          <span className="text-xs text-white/40 ml-2 shrink-0">{candidate.voteCount} · {pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Create Election Modal ──────────────────────── */
function CreateElectionModal({
  onClose, onCreate
}: {
  onClose: () => void
  onCreate: (e: Election) => void
}) {
  const [form, setForm] = useState({ title: '', position: '', session: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.position.trim() || !form.session.trim()) {
      setError('Title, Position, and Session are required.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const created = await electionsService.createElection({
        title: form.title.trim(),
        position: form.position.trim(),
        session: form.session.trim(),
        description: form.description.trim() || undefined,
      })
      onCreate(created)
      onClose()
    } catch {
      setError('Failed to create election. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>New Election</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Title', key: 'title', placeholder: 'e.g. President 2025/2026', required: true },
              { label: 'Position', key: 'position', placeholder: 'e.g. President', required: true },
              { label: 'Session', key: 'session', placeholder: 'e.g. 2025/2026', required: true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  {f.label}{f.required && <span className="text-emerald-400 ml-0.5">*</span>}
                </label>
                <input
                  type="text"
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                    text-white text-sm placeholder:text-white/20 outline-none
                    focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional description…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-white/20 outline-none resize-none
                  focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                disabled:opacity-40 transition-all shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              {submitting ? 'Creating…' : 'Create Election'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Add Candidate Modal ────────────────────────── */
function AddCandidateModal({
  electionId, onClose, onAdded
}: {
  electionId: string
  onClose: () => void
  onAdded: (e: Election) => void
}) {
  const [name, setName] = useState('')
  const [matric, setMatric] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required.'); return }
    setSubmitting(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      if (matric.trim()) fd.append('matricNumber', matric.trim().toUpperCase())
      if (bio.trim()) fd.append('bio', bio.trim())
      if (photo) fd.append('photo', photo)
      const updated = await electionsService.addCandidate(electionId, fd)
      onAdded(updated)
      onClose()
    } catch {
      setError('Failed to add candidate. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Add Candidate</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Name<span className="text-emerald-400 ml-0.5">*</span>
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-white/20 outline-none
                  focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Matric Number</label>
              <input type="text" value={matric} onChange={e => setMatric(e.target.value)} placeholder="e.g. CSC/2021/001"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm font-mono placeholder:text-white/20 outline-none
                  focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))}
                placeholder="Short bio (max 300 chars)…" rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-white/20 outline-none resize-none
                  focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all" />
              <p className="text-[10px] text-white/25 text-right mt-1">{bio.length}/300</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Photo</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] ?? null)}
                className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] border-dashed
                  text-white/40 text-sm hover:border-emerald-500/30 hover:text-white/60 transition-all text-left">
                {photo ? photo.name : 'Click to upload photo (optional)'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                disabled:opacity-40 transition-all shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              {submitting ? 'Adding…' : 'Add Candidate'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Election Card ──────────────────────────────── */
function ElectionCard({
  election, isAdmin, onUpdate
}: {
  election: Election
  isAdmin: boolean
  onUpdate: (e: Election) => void
}) {
  const [addingCandidate, setAddingCandidate] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true)
    try {
      const updated = await electionsService.updateStatus(election._id, newStatus)
      onUpdate(updated)
    } catch { /* ignore */ }
    finally { setStatusLoading(false) }
  }

  const handleRemoveCandidate = async (candidateId: string) => {
    setRemovingId(candidateId)
    try {
      const updated = await electionsService.removeCandidate(election._id, candidateId)
      onUpdate(updated)
    } catch { /* ignore */ }
    finally { setRemovingId(null) }
  }

  const handleShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/vote/${election._id}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden
        hover:border-white/[0.10] transition-colors">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
                {election.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-white/40">{election.position}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] text-[11px] text-white/50">
                  {election.session}
                </span>
              </div>
            </div>
            <StatusBadge status={election.status} />
          </div>

          {/* Candidates */}
          {election.candidates.length > 0 ? (
            <div className="space-y-3">
              {election.status === 'PENDING' && isAdmin ? (
                election.candidates.map(c => (
                  <div key={c._id} className="flex items-center gap-3">
                    <CandidateAvatar candidate={c} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-medium truncate">{c.name}</p>
                      {c.matricNumber && <p className="text-[11px] text-white/35 font-mono">{c.matricNumber}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(c._id)}
                      disabled={removingId === c._id}
                      className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center
                        text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
                    >
                      {removingId === c._id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />
                      }
                    </button>
                  </div>
                ))
              ) : (
                election.candidates.map(c => (
                  <VoteBar key={c._id} candidate={c} totalVotes={election.totalVotes} />
                ))
              )}
            </div>
          ) : (
            <div className="py-4 text-center rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-sm text-white/25">No candidates yet</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-white/30 pt-1 border-t border-white/[0.05]">
            <span>{election.totalVotes} total votes</span>
            <span>by {election.createdBy?.name}</span>
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              {election.status === 'PENDING' && (
                <>
                  <button type="button" onClick={() => setAddingCandidate(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]
                      text-white/60 text-xs font-medium hover:bg-white/[0.08] hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add Candidate
                  </button>
                  <button type="button" onClick={() => handleStatusChange('OPEN')} disabled={statusLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30
                      text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-40">
                    {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Vote className="w-3.5 h-3.5" />}
                    Open Voting
                  </button>
                </>
              )}
              {election.status === 'OPEN' && (
                <button type="button" onClick={() => handleStatusChange('CLOSED')} disabled={statusLoading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30
                    text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-colors disabled:opacity-40">
                  {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Close Voting
                </button>
              )}
              <button type="button" onClick={handleShareLink}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors
                  ${copiedLink
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/[0.05] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white'
                  }`}>
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Share Voting Link'}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {addingCandidate && (
          <AddCandidateModal
            electionId={election._id}
            onClose={() => setAddingCandidate(false)}
            onAdded={updated => {
              onUpdate(updated)
              setAddingCandidate(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OPEN' | 'CLOSED'>('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const totalElections = elections.length
  const openElections = elections.filter(e => e.status === 'OPEN').length
  const totalVotes = elections.reduce((sum, e) => sum + e.totalVotes, 0)

  const countTotal = useCountUp(totalElections)
  const countOpen = useCountUp(openElections)
  const countVotes = useCountUp(totalVotes)

  const filtered = filter === 'ALL' ? elections : elections.filter(e => e.status === filter)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setIsAdmin(user?.role === ROLES.ADMIN)
  }, [])

  useEffect(() => {
    electionsService.getElections()
      .then(data => setElections(Array.isArray(data) ? data : []))
      .catch(() => setElections([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    socket.connect()

    const handleVoteCast = (payload: { electionId: string; candidates: Candidate[]; totalVotes: number }) => {
      setElections(prev => prev.map(e =>
        e._id === payload.electionId
          ? { ...e, candidates: payload.candidates, totalVotes: payload.totalVotes }
          : e
      ))
    }

    const handleStatusUpdate = (payload: { electionId: string; status: string }) => {
      setElections(prev => prev.map(e =>
        e._id === payload.electionId ? { ...e, status: payload.status as Election['status'] } : e
      ))
    }

    socket.on('vote-cast', handleVoteCast)
    socket.on('election-status-update', handleStatusUpdate)

    return () => {
      socket.off('vote-cast', handleVoteCast)
      socket.off('election-status-update', handleStatusUpdate)
      socket.disconnect()
    }
  }, [])

  const updateElection = (updated: Election) => {
    setElections(prev => prev.map(e => e._id === updated._id ? updated : e))
  }

  const stats = [
    { label: 'Total Elections', value: countTotal, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Currently Open', value: countOpen, icon: Vote, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Total Votes Cast', value: countVotes, icon: BarChart2, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ]

  const tabs: Array<typeof filter> = ['ALL', 'PENDING', 'OPEN', 'CLOSED']

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#06100a] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">IESA</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Elections
            </h1>
          </div>
          {isAdmin && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); setShowCreate(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                text-white text-sm font-bold shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              <Plus className="w-4 h-4" />
              New Election
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.bg} bg-white/[0.02] p-5 flex items-center gap-4`}>
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tabs.map(t => (
            <button key={t} type="button" onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === t
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Elections grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Vote className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">
              {filter === 'ALL' ? 'No elections yet' : `No ${filter.toLowerCase()} elections`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(e => (
              <ElectionCard
                key={e._id}
                election={e}
                isAdmin={isAdmin}
                onUpdate={updateElection}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateElectionModal
            onClose={() => setShowCreate(false)}
            onCreate={created => setElections(prev => [created, ...prev])}
          />
        )}
      </AnimatePresence>
    </>
  )
}
