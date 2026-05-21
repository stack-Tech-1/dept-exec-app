'use client'

import { useState, useEffect, useRef, use } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Users, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { electionsService, type Election, type Candidate } from '@/services/elections'
import { votingSessionService, getSessionStatus, type VotingSession, type SessionVoter } from '@/services/votingSession'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#a78bfa', '#f59e0b', '#f472b6', '#34d399', '#60a5fa', '#fb923c']
const getColor = (name: string) => AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function CandidateAvatar({ candidate, size = 'md' }: { candidate: Candidate; size?: 'sm' | 'md' | 'lg' }) {
  const color = getColor(candidate.name)
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }[size]
  return candidate.photo ? (
    <img src={candidate.photo} alt={candidate.name}
      className={`${sz} rounded-full object-cover flex-shrink-0`}
      style={{ border: `2px solid ${color}50` }} />
  ) : (
    <div className={`${sz} rounded-full flex items-center justify-center font-black flex-shrink-0`}
      style={{ background: color + '22', border: `2px solid ${color}45`, color }}>
      {initials(candidate.name)}
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  if (status === 'OPEN') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
      🟢 OPEN
    </span>
  )
  if (status === 'CLOSED') return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
      ✅ CLOSED
    </span>
  )
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">
      PENDING
    </span>
  )
}

