'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Vote, ArrowLeft, Loader2 } from 'lucide-react'
import { socket } from '@/lib/socket'

/* ─── Types ──────────────────────────────────────── */
type PageState = 'loading' | 'ready' | 'success' | 'closed' | 'pending' | 'not_found' | 'error'
type VoteStep  = 'enter' | 'select'

interface Candidate {
  _id: string
  name: string
  matricNumber?: string
  bio?: string
  photo?: string
  voteCount: number
}

interface ElectionInfo {
  _id: string
  title: string
  position: string
  session: string
  description?: string
  status: 'PENDING' | 'OPEN' | 'CLOSED'
  candidates: Candidate[]
  totalVotes: number
}

const API = 'https://api.ipeexecs.page/api'

/* ─── Candidate avatar ───────────────────────────── */
function CandidateAvatar({ candidate, size = 'md' }: { candidate: Candidate; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
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

/* ─── Vote bar row ───────────────────────────────── */
function VoteBarRow({ candidate, totalVotes }: { candidate: Candidate; totalVotes: number }) {
  const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <CandidateAvatar candidate={candidate} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/75 font-medium truncate">{candidate.name}</span>
          <span className="text-xs text-white/35 ml-2 shrink-0">{candidate.voteCount} · {pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
          <motion.div className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Component ──────────────────────────────────── */
export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [step, setStep] = useState<VoteStep>('enter')
  const [election, setElection] = useState<ElectionInfo | null>(null)
  const [matric, setMatric] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState('')

  /* ── Fetch election info ── */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/elections/${id}/public`)
        if (res.status === 404) { setPageState('not_found'); return }
        if (!res.ok) { setPageState('error'); return }
        const data: ElectionInfo = await res.json()
        setElection(data)
        if (data.status === 'CLOSED') { setPageState('closed'); return }
        if (data.status === 'PENDING') { setPageState('pending'); return }
        setPageState('ready')
      } catch {
        setPageState('error')
      }
    }
    load()
  }, [id])

  /* ── Real-time vote bar updates ── */
  useEffect(() => {
    if (!id) return
    socket.connect()
    const handleVoteCast = (payload: { electionId: string; candidates: Candidate[]; totalVotes: number }) => {
      if (payload.electionId !== id) return
      setElection(prev => prev
        ? { ...prev, candidates: payload.candidates, totalVotes: payload.totalVotes }
        : prev)
    }
    socket.on('vote-cast', handleVoteCast)
    return () => {
      socket.off('vote-cast', handleVoteCast)
      socket.disconnect()
    }
  }, [id])

  /* ── Step 1: Check if already voted ── */
  const handleCastMyVote = async () => {
    const trimmed = matric.trim().toUpperCase()
    if (!trimmed) { setInlineError('Please enter your matric number.'); return }
    setChecking(true); setInlineError('')
    try {
      const res = await fetch(`${API}/elections/${id}/check-voted?matricNumber=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (data.voted || data.alreadyVoted) {
        setInlineError('already_voted')
        return
      }
      setStep('select')
    } catch {
      setInlineError('Network error. Please check your connection.')
    } finally {
      setChecking(false)
    }
  }

  /* ── Step 2: Confirm vote ── */
  const handleConfirmVote = async () => {
    if (!selectedCandidate) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/elections/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNumber: matric.trim().toUpperCase(), candidateId: selectedCandidate }),
      })
      if (res.status === 400) {
        const data = await res.json()
        if (data.message?.toLowerCase().includes('closed')) { setPageState('closed'); return }
        if (data.alreadyVoted) { setStep('enter'); setInlineError('already_voted'); return }
        setInlineError(data.message || 'Something went wrong.')
        setStep('enter')
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setInlineError(data.message || 'Something went wrong. Please try again.')
        setStep('enter')
        return
      }
      setPageState('success')
    } catch {
      setInlineError('Network error. Please check your connection.')
      setStep('enter')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCandidateObj = election?.candidates.find(c => c._id === selectedCandidate)

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div className="min-h-screen bg-[#06100a] flex items-start justify-center p-4 pt-8"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(13,124,61,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}>

        <AnimatePresence mode="wait">

          {/* ── Loading ── */}
          {pageState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mt-20">
              <div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
              <p className="text-white/30 text-sm">Loading election…</p>
            </motion.div>
          )}

          {/* ── Not Found ── */}
          {pageState === 'not_found' && (
            <motion.div key="not_found" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Election Not Found</h2>
                  <p className="text-sm text-white/30 mt-2">This voting link is invalid or has expired.</p>
                </div>
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
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Something went wrong</h2>
                  <p className="text-sm text-white/30 mt-2">Please check your connection and try again.</p>
                  <button onClick={() => { setPageState('loading'); setInlineError(''); }}
                    className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline">
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Pending ── */}
          {pageState === 'pending' && (
            <motion.div key="pending" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto">
                  <Vote className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Not Started Yet</h2>
                  {election?.title && <p className="text-sm text-white/40 mt-1">{election.title}</p>}
                  <p className="text-sm text-white/30 mt-3">Voting has not started yet. Please check back later.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Closed ── */}
          {pageState === 'closed' && (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
                <div className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold">
                      VOTING CLOSED
                    </span>
                    <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {election?.title ?? 'Final Results'}
                    </h2>
                    {election?.position && <p className="text-sm text-white/40">{election.position} · {election?.session}</p>}
                  </div>

                  {election && election.candidates.length > 0 && (
                    <div className="space-y-1">
                      {[...election.candidates]
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((c, i) => (
                          <div key={c._id} className={`relative rounded-xl p-3 ${i === 0 ? 'bg-emerald-950/40 border border-emerald-500/20' : 'bg-white/[0.02]'}`}>
                            {i === 0 && (
                              <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-400">WINNER</span>
                            )}
                            <VoteBarRow candidate={c} totalVotes={election.totalVotes} />
                          </div>
                        ))}
                    </div>
                  )}

                  <p className="text-center text-xs text-white/25">{election?.totalVotes ?? 0} total votes cast</p>
                </div>
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
                      Your vote has been recorded! ✅
                    </h2>
                    {selectedCandidateObj && (
                      <p className="text-sm text-emerald-400/80 font-bold mt-2">
                        You voted for {selectedCandidateObj.name}
                      </p>
                    )}
                    {election?.title && (
                      <p className="text-sm text-white/35 mt-1">
                        {election.title} · {election.position}
                      </p>
                    )}
                  </motion.div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                    <p className="text-xs text-emerald-400/55">You may now close this page.</p>
                  </motion.div>
                  <p className="text-[11px] text-white/18">IESA — Industrial and Production Engineering</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Ready ── */}
          {pageState === 'ready' && election && (
            <motion.div key="ready"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                <div className="p-6 space-y-5">
                  {/* Election header */}
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                      <Vote className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase">IESA Elections</p>
                      <h1 className="text-xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                        {election.title}
                      </h1>
                      <p className="text-xs text-white/40 mt-0.5">{election.position} · {election.session}</p>
                    </div>
                  </div>

                  {/* Candidates */}
                  {step === 'enter' && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase">Candidates</p>
                      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.04]">
                        {election.candidates.map(c => (
                          <div key={c._id} className="p-3">
                            <VoteBarRow candidate={c} totalVotes={election.totalVotes} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step: Enter matric */}
                  {step === 'enter' && (
                    <div className="space-y-3">
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

                      <AnimatePresence>
                        {inlineError === 'already_voted' && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-amber-300 text-sm font-medium">You have already voted in this election!</p>
                          </motion.div>
                        )}
                        {inlineError && inlineError !== 'already_voted' && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <p className="text-rose-300 text-sm font-medium">{inlineError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="button"
                        disabled={checking || !matric.trim()}
                        onClick={handleCastMyVote}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base
                          disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                        {checking
                          ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Checking…</span>
                          : 'Cast My Vote'
                        }
                      </motion.button>
                    </div>
                  )}

                  {/* Step: Select candidate */}
                  {step === 'select' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="text-center space-y-1">
                        <p className="text-[11px] font-bold text-emerald-400/65 tracking-[0.15em] uppercase">Select a Candidate</p>
                        <p className="text-xs text-white/35">Tap a candidate to select them, then confirm your vote.</p>
                      </div>

                      <div className="space-y-2">
                        {election.candidates.map(c => (
                          <motion.div
                            key={c._id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCandidate(c._id)}
                            className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                              selectedCandidate === c._id
                                ? 'border-emerald-500/60 bg-emerald-950/40 shadow-[0_0_0_2px_rgba(13,124,61,0.25)]'
                                : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <CandidateAvatar candidate={c} size="lg" />
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-white">{c.name}</p>
                                {c.matricNumber && (
                                  <p className="text-[11px] text-white/35 font-mono">{c.matricNumber}</p>
                                )}
                                {c.bio && (
                                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{c.bio}</p>
                                )}
                              </div>
                              {selectedCandidate === c._id && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setStep('enter'); setSelectedCandidate(null); setInlineError('') }}
                          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-white/[0.08]
                            text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <motion.button
                          type="button"
                          disabled={!selectedCandidate || submitting}
                          onClick={handleConfirmVote}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-sm
                            disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                          {submitting
                            ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</span>
                            : 'Confirm Vote'
                          }
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-center text-[11px] text-white/18">IESA — Industrial and Production Engineering</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
