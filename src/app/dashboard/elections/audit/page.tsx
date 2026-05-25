'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, UserX, Vote } from 'lucide-react'
import Link from 'next/link'
import { electionsService, type DeletedVoterRecord, type OrphanVoteGroup, type VoteAudit } from '@/services/elections'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'

function fmt(date: string) {
  return new Date(date).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
}

function SectionEmpty({ label }: { label: string }) {
  return (
    <div className="py-10 text-center rounded-2xl border border-white/[0.04] bg-white/[0.01]">
      <p className="text-white/25 text-sm">{label}</p>
    </div>
  )
}

function DeletedVoterCard({ record }: { record: DeletedVoterRecord }) {
  const [open, setOpen] = useState(false)
  const { member, votes } = record
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-500/[0.05] transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-black text-white">{member.name}</p>
            <p className="text-[11px] text-amber-400/70 font-mono mt-0.5">{member.matricNumber} · Level {member.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400">
            {votes.length} vote{votes.length !== 1 ? 's' : ''}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-amber-500/10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {['Election', 'Position', 'Session', 'Voted For', 'When'].map(h => (
                      <th key={h} className="py-2.5 px-4 text-left text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {votes.map((v, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-white/80 font-medium text-xs">{v.electionTitle}</td>
                      <td className="py-3 px-4 text-white/45 text-xs">{v.electionPosition}</td>
                      <td className="py-3 px-4 text-white/45 text-xs font-mono">{v.electionSession}</td>
                      <td className="py-3 px-4 text-xs">
                        {v.candidateName ? (
                          <span className="text-emerald-400 font-semibold">{v.candidateName}</span>
                        ) : (
                          <span className="text-white/25 italic">Candidate removed</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">{fmt(v.votedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function OrphanCard({ group }: { group: OrphanVoteGroup }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] overflow-hidden">
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-rose-500/[0.04] transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
            <Vote className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-black text-white">{group.electionTitle}</p>
            <p className="text-[11px] text-rose-400/70 mt-0.5">{group.electionPosition} · {group.electionSession}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400">
            {group.voteCount} orphaned vote{group.voteCount !== 1 ? 's' : ''}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-rose-500/10">
            <div className="px-5 py-3">
              <p className="text-[11px] text-rose-400/60 mb-3">
                Candidate ID <span className="font-mono">{group.removedCandidateId}</span> was removed from this election.
                The following members' votes are now unattributed.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {['Name', 'Matric', 'Status', 'Voted At'].map(h => (
                      <th key={h} className="py-2.5 px-4 text-left text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {group.voters.map((v, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-white/80 font-medium text-xs">
                        {v.name ?? <span className="text-white/25 italic">Unknown</span>}
                      </td>
                      <td className="py-3 px-4 text-white/50 font-mono text-xs">{v.matricNumber}</td>
                      <td className="py-3 px-4 text-xs">
                        {v.isDeleted
                          ? <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold">Deleted</span>
                          : <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">Active</span>
                        }
                      </td>
                      <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">{fmt(v.votedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function VoteAuditPage() {
  const [audit, setAudit] = useState<VoteAudit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUser = authService.getCurrentUser()
  const isAdmin = currentUser?.role === ROLES.ADMIN

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return }
    electionsService.getVoteAudit()
      .then(setAudit)
      .catch((err: any) => setError(err?.message || 'Failed to load audit data'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#030a05' }}>
        <AlertTriangle className="w-8 h-8 text-amber-400" />
        <p className="text-white/40 text-sm">Admin access required</p>
        <Link href="/dashboard/elections" className="text-emerald-400 text-sm hover:underline">← Back to Elections</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ background: '#030a05' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/dashboard/elections"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Elections
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[11px] text-amber-400/60 font-bold tracking-[0.2em] uppercase">IESA · Elections</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Vote Audit
            </h1>
            <p className="text-sm text-white/35 mt-1">
              Votes cast by deleted members and votes for removed candidates.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="max-w-4xl mx-auto px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      ) : audit && (
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Section 1: Deleted members who voted */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-amber-400/80 tracking-[0.15em] uppercase"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Deleted Members Who Voted
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400">
                {audit.deletedVoterRecords.length}
              </span>
            </div>
            <p className="text-xs text-white/30">
              These members were removed from the members list after casting their votes. Their vote records are preserved.
            </p>
            {audit.deletedVoterRecords.length === 0 ? (
              <SectionEmpty label="No deleted members have cast votes" />
            ) : (
              <motion.div className="space-y-3"
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                {audit.deletedVoterRecords.map((record, i) => (
                  <motion.div key={record.member._id}
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <DeletedVoterCard record={record} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-white/[0.05]" />

          {/* Section 2: Orphaned votes */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-rose-400/80 tracking-[0.15em] uppercase"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Votes for Removed Candidates
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400">
                {audit.orphanVotes.length}
              </span>
            </div>
            <p className="text-xs text-white/30">
              These votes were cast for candidates that were later removed from their elections. The candidate name is no longer available.
            </p>
            {audit.orphanVotes.length === 0 ? (
              <SectionEmpty label="No votes for removed candidates found" />
            ) : (
              <motion.div className="space-y-3"
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                {audit.orphanVotes.map((group, i) => (
                  <motion.div key={`${group.electionId}-${group.removedCandidateId}`}
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
                    <OrphanCard group={group} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

        </div>
      )}
    </div>
  )
}
