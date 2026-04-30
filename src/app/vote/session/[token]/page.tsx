'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Vote, Loader2 } from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
type PageState = 'loading' | 'invalid' | 'voting' | 'success' | 'error'

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

/* ─── Candidate Avatar ───────────────────────────── */
function SessionCandidateAvatar({
  candidate,
  size = 'md',
}: {
  candidate: SessionElectionCandidate
  size?: 'sm' | 'md' | 'lg'
}) {
  const cls =
    size === 'lg' ? 'w-14 h-14 text-lg' :
    size === 'md' ? 'w-10 h-10 text-sm' :
                   'w-8 h-8 text-xs'
  if (candidate.photo) return (
    <img src={candidate.photo} alt={candidate.name}
      className={`${cls} rounded-full object-cover shrink-0`} />
  )
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shrink-0`}>
      <span className="text-white font-bold">{candidate.name[0]?.toUpperCase()}</span>
    </div>
  )
}

/* ─── Candidate Card ─────────────────────────────── */
function CandidateCard({
  candidate,
  selected,
  onClick,
}: {
  candidate: SessionElectionCandidate
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl border p-4 cursor-pointer transition-all ${
        selected
          ? 'border-emerald-500/60 bg-emerald-950/40 shadow-[0_0_0_2px_rgba(13,124,61,0.25)]'
          : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start gap-3">
        <SessionCandidateAvatar candidate={candidate} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-white">{candidate.name}</p>
          {candidate.matricNumber && (
            <p className="text-[11px] text-white/35 font-mono">{candidate.matricNumber}</p>
          )}
          {candidate.bio && (
            <p className="text-xs text-white/45 mt-1 leading-relaxed line-clamp-2">{candidate.bio}</p>
          )}
        </div>
        <div className={`w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          selected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(13,124,61,0.5)]' : 'border border-white/[0.15]'
        }`}>
          {selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Election Section ───────────────────────────── */
function ElectionSection({
  election,
  selectedId,
  onSelect,
}: {
  election: SessionElection
  selectedId: string | undefined
  onSelect: (candidateId: string) => void
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="p-5 space-y-3">
        <div>
          <p className="text-[11px] font-bold text-emerald-400/65 tracking-[0.15em] uppercase mb-1">Position</p>
          <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {election.title}
          </h3>
          <p className="text-xs text-white/40 mt-0.5">{election.position} · {election.session}</p>
        </div>
        {election.candidates.length === 0 ? (
          <div className="py-4 text-center rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-sm text-white/25">No candidates for this election</p>
          </div>
        ) : (
          <div className="space-y-2">
            {election.candidates.map(c => (
              <CandidateCard
                key={c._id}
                candidate={c}
                selected={selectedId === c._id}
                onClick={() => onSelect(c._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function VotingSessionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)

  const [pageState, setPageState]     = useState<PageState>('loading')
  const [sessionData, setSessionData] = useState<VotingSessionData | null>(null)
  const [votes, setVotes]             = useState<Record<string, string>>({})
  const [matric, setMatric]           = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [inlineError, setInlineError] = useState('')
  const [retryKey, setRetryKey]       = useState(0)

  /* ── Fetch session ── */
  useEffect(() => {
    const load = async () => {
      setPageState('loading')
      try {
        const res = await fetch(`${API}/voting-sessions/${token}`)
        if (!res.ok) { setPageState(res.status === 404 ? 'invalid' : 'error'); return }
        const data: VotingSessionData = await res.json()
        if (!data.isActive) { setPageState('invalid'); return }
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) { setPageState('invalid'); return }
        setSessionData(data)
        setPageState('voting')
      } catch {
        setPageState('error')
      }
    }
    load()
  }, [token, retryKey])

  /* ── Derived ── */
  const voteCount      = Object.keys(votes).length
  const totalElections = sessionData?.elections.length ?? 0
  const allVoted       = voteCount === totalElections && totalElections > 0

  /* ── Handlers ── */
  const handleSelectCandidate = (electionId: string, candidateId: string) => {
    setVotes(prev => {
      if (prev[electionId] === candidateId) {
        const next = { ...prev }
        delete next[electionId]
        return next
      }
      return { ...prev, [electionId]: candidateId }
    })
  }

  const handleSubmit = async () => {
    const trimmed = matric.trim().toUpperCase()
    if (!trimmed) { setInlineError('Please enter your matric number.'); return }
    if (voteCount === 0) { setInlineError('Please vote in at least one election.'); return }
    setSubmitting(true); setInlineError('')
    try {
      const res = await fetch(`${API}/voting-sessions/${token}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: trimmed,
          votes: Object.entries(votes).map(([electionId, candidateId]) => ({ electionId, candidateId })),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setInlineError(d.message || 'Something went wrong. Please try again.')
        return
      }
      setPageState('success')
    } catch {
      setInlineError('Network error. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
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
                    onClick={() => { setRetryKey(k => k + 1) }}
                    className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline"
                  >
                    Retry
                  </button>
                </div>
                <p className="text-[11px] text-white/20">IESA — Department of Computer Science</p>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {pageState === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="p-8 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto
                      shadow-[0_12px_32px_rgba(13,124,61,0.5)]">
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-bold">
                        {voteCount} election{voteCount !== 1 ? 's' : ''} voted
                      </span>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                      <p className="text-xs text-emerald-400/55">You may now close this page.</p>
                    </div>
                  </motion.div>
                  <p className="text-[11px] text-white/20">IESA — Department of Computer Science</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Voting ── */}
          {pageState === 'voting' && sessionData && (
            <motion.div key="voting"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-2xl space-y-6 pb-10">

              {/* Page header */}
              <div className="flex flex-col items-center gap-3 text-center pt-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center
                  shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
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

              {/* Election sections */}
              <div className="space-y-4">
                {sessionData.elections.map(e => (
                  <ElectionSection
                    key={e._id}
                    election={e}
                    selectedId={votes[e._id]}
                    onSelect={candId => handleSelectCandidate(e._id, candId)}
                  />
                ))}
              </div>

              {/* Submit card */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="p-5 space-y-4">
                  {/* Matric number */}
                  <div>
                    <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                      Your Matric Number
                    </label>
                    <input
                      type="text"
                      value={matric}
                      onChange={e => { setMatric(e.target.value); setInlineError('') }}
                      placeholder="e.g. CSC/2021/001"
                      autoComplete="off"
                      autoCapitalize="characters"
                      className="w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-white/[0.10]
                        text-white text-lg font-mono text-center placeholder:text-white/20
                        outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                    />
                  </div>

                  {/* Progress counter */}
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span>{voteCount} of {totalElections} election{totalElections !== 1 ? 's' : ''} voted</span>
                    {allVoted && (
                      <span className="text-emerald-400/70 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        All elections voted
                      </span>
                    )}
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="button"
                    disabled={submitting || voteCount === 0 || !matric.trim()}
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base
                      disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]"
                  >
                    {submitting
                      ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</span>
                      : 'Submit Votes'
                    }
                  </motion.button>

                  {/* Error banner */}
                  <AnimatePresence>
                    {inlineError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <p className="text-rose-300 text-sm font-medium">{inlineError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-[11px] text-white/20">IESA — Department of Computer Science</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
