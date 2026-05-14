'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Vote, Plus, X, Share2, Trash2, ChevronDown,
  Users, Trophy, BarChart2, Check, AlertTriangle, Loader2,
  Link2, CheckCircle
} from 'lucide-react'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'
import { electionsService, type Election, type Candidate } from '@/services/elections'
import { votingSessionService, type VotingSession } from '@/services/votingSession'
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

/* ─── Result row ─────────────────────────────────── */
function ResultRow({ candidate, totalVotes, rank, isClosed }: {
  candidate: Candidate; totalVotes: number; rank: number; isClosed: boolean
}) {
  const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0
  const isLeader = rank === 1 && candidate.voteCount > 0

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
      isLeader && isClosed
        ? 'bg-amber-500/5 border border-amber-500/15'
        : isLeader
        ? 'bg-emerald-500/5 border border-emerald-500/10'
        : 'bg-transparent'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
        isLeader ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.05] text-white/25'
      }`}>
        {rank}
      </div>

      <CandidateAvatar candidate={candidate} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-white/85 font-semibold truncate">{candidate.name}</span>
          {isClosed && isLeader && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-black tracking-wider shrink-0">
              WINNER
            </span>
          )}
          {!isClosed && isLeader && totalVotes > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold shrink-0">
              leading
            </span>
          )}
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.06]">
          <motion.div
            className={`h-full rounded-full ${isLeader ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-white/20'}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-base font-black ${isLeader ? 'text-emerald-400' : 'text-white/35'}`}>{pct}%</p>
        <p className="text-[10px] text-white/25">{candidate.voteCount} vote{candidate.voteCount !== 1 ? 's' : ''}</p>
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

/* ─── Create Voting Session Modal ───────────────── */
function CreateVotingSessionModal({
  openElections, onClose, onCreated
}: {
  openElections: Election[]
  onClose: () => void
  onCreated: (s: VotingSession) => void
}) {
  const [label, setLabel] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expiresAt, setExpiresAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState<VotingSession | null>(null)
  const [copied, setCopied] = useState(false)

  const toggle = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleSubmit = async () => {
    if (!label.trim()) { setError('Session label is required.'); return }
    if (selectedIds.size === 0) { setError('Select at least one election.'); return }
    setSubmitting(true); setError('')
    try {
      const session = await votingSessionService.createSession({
        label: label.trim(),
        elections: [...selectedIds],
        expiresAt: expiresAt || undefined,
      })
      setGenerated(session)
      onCreated(session)
    } catch (err: any) {
      setError(err?.message || 'Failed to create voting session.')
    } finally { setSubmitting(false) }
  }

  const link = generated ? `${window.location.origin}/vote/session/${generated.token}` : ''
  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

        {generated ? (
          /* ── Success state ── */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Voting Link Generated!
                </h2>
              </div>
              <button type="button" onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Your Voting Link
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-emerald-500/20
                text-emerald-300 text-sm font-mono break-all select-all">
                {link}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                  ${copied
                    ? 'bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white shadow-[0_4px_16px_rgba(13,124,61,0.4)]'
                  }`}>
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Create Voting Session
              </h2>
              <button type="button" onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Label */}
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  Session Label<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. 2025/2026 General Elections"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                    text-white text-sm placeholder:text-white/20 outline-none
                    focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              {/* Elections checkboxes */}
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                  Include Elections<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                {openElections.length === 0 ? (
                  <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-white/30 text-sm">No open elections available</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {openElections.map(e => (
                      <label key={e._id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                          bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(e._id)}
                          onChange={() => toggle(e._id)}
                          className="w-4 h-4 rounded accent-emerald-500 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white/80 font-medium truncate">{e.title}</p>
                          <p className="text-[11px] text-white/35 truncate">{e.position} · {e.session}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  Expires At <span className="text-white/25 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                    text-white text-sm outline-none focus:border-emerald-500/40 focus:bg-white/[0.08]
                    transition-all [color-scheme:dark]"
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
              <button type="button" onClick={handleSubmit} disabled={submitting || openElections.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                  disabled:opacity-40 transition-all shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Link2 className="w-4 h-4" /> Generate Link</>
                }
              </button>
            </div>
          </div>
        )}
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
  const [cardError, setCardError] = useState('')

  useEffect(() => {
    if (!cardError) return
    const t = setTimeout(() => setCardError(''), 5000)
    return () => clearTimeout(t)
  }, [cardError])

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true)
    try {
      const updated = await electionsService.updateStatus(election._id, newStatus)
      onUpdate(updated)
    } catch (err: any) { setCardError(err?.message || 'Failed to update election status') }
    finally { setStatusLoading(false) }
  }

  const handleRemoveCandidate = async (candidateId: string) => {
    setRemovingId(candidateId)
    try {
      const updated = await electionsService.removeCandidate(election._id, candidateId)
      onUpdate(updated)
    } catch (err: any) { setCardError(err?.message || 'Failed to remove candidate') }
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
          {cardError && (
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-400 text-xs flex-1">{cardError}</p>
              <button onClick={() => setCardError('')} className="text-rose-400/50 hover:text-rose-400 transition-colors shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
                [...election.candidates]
                  .sort((a, b) => b.voteCount - a.voteCount)
                  .map((c, i) => (
                    <ResultRow
                      key={c._id}
                      candidate={c}
                      totalVotes={election.totalVotes}
                      rank={i + 1}
                      isClosed={election.status === 'CLOSED'}
                    />
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
  const [fetchError, setFetchError] = useState('')
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [deactivatingToken, setDeactivatingToken] = useState<string | null>(null)
  const [sessionCopied, setSessionCopied] = useState<string | null>(null)

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
      .catch((err: any) => { setElections([]); setFetchError(err?.message || 'Failed to load elections') })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!fetchError) return
    const t = setTimeout(() => setFetchError(''), 5000)
    return () => clearTimeout(t)
  }, [fetchError])

  useEffect(() => {
    votingSessionService.getSessions()
      .then(data => setVotingSessions(Array.isArray(data) ? data : []))
      .catch(() => setVotingSessions([]))
      .finally(() => setSessionsLoading(false))
  }, [])

  const handleDeactivateSession = async (token: string) => {
    setDeactivatingToken(token)
    try {
      const updated = await votingSessionService.deactivateSession(token)
      setVotingSessions(prev => prev.map(s => s.token === token ? updated : s))
    } catch { /* silent */ }
    finally { setDeactivatingToken(null) }
  }

  const handleCopySessionLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/vote/session/${token}`)
    setSessionCopied(token)
    setTimeout(() => setSessionCopied(null), 2000)
  }

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
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setShowCreateSession(true) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30
                  bg-emerald-500/10 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
                <Link2 className="w-4 h-4" />
                Create Voting Session
              </button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={e => { e.stopPropagation(); setShowCreate(true) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                  text-white text-sm font-bold shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
                <Plus className="w-4 h-4" />
                New Election
              </motion.button>
            </div>
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

        {/* Fetch error */}
        {fetchError && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-rose-400 text-sm flex-1">{fetchError}</p>
            <button onClick={() => setFetchError('')} className="text-rose-400/50 hover:text-rose-400 transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

        {/* Voting Sessions */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-white/50 tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Syne, sans-serif' }}>Voting Sessions</h2>

          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
            </div>
          ) : votingSessions.length === 0 ? (
            <div className="py-6 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-white/25 text-sm">No voting sessions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {votingSessions.map(s => (
                <div key={s.token}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{s.label}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {s.elections.length} election{s.elections.length !== 1 ? 's' : ''}
                      {s.expiresAt && ` · expires ${new Date(s.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    s.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : s.status === 'DEACTIVATED'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-white/[0.07] text-white/40'
                  }`}>
                    {s.status === 'ACTIVE' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {s.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySessionLink(s.token)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                        bg-white/[0.05] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white">
                      {sessionCopied === s.token
                        ? <Check className="w-3.5 h-3.5" />
                        : <Share2 className="w-3.5 h-3.5" />}
                      {sessionCopied === s.token ? 'Copied!' : 'Copy Link'}
                    </button>
                    {s.status === 'ACTIVE' && isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeactivateSession(s.token)}
                        disabled={deactivatingToken === s.token}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                          bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40">
                        {deactivatingToken === s.token
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <X className="w-3.5 h-3.5" />}
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateElectionModal
            onClose={() => setShowCreate(false)}
            onCreate={created => setElections(prev => [created, ...prev])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateSession && (
          <CreateVotingSessionModal
            openElections={elections.filter(e => e.status === 'OPEN')}
            onClose={() => setShowCreateSession(false)}
            onCreated={session => {
              setVotingSessions(prev => [session, ...prev])
              setShowCreateSession(false)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
