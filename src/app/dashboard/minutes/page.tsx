// src/app/dashboard/minutes/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, FileText, Download, CheckCircle, Clock,
  Plus, Eye, Edit, Trash2, ChevronDown, X, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import CreateMinutesModal from '@/components/minutes/create-minutes-modal'
import { minutesService, type MinutesRecord } from '@/services/minutes'
import { authService } from '@/services/auth'

/* ─── Count-up chip ──────────────────────────────── */
function StatChip({ value, label, color, delay = 0 }: { value: number; label: string; color: string; delay?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let i = 0; const inc = value / 24
      const id = setInterval(() => { i += inc; if (i >= value) { setCount(value); clearInterval(id) } else setCount(Math.floor(i)) }, 42)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay / 1000 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex flex-col gap-1">
      <span className="text-2xl font-black leading-none" style={{ fontFamily: 'Syne, sans-serif', color }}>{count}</span>
      <span className="text-[11px] text-white/30 font-bold tracking-[0.14em] uppercase">{label}</span>
    </motion.div>
  )
}

const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function MinutesPage() {
  const [mounted, setMounted] = useState(false)
  const [minutes, setMinutes] = useState<MinutesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('All')
  const [selectedSemester, setSelectedSemester] = useState('All')
  const currentUser = authService.getCurrentUser()

  useEffect(() => { setMounted(true); fetchMinutes() }, [])

  const fetchMinutes = async () => {
    try { setMinutes(await minutesService.getAllMinutes()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCreateMinutes = async (data: any) => {
    try { await minutesService.createMinutes(data); fetchMinutes() }
    catch (e) { console.error(e) }
  }

  const handleApproveMinutes = async (id: string) => {
    if (!confirm('Approve these minutes? Approved minutes cannot be edited.')) return
    try { await minutesService.approveMinutes(id); fetchMinutes() }
    catch (e) { console.error(e) }
  }

  const handleDeleteMinutes = async (id: string) => {
    if (!confirm('Delete these minutes? This cannot be undone.')) return
    try { await minutesService.deleteMinutes(id); fetchMinutes() }
    catch (e) { console.error(e) }
  }

  const sessions  = Array.from(new Set(minutes.map(m => m.session))).filter(Boolean)
  const semesters = Array.from(new Set(minutes.map(m => m.semester))).filter(Boolean)

  const filteredMinutes = minutes.filter(r =>
    (selectedSession  === 'All' || r.session  === selectedSession) &&
    (selectedSemester === 'All' || r.semester === selectedSemester) &&
    (!searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || (r.createdBy?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
  )

  const statData = [
    { value: minutes.length, label: 'Total Minutes', color: '#e5e7eb', delay: 0 },
    { value: minutes.filter(m => m.approved).length, label: 'Approved', color: '#10b981', delay: 60 },
    { value: minutes.filter(m => !m.approved).length, label: 'Pending Review', color: '#f59e0b', delay: 120 },
    { value: minutes.filter(m => m.semester === 'First Semester 2024/2025').length, label: 'This Semester', color: '#60a5fa', delay: 180 },
  ]

  if (!mounted) return null

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <CreateMinutesModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateMinutes={handleCreateMinutes} />

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Records</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Meeting Minutes</h1>
            <p className="text-sm text-white/30 mt-1">Record, approve, and access all meeting minutes</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Add Minutes</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statData.map(s => <StatChip key={s.label} {...s} />)}
        </div>

        {/* ── Filters ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#06100a] border border-white/[0.06]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/45" />
            <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search minutes, titles…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white text-sm placeholder:text-white/18 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55"><X className="w-3.5 h-3.5" /></button>}
          </div>
          {[
            { val: selectedSession,  set: setSelectedSession,  opts: ['All', ...sessions],  labels: ['All Sessions', ...sessions] },
            { val: selectedSemester, set: setSelectedSemester, opts: ['All', ...semesters], labels: ['All Semesters', ...semesters] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.val} onChange={e => sel.set(e.target.value)} className={selCls}>
                {sel.opts.map((o, j) => <option key={o} value={o} className="bg-[#06100a] text-white">{sel.labels[j]}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          ))}
          <span className="text-xs text-white/22 ml-auto">{filteredMinutes.length} records</span>
        </motion.div>

        {/* ── Table / Empty ── */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div className="w-8 h-8 border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]" style={{ borderRadius: '50%' }}
              animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
          </div>
        ) : filteredMinutes.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 rounded-2xl bg-[#06100a] border border-white/[0.06]">
            <FileText className="w-10 h-10 text-white/8" />
            <p className="text-white/22 text-sm">No minutes found</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Meeting','Date & Time','Venue','Status','Actions'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMinutes.map((record, i) => (
                    <motion.tr key={record.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="group border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors duration-200">

                      <td className="py-4 pl-5 pr-4">
                        <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate max-w-[220px]">{record.title}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/28 mt-0.5">
                          <span>{record.session}</span><span className="text-white/15">·</span>
                          <span>{record.semester}</span>
                        </div>
                        <p className="text-[10px] text-white/20 mt-0.5">By {record.createdBy?.name || 'Unknown'}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-sm text-white/55">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                        <p className="text-[11px] text-white/28">{record.time}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-xs text-white/45 truncate max-w-[130px]">{record.venue}</p>
                      </td>

                      <td className="py-4 px-4">
                        {record.approved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-400/10 text-emerald-400 border-emerald-400/20">
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </span>
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-amber-400/10 text-amber-400 border-amber-400/20">
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-50" />
                              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-400" />
                            </span>
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-5 pl-4">
                        <div className="flex items-center gap-1">
                          {[
                            { show: true, Icon: Eye, color: 'hover:text-sky-400 hover:bg-sky-500/10', title: 'View', onClick: () => window.open(`/dashboard/minutes/${record.id}`, '_blank') },
                            { show: record.approved, Icon: Download, color: 'hover:text-emerald-400 hover:bg-emerald-500/10', title: 'Download', onClick: () => window.open(`/api/minutes/${record.id}/download`, '_blank') },
                            { show: currentUser?.role === 'ADMIN' && !record.approved, Icon: Edit, color: 'hover:text-sky-400 hover:bg-sky-500/10', title: 'Edit', onClick: () => window.location.href = `/dashboard/minutes/edit/${record.id}` },
                            { show: currentUser?.role === 'ADMIN' && !record.approved, Icon: CheckCircle, color: 'hover:text-emerald-400 hover:bg-emerald-500/10', title: 'Approve', onClick: () => handleApproveMinutes(record.id) },
                            { show: currentUser?.role === 'ADMIN' && !record.approved, Icon: Trash2, color: 'hover:text-rose-400 hover:bg-rose-500/10', title: 'Delete', onClick: () => handleDeleteMinutes(record.id) },
                          ].filter(a => a.show).map((action, ai) => (
                            <motion.button key={ai} whileTap={{ scale: 0.88 }} onClick={action.onClick} title={action.title}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-white/25 transition-colors ${action.color}`}>
                              <action.Icon className="w-3.5 h-3.5" />
                            </motion.button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}