function ElectionResultSection({ election, index }: { election: Election; index: number }) {
  const sorted = [...election.candidates].sort((a, b) => b.voteCount - a.voteCount)
  const winner = sorted[0]
  const isClosed = election.status === 'CLOSED'
  const totalWithUndecided = election.totalVotes + (election.undecidedCount ?? 0)
  const pct = (votes: number) =>
    totalWithUndecided > 0 ? Math.round((votes / totalWithUndecided) * 100) : 0

  const winnerColor = isClosed ? '#fbbf24' : '#34d399'
  const winnerBg = isClosed
    ? 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(13,124,61,0.10))'
    : 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(13,124,61,0.10))'
  const winnerBorder = isClosed ? 'rgba(234,179,8,0.18)' : 'rgba(52,211,153,0.18)'

  return (
    <div>
      {/* Election header */}
      <div className="px-7 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase mb-1.5"
              style={{ background: 'rgba(13,124,61,0.12)', border: '1px solid rgba(13,124,61,0.25)', color: '#34d399' }}>
              🎖 {election.position}
            </span>
            <h3 className="text-base font-black text-white leading-snug" style={{ fontFamily: 'Syne, sans-serif' }}>
              {election.title}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0 pt-0.5">
            <StatusChip status={election.status} />
            <span className="text-[11px] text-white/30">👥 {election.totalVotes} votes</span>
          </div>
        </div>
      </div>

      {/* No votes yet */}
      {election.totalVotes === 0 && (
        <div className="px-7 pb-5">
          <div className="py-4 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-white/25 text-sm">No votes recorded yet</p>
          </div>
        </div>
      )}

      {/* Winner card (horizontal) */}
      {winner && winner.voteCount > 0 && (
        <div className="px-7 pb-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: winnerBg, border: `1px solid ${winnerBorder}` }}>
            <div className="relative flex-shrink-0">
              <CandidateAvatar candidate={winner} size="lg" />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ background: `linear-gradient(135deg, ${winnerColor}, ${isClosed ? '#f59e0b' : '#10b981'})` }}>
                {isClosed ? '🏆' : '📊'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-[0.15em] uppercase mb-0.5" style={{ color: winnerColor }}>
                {isClosed ? 'Winner' : 'Leading'}
              </p>
              <p className="text-sm font-black text-white leading-tight">{winner.name}</p>
              {winner.matricNumber && (
                <p className="text-[10px] text-white/25 mt-0.5">{winner.matricNumber}</p>
              )}
              <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${winnerColor}, ${isClosed ? '#f59e0b' : '#10b981'})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct(winner.voteCount)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: 'easeOut' }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-black" style={{ color: winnerColor }}>{pct(winner.voteCount)}%</p>
              <p className="text-[10px] text-white/25">{winner.voteCount} votes</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* All candidates (top 4 max, condensed) */}
      {sorted.length > 0 && election.totalVotes > 0 && (
        <div className="px-7 pb-5 space-y-2">
          <p className="text-[10px] font-black tracking-[0.18em] uppercase text-white/20 mb-2">All Candidates</p>
          {sorted.slice(0, 4).map((candidate, idx) => {
            const p = pct(candidate.voteCount)
            const isTop = idx === 0 && candidate.voteCount > 0
            const color = isTop ? winnerColor : getColor(candidate.name)
            return (
              <motion.div key={candidate._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 + idx * 0.04 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{
                  background: isTop ? (isClosed ? 'rgba(234,179,8,0.05)' : 'rgba(52,211,153,0.05)') : 'rgba(255,255,255,0.02)',
                  border: isTop ? `1px solid ${winnerBorder}` : '1px solid rgba(255,255,255,0.04)',
                }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ background: color + '18', color }}>
                  {idx + 1}
                </div>
                <CandidateAvatar candidate={candidate} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white mb-1 leading-none">{candidate.name}</p>
                  <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                      transition={{ duration: 0.6, delay: 0.2 + index * 0.05 + idx * 0.04, ease: 'easeOut' }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black" style={{ color }}>{p}%</p>
                  <p className="text-[10px] text-white/25">{candidate.voteCount}v</p>
                </div>
              </motion.div>
            )
          })}

          {/* Undecided row */}
          {(election.undecidedCount ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 + sorted.length * 0.04 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}>
                —
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.06)' }}>
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/20 mb-1 leading-none">Undecided</p>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${pct(election.undecidedCount ?? 0)}%`, background: 'rgba(255,255,255,0.10)' }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black text-white/20">{pct(election.undecidedCount ?? 0)}%</p>
                <p className="text-[10px] text-white/20">{election.undecidedCount}v</p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SessionResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [session, setSession] = useState<VotingSession | null>(null)
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [partialError, setPartialError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [viewMode, setViewMode]           = useState<'results' | 'voters'>('results')
  const [voters, setVoters]               = useState<SessionVoter[]>([])
  const [votersLoading, setVotersLoading] = useState(false)
  const [revokingMatric, setRevokingMatric]         = useState<string | null>(null)
  const [confirmRevokeMatric, setConfirmRevokeMatric] = useState<string | null>(null)
  const captureRef = useRef<HTMLDivElement>(null)
  const currentUser = authService.getCurrentUser()
  const isAdmin = currentUser?.role === ROLES.ADMIN

  useEffect(() => {
    async function load() {
      try {
        const sessions = await votingSessionService.getSessions()
        const found = sessions.find(s => s.token === token)
        if (!found) { setError('Session not found.'); return }
        setSession(found)

        const ids = found.elections.map(e => e._id)
        if (ids.length === 0) { setElections([]); return }

        const results = await Promise.allSettled(
          ids.map(id => electionsService.getElectionById(id))
        )
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Election> => r.status === 'fulfilled')
          .map(r => r.value)
        const failedCount = results.filter(r => r.status === 'rejected').length

        setElections(loaded)
        if (failedCount > 0) setPartialError(`${failedCount} election(s) could not be loaded.`)
      } catch (err: any) {
        setError(err?.message || 'Failed to load session results.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const loadVoters = async () => {
    setVotersLoading(true)
    try {
      const data = await votingSessionService.getSessionVoters(token)
      setVoters(data)
    } catch { /* silent */ }
    finally { setVotersLoading(false) }
  }

  const handleRevoke = async (matric: string) => {
    setRevokingMatric(matric)
    try {
      await votingSessionService.revokeVote(token, matric)
      setVoters(prev => prev.filter(v => v.identifier !== matric))
      const ids = session!.elections.map(e => e._id)
      const refreshed = await Promise.allSettled(ids.map(id => electionsService.getElectionById(id)))
      setElections(
        refreshed
          .filter((r): r is PromiseFulfilledResult<Election> => r.status === 'fulfilled')
          .map(r => r.value)
      )
    } catch { /* silent */ }
    finally { setRevokingMatric(null); setConfirmRevokeMatric(null) }
  }

  const handleDownload = async () => {
    if (!captureRef.current || !session) return
    setDownloading(true)
    const el = captureRef.current

    const savedWidth    = el.style.width
    const savedMaxWidth = el.style.maxWidth
    const savedMargin   = el.style.margin

    el.style.width    = '760px'
    el.style.maxWidth = '760px'
    el.style.margin   = '0'

    window.getSelection()?.removeAllRanges()
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()

    const styleTag = document.createElement('style')
    styleTag.textContent = '* { outline: none !important; box-shadow: none !important; }'
    document.head.appendChild(styleTag)

    await new Promise(r => setTimeout(r, 80))

    try {
      const domtoimage = await import('dom-to-image-more')
      const dataUrl = await domtoimage.toPng(el, { quality: 1, scale: 2 })
      const link = document.createElement('a')
      link.download = `${session.label.replace(/\s+/g, '-').toLowerCase()}-session-results.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      styleTag.remove()
      el.style.width    = savedWidth
      el.style.maxWidth = savedMaxWidth
      el.style.margin   = savedMargin
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#030a05' }}>
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#030a05' }}>
        <p className="text-white/40">{error || 'Session not found.'}</p>
        <Link href="/dashboard/elections" className="text-emerald-400 text-sm hover:underline">← Back to Elections</Link>
      </div>
    )
  }

  const totalVotesCast = elections.reduce((sum, e) => sum + e.totalVotes, 0)
  const openCount = elections.filter(e => e.status === 'OPEN').length
  const sessionStatus = getSessionStatus(session)

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: '#030a05' }}>
      {/* Top bar (outside capture) */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6">
        <Link href="/dashboard/elections"
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Elections
        </Link>
        {isAdmin && (
          <motion.button onClick={handleDownload} disabled={downloading}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #0d7c3d, #0a5a2d)',
              boxShadow: '0 4px 16px rgba(13,124,61,0.35)',
              color: 'white'
            }}>
            <Download className="w-4 h-4" />
            {downloading ? 'Generating…' : 'Download Image'}
          </motion.button>
        )}
      </div>

      {partialError && (
        <div className="max-w-3xl mx-auto mb-4 px-4 py-2 rounded-xl text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20">
          ⚠ {partialError}
        </div>
      )}

      {/* View tabs */}
      <div className="max-w-3xl mx-auto flex items-center gap-1.5 mb-4">
        <button type="button" onClick={() => setViewMode('results')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'results'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
          }`}>
          Results
        </button>
        {isAdmin && (
          <button type="button"
            onClick={() => { setViewMode('voters'); if (voters.length === 0) loadVoters() }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'voters'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
            }`}>
            <Users className="w-3.5 h-3.5" />
            Voters{voters.length > 0 ? ` (${voters.length})` : ''}
          </button>
        )}
      </div>

      {/* Voters view */}
      {viewMode === 'voters' && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.06] overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          {votersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            </div>
          ) : voters.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/25 text-sm">No votes have been cast in this session yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                    {['#', 'Name', 'Matric No.', 'Voted At', 'Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {voters.map((v, idx) => (
                    <tr key={v.identifier} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white/25 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 text-white/80 font-medium whitespace-nowrap">
                        {v.name ?? <span className="text-white/25 italic">Unknown</span>}
                      </td>
                      <td className="py-3 px-4 text-white/55 font-mono text-xs whitespace-nowrap">{v.identifier}</td>
                      <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">
                        {v.votedAt ? new Date(v.votedAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {confirmRevokeMatric === v.identifier ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button type="button"
                              onClick={() => setConfirmRevokeMatric(null)}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-medium hover:text-white/70 transition-colors">
                              Cancel
                            </button>
                            <button type="button"
                              onClick={() => handleRevoke(v.identifier)}
                              disabled={revokingMatric === v.identifier}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition-colors disabled:opacity-40">
                              {revokingMatric === v.identifier
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Trash2 className="w-3 h-3" />}
                              Yes, Revoke
                            </button>
                          </div>
                        ) : (
                          <button type="button"
                            onClick={() => setConfirmRevokeMatric(v.identifier)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/25 text-xs font-medium hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-colors">
                            <AlertTriangle className="w-3 h-3" />
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Capture zone */}
      {viewMode === 'results' && <div ref={captureRef} className="max-w-3xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #061510 0%, #030a05 60%, #040d07 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}>

        {/* Gradient header bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #0d7c3d, #34d399, #0d7c3d)' }} />

        {/* Session header */}
        <div className="px-7 pt-8 pb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(13,124,61,0.18) 0%, transparent 70%)' }} />
          <div className="relative">
            <p className="text-[11px] font-black tracking-[0.2em] uppercase mb-3" style={{ color: '#34d399', opacity: 0.7 }}>
              Session Results
            </p>
            <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.15 }}>
              {session.label}
            </h1>
            <div className="flex items-center justify-center gap-5 text-[12px] text-white/35 flex-wrap">
              <span>🗳 {elections.length} election{elections.length !== 1 ? 's' : ''}</span>
              <span>👥 {totalVotesCast} votes cast</span>
              {openCount > 0 && (
                <span className="text-amber-400/80">⚠ {openCount} still open</span>
              )}
            </div>
          </div>
        </div>

        {/* Open elections warning banner */}
        {openCount > 0 && (
          <div className="mx-7 mb-2 px-4 py-2.5 rounded-xl text-xs text-amber-400/80 text-center"
            style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)' }}>
            Some elections are still open — results may change
          </div>
        )}

        {/* No elections */}
        {elections.length === 0 && (
          <div className="px-7 py-10 text-center">
            <p className="text-white/25 text-sm">No elections in this session yet.</p>
          </div>
        )}

        {/* Election sections */}
        {elections.map((election, idx) => (
          <div key={election._id}>
            <ElectionResultSection election={election} index={idx} />
            {idx < elections.length - 1 && (
              <div className="mx-7 border-t border-white/[0.05]" />
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="px-7 py-5 border-t border-white/[0.05] flex items-center justify-between mt-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: '#34d399', opacity: 0.7 }}>IESA</p>
            <p className="text-[10px] text-white/25">Industrial and Production Engineering · University of Ibadan</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/20">Session</p>
            <p className="text-[11px] text-white/35 font-semibold">{session.label}</p>
          </div>
        </div>

        <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(13,124,61,0.25), transparent)' }} />
      </div>}
    </div>
  )
}
