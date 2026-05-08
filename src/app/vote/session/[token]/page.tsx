'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, XCircle, AlertTriangle, Vote,
  Loader2, ArrowLeft, ArrowRight, ChevronLeft,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
type PageState = 'loading' | 'invalid' | 'error' | 'positions' | 'candidates' | 'success'
type VoteValue = string | 'ABSTAIN'

interface SessionElectionCandidate {
  _id: string
  name: string
  photo?: string
  matricNumber?: string
  bio?: string
}

interface SessionElection {
  _id: string
  title: string
  position: string
  session: string
  candidates: SessionElectionCandidate[]
}

interface VotingSessionData {
  token: string
  label: string
  isActive: boolean
  elections: SessionElection[]
  expiresAt?: string
}

const API = 'https://api.ipeexecs.page/api'

/* ─── Positions Overview ─────────────────────────── */
function PositionsOverview({
  sessionData,
  votes,
  onSelectPosition,
  onSubmit,
}: {
  sessionData: VotingSessionData
  votes: Record<string, VoteValue>
  onSelectPosition: (idx: number) => void
  onSubmit: () => void
}) {
  const votedCount = sessionData.elections.filter(
    e => votes[e._id] && votes[e._id] !== 'ABSTAIN'
  ).length

  return (
    <div className="w-full max-w-lg space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center pt-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
          <Vote className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase">IESA Elections</p>
          <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
            {sessionData.label}
          </h1>
          {sessionData.expiresAt && (
            <p className="text-xs text-white/30 mt-1">
              Closes {new Date(sessionData.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          )}
        </div>
      </div>

      {/* Position list */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-white/30 tracking-[0.15em] uppercase px-1">
          Select a Position to Vote
        </p>
        {sessionData.elections.map((election, idx) => {
          const vote = votes[election._id]
          const isVoted = vote && vote !== 'ABSTAIN'
          const isAbstained = vote === 'ABSTAIN'

          return (
            <motion.button
              key={election._id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPosition(idx)}
              className="w-full text-left rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {election.position}
                  </p>
                  <p className="text-xs text-white/35 mt-0.5">
                    {election.candidates.length} candidate{election.candidates.length !== 1 ? 's' : ''} · {election.session}
                  </p>
                </div>
                <div className="shrink-0">
                  {isVoted ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-3 h-3" />
                      Voted
                    </span>
                  ) : isAbstained ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/40 text-xs font-bold">
                      Abstained
                    </span>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Submit */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="p-4 space-y-3">
          <p className="text-xs text-white/30 text-center">
            Voted in {votedCount} of {sessionData.elections.length} position{sessionData.elections.length !== 1 ? 's' : ''}
          </p>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base shadow-[0_8px_24px_rgba(13,124,61,0.4)]"
          >
            Submit Votes
          </motion.button>
          <p className="text-center text-[11px] text-white/20">IESA — Department of Computer Science</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Candidate Slide ────────────────────────────── */
function CandidateSlide({
  candidate,
  direction,
}: {
  candidate: SessionElectionCandidate
  direction: number
}) {
  return (
    <motion.div
      key={candidate._id}
      initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        {/* Photo — top half */}
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
          {candidate.photo ? (
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center">
                <span className="text-4xl font-black text-white">
                  {candidate.name[0]?.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bio — bottom half */}
        <div className="p-5 space-y-2">
          <div>
            <h3 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {candidate.name}
            </h3>
            {candidate.matricNumber && (
              <p className="text-xs text-white/35 font-mono mt-0.5">{candidate.matricNumber}</p>
            )}
          </div>
          {candidate.bio ? (
            <p className="text-sm text-white/55 leading-relaxed">{candidate.bio}</p>
          ) : (
            <p className="text-sm text-white/20 italic">No bio provided.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Candidate Slideshow ────────────────────────── */
function CandidateSlideshow({
  election,
  currentVote,
  onVote,
  onBack,
}: {
  election: SessionElection
  currentVote: VoteValue | undefined
  onVote: (value: VoteValue | undefined) => void
  onBack: () => void
}) {
  const [candIdx, setCandIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const candidates = election.candidates
  const candidate = candidates[candIdx]
  const total = candidates.length

  const goTo = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= total) return
    setDirection(nextIdx > candIdx ? 1 : -1)
    setCandIdx(nextIdx)
  }

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60) goTo(candIdx + 1)
    else if (info.offset.x > 60) goTo(candIdx - 1)
  }

  const handleSelect = () => {
    onVote(currentVote === candidate._id ? undefined : candidate._id)
  }

  const handleAbstain = () => {
    onVote(currentVote === 'ABSTAIN' ? undefined : 'ABSTAIN')
  }

  const isSelected = currentVote === candidate._id
  const isAbstained = currentVote === 'ABSTAIN'

  return (
    <div className="w-full max-w-lg space-y-4 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.15em] uppercase">Voting For</p>
          <h2 className="text-lg font-black text-white truncate" style={{ fontFamily: 'Syne, sans-serif' }}>
            {election.position}
          </h2>
        </div>
        <span className="text-xs text-white/30 shrink-0 font-mono">
          {candIdx + 1} / {total}
        </span>
      </div>

      {/* Slide area with desktop arrows */}
      <div className="relative flex items-center">
        {/* Prev arrow — desktop only */}
        <button
          onClick={() => goTo(candIdx - 1)}
          disabled={candIdx === 0}
          className="hidden md:flex absolute -left-14 w-10 h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 transition-all z-10"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>

        {/* Draggable wrapper */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="w-full cursor-grab active:cursor-grabbing select-none"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <CandidateSlide key={candidate._id} candidate={candidate} direction={direction} />
          </AnimatePresence>
        </motion.div>

        {/* Next arrow — desktop only */}
        <button
          onClick={() => goTo(candIdx + 1)}
          disabled={candIdx === total - 1}
          className="hidden md:flex absolute -right-14 w-10 h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 transition-all z-10"
        >
          <ArrowRight className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {candidates.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === candIdx
                  ? 'w-4 h-1.5 bg-emerald-500'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSelect}
          className={`w-full py-4 rounded-xl font-black text-base transition-all ${
            isSelected
              ? 'bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white shadow-[0_8px_24px_rgba(13,124,61,0.4)]'
              : 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
          }`}
        >
          {isSelected ? `✓ Selected — ${candidate.name}` : `Select ${candidate.name}`}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAbstain}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
            isAbstained
              ? 'bg-white/[0.08] border border-white/20 text-white/70'
              : 'border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15'
          }`}
        >
          {isAbstained ? "✓ Marked as Undecided" : "I'm undecided for this position"}
        </motion.button>
      </div>

      {/* Swipe hint — mobile only */}
      <p className="text-center text-[11px] text-white/20 md:hidden">
        Swipe left or right to view other candidates
      </p>
    </div>
  )
}

/* ─── Submit Modal ───────────────────────────────── */
function SubmitModal({
  sessionData,
  votes,
  token,
  onClose,
  onSuccess,
}: {
  sessionData: VotingSessionData
  votes: Record<string, VoteValue>
  token: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [matric, setMatric] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const trimmed = matric.trim().toUpperCase()
    if (!trimmed) { setError('Please enter your matric number.'); return }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API}/voting-sessions/${token}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmed,
          votes: Object.entries(votes)
            .filter(([, v]) => v && v !== 'ABSTAIN')
            .map(([electionId, candidateId]) => ({ electionId, candidateId })),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.message || 'Something went wrong. Please try again.')
        return
      }
      onSuccess()
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(6,16,10,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a1a0f] overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.7)' }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.15em] uppercase mb-1">
              Review &amp; Submit
            </p>
            <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your Votes
            </h2>
          </div>

          {/* Vote summary */}
          <div className="space-y-1">
            {sessionData.elections.map(e => {
              const vote = votes[e._id]
              const candidate = vote && vote !== 'ABSTAIN'
                ? e.candidates.find(c => c._id === vote)
                : null
              return (
                <div
                  key={e._id}
                  className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0 gap-4"
                >
                  <p className="text-sm text-white/50 min-w-0 truncate">{e.position}</p>
                  <p className={`text-sm font-bold shrink-0 ${
                    candidate ? 'text-emerald-400' :
                    vote === 'ABSTAIN' ? 'text-white/30' :
                    'text-white/20'
                  }`}>
                    {candidate ? candidate.name : vote === 'ABSTAIN' ? 'Abstained' : 'Not voted'}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Matric input */}
          <div>
            <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
              Your Matric Number
            </label>
            <input
              type="text"
              value={matric}
              onChange={e => { setMatric(e.target.value); setError('') }}
              placeholder="e.g. CSC/2021/001"
              autoComplete="off"
              autoCapitalize="characters"
              className="w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-white/[0.10]
                text-white text-lg font-mono text-center placeholder:text-white/20
                outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-rose-300 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/40 text-sm font-bold hover:border-white/15 transition-all"
            >
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting || !matric.trim()}
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]"
            >
              {submitting
                ? <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
                  </span>
                : 'Confirm & Submit'
              }
            </motion.button>
          </div>

          <p className="text-center text-[11px] text-white/20">IESA — Department of Computer Science</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function VotingSessionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)

  const [pageState, setPageState]           = useState<PageState>('loading')
  const [sessionData, setSessionData]       = useState<VotingSessionData | null>(null)
  const [votes, setVotes]                   = useState<Record<string, VoteValue>>({})
  const [activeElectionIdx, setActiveElectionIdx] = useState(0)
  const [showSubmitModal, setShowSubmitModal]     = useState(false)
  const [retryKey, setRetryKey]             = useState(0)

  /* ── Fetch session ── */
  useEffect(() => {
    const load = async () => {
      setPageState('loading')
      try {
        const res = await fetch(`${API}/voting-sessions/${token}`)
        if (!res.ok) { setPageState(res.status === 404 || res.status === 400 ? 'invalid' : 'error'); return }
        const data: VotingSessionData = await res.json()
        if (!data.isActive) { setPageState('invalid'); return }
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) { setPageState('invalid'); return }
        setSessionData(data)
        setPageState('positions')
      } catch {
        setPageState('error')
      }
    }
    load()
  }, [token, retryKey])

  const handleVote = (electionId: string, value: VoteValue | undefined) => {
    setVotes(prev => {
      if (value === undefined) {
        const next = { ...prev }
        delete next[electionId]
        return next
      }
      return { ...prev, [electionId]: value }
    })
  }

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div
        className="min-h-screen bg-[#06100a] flex items-start justify-center p-4 pt-8"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage:
            'radial-gradient(ellipse at 30% 20%, rgba(13,124,61,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}
      >
        <AnimatePresence mode="wait">

          {/* ── Loading ── */}
          {pageState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mt-20">
              <div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
              <p className="text-white/30 text-sm">Loading session…</p>
            </motion.div>
          )}

          {/* ── Invalid / Expired ── */}
          {pageState === 'invalid' && (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Link Expired or Inactive
                  </h2>
                  <p className="text-sm text-white/30 mt-2">
                    This voting link has expired or is no longer active.
                  </p>
                  <p className="text-xs text-white/20 mt-1">
                    Please contact the administrator for a new link.
                  </p>
                </div>
                <p className="text-[11px] text-white/20">IESA — Department of Computer Science</p>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {pageState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Something went wrong
                  </h2>
                  <p className="text-sm text-white/30 mt-2">Please check your connection and try again.</p>
                  <button
                    onClick={() => setRetryKey(k => k + 1)}
                    className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-[11px] text-white/20">IESA — Department of Computer Science</p>
              </div>
            </motion.div>
          )}

          {/* ── Positions Overview ── */}
          {pageState === 'positions' && sessionData && (
            <motion.div key="positions"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <PositionsOverview
                sessionData={sessionData}
                votes={votes}
                onSelectPosition={idx => {
                  setActiveElectionIdx(idx)
                  setPageState('candidates')
                }}
                onSubmit={() => setShowSubmitModal(true)}
              />
            </motion.div>
          )}

          {/* ── Candidate Slideshow ── */}
          {pageState === 'candidates' && sessionData && (
            <motion.div key="candidates"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <CandidateSlideshow
                election={sessionData.elections[activeElectionIdx]}
                currentVote={votes[sessionData.elections[activeElectionIdx]._id]}
                onVote={value => handleVote(sessionData.elections[activeElectionIdx]._id, value)}
                onBack={() => setPageState('positions')}
              />
            </motion.div>
          )}

          {/* ── Success ── */}
          {pageState === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="p-8 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto shadow-[0_12px_32px_rgba(13,124,61,0.5)]"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase mb-1">Vote Recorded!</p>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Your vote has been recorded. Thank you!
                    </h2>
                    {sessionData?.label && (
                      <p className="text-sm text-white/35 mt-2">{sessionData.label}</p>
                    )}
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                      <p className="text-xs text-emerald-400/55">You may now close this page.</p>
                    </div>
                  </motion.div>
                  <p className="text-[11px] text-white/20">IESA — Department of Computer Science</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Submit Modal (rendered outside scroll container) ── */}
      <AnimatePresence>
        {showSubmitModal && sessionData && (
          <SubmitModal
            sessionData={sessionData}
            votes={votes}
            token={token}
            onClose={() => setShowSubmitModal(false)}
            onSuccess={() => {
              setShowSubmitModal(false)
              setPageState('success')
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
