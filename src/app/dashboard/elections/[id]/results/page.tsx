'use client'

import { useState, useEffect, useRef, use } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Trophy, Users, Calendar, Award } from 'lucide-react'
import Link from 'next/link'
import { electionsService, type Election, type Candidate } from '@/services/elections'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'

const AVATAR_COLORS = ['#10b981', '#3b82f6', '#a78bfa', '#f59e0b', '#f472b6', '#34d399', '#60a5fa', '#fb923c']
const getColor = (name: string) => AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function CandidateAvatar({ candidate, size = 'md' }: { candidate: Candidate; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const color = getColor(candidate.name)
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }[size]
  return candidate.photo ? (
    <img src={candidate.photo} alt={candidate.name}
      className={`${sz} rounded-full object-cover`}
      style={{ border: `2px solid ${color}50` }} />
  ) : (
    <div className={`${sz} rounded-full flex items-center justify-center font-black flex-shrink-0`}
      style={{ background: color + '22', border: `2px solid ${color}45`, color }}>
      {initials(candidate.name)}
    </div>
  )
}

export default function ElectionResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)
  const currentUser = authService.getCurrentUser()
  const isAdmin = currentUser?.role === ROLES.ADMIN

  useEffect(() => {
    electionsService.getElectionById(id)
      .then(setElection)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
    if (!captureRef.current || !election) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#030a05',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `${election.title.replace(/\s+/g, '-').toLowerCase()}-results.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
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

  if (!election) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#030a05' }}>
        <p className="text-white/40">Election not found.</p>
        <Link href="/dashboard/elections" className="text-emerald-400 text-sm hover:underline">← Back to Elections</Link>
      </div>
    )
  }

  const sorted = [...election.candidates].sort((a, b) => b.voteCount - a.voteCount)
  const winner = sorted[0]
  const totalWithUndecided = election.totalVotes + (election.undecidedCount ?? 0)
  const pct = (votes: number) =>
    totalWithUndecided > 0 ? Math.round((votes / totalWithUndecided) * 100) : 0
  const closedDate = election.closedAt
    ? new Date(election.closedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: '#030a05' }}>
      {/* Top bar (outside capture) */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
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

      {/* Capture zone */}
      <div ref={captureRef} className="max-w-2xl mx-auto rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #061510 0%, #030a05 60%, #040d07 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}>

        {/* Gradient header bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #0d7c3d, #34d399, #0d7c3d)' }} />

        {/* Election header */}
        <div className="px-8 pt-8 pb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(13,124,61,0.18) 0%, transparent 70%)' }} />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase mb-4"
              style={{ background: 'rgba(13,124,61,0.15)', border: '1px solid rgba(13,124,61,0.3)', color: '#34d399' }}>
              <Award className="w-3 h-3" />
              {election.position}
            </span>
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.15 }}>
              {election.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-[12px] text-white/35 mt-3">
              {closedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Closed {closedDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {election.totalVotes} vote{election.totalVotes !== 1 ? 's' : ''} cast
              </span>
            </div>
          </div>
        </div>

        {/* Winner spotlight */}
        {winner && winner.voteCount > 0 && (
          <div className="px-8 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(13,124,61,0.12) 100%)',
                border: '1px solid rgba(234,179,8,0.2)',
                boxShadow: '0 8px 32px rgba(234,179,8,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(234,179,8,0.07) 0%, transparent 70%)' }} />
              <div className="relative">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-black tracking-[0.2em] uppercase mb-4"
                  style={{ color: '#fbbf24' }}>
                  <Trophy className="w-3.5 h-3.5" />
                  Winner
                </div>
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <CandidateAvatar candidate={winner} size="xl" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-base"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 4px 12px rgba(251,191,36,0.5)' }}>
                      🏆
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {winner.name}
                </h2>
                {winner.matricNumber && (
                  <p className="text-xs text-white/30 mb-3">{winner.matricNumber}</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-3xl font-black" style={{ color: '#fbbf24' }}>{pct(winner.voteCount)}%</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{winner.voteCount} votes</p>
                  </div>
                </div>
                {/* Winner vote bar */}
                <div className="mt-4 h-2 rounded-full mx-auto max-w-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', boxShadow: '0 0 12px rgba(251,191,36,0.5)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct(winner.voteCount)}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }} />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* All candidates ranked */}
        <div className="px-8 pb-6 space-y-3">
          <p className="text-[11px] font-black tracking-[0.18em] uppercase text-white/25 mb-4">All Results</p>
          {sorted.map((candidate, idx) => {
            const p = pct(candidate.voteCount)
            const isWinner = idx === 0 && candidate.voteCount > 0
            const color = isWinner ? '#fbbf24' : getColor(candidate.name)
            return (
              <motion.div key={candidate._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + idx * 0.06 }}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
                style={{
                  background: isWinner ? 'rgba(234,179,8,0.06)' : 'rgba(255,255,255,0.03)',
                  border: isWinner ? '1px solid rgba(234,179,8,0.15)' : '1px solid rgba(255,255,255,0.05)',
                }}>
                {/* Rank */}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: color + '18', color }}>
                  {idx + 1}
                </div>
                {/* Avatar */}
                <CandidateAvatar candidate={candidate} size="md" />
                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-bold text-white truncate">{candidate.name}</p>
                    {isWinner && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}>
                        WINNER
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: color, boxShadow: `0 0 8px ${color}50` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + idx * 0.06, ease: 'easeOut' }} />
                  </div>
                </div>
                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black" style={{ color }}>{p}%</p>
                  <p className="text-[11px] text-white/30">{candidate.voteCount} votes</p>
                </div>
              </motion.div>
            )
          })}

          {/* Undecided row */}
          {(election.undecidedCount ?? 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + sorted.length * 0.06 }}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
                —
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.08)' }}>
                ?
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white/25 mb-1.5">Undecided</p>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct(election.undecidedCount ?? 0)}%`, background: 'rgba(255,255,255,0.12)' }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-black text-white/20">{pct(election.undecidedCount ?? 0)}%</p>
                <p className="text-[11px] text-white/20">{election.undecidedCount} voters</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/[0.05] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: '#34d399', opacity: 0.7 }}>IESA</p>
            <p className="text-[10px] text-white/25">Industrial and Production Engineering · University of Ibadan</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/20">Session</p>
            <p className="text-[11px] text-white/35 font-semibold">{election.session}</p>
          </div>
        </div>

        <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(13,124,61,0.25), transparent)' }} />
      </div>
    </div>
  )
}
