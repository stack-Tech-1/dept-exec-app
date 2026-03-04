// src/app/dashboard/meetings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Calendar, Video, MapPin, Users, Clock,
  Plus, CheckCircle, UserCheck, XCircle, ChevronDown, X
} from 'lucide-react'
import { format } from 'date-fns'
import CreateMeetingModal from '@/components/meetings/create-meeting-modal'
import { meetingsService, type Meeting } from '@/services/meetings'
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

const getMeetingType = (venue: string) => {
  if (venue.toLowerCase().includes('zoom')) return 'zoom'
  if (venue.toLowerCase().includes('+') || venue.toLowerCase().includes('hybrid')) return 'hybrid'
  return 'physical'
}

const TYPE_CFG = {
  zoom:     { Icon: Video,  bg: 'bg-blue-500/12',  border: 'border-blue-500/25',  text: 'text-blue-400',    glow: '#3b82f6' },
  hybrid:   { Icon: Users,  bg: 'bg-violet-500/12',border: 'border-violet-500/25',text: 'text-violet-400',  glow: '#8b5cf6' },
  physical: { Icon: MapPin, bg: 'bg-emerald-500/12',border: 'border-emerald-500/25',text: 'text-emerald-400',glow: '#10b981' },
}

const RSVP_CFG = {
  attending:     { label: 'Attending',   Icon: CheckCircle, on: 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)]', off: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/18' },
  maybe:         { label: 'Maybe',       Icon: UserCheck,   on: 'bg-amber-500 text-white shadow-[0_4px_16px_rgba(245,158,11,0.35)]',   off: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/18' },
  not_attending: { label: "Can't Attend", Icon: XCircle,    on: 'bg-rose-500 text-white shadow-[0_4px_16px_rgba(244,63,94,0.35)]',     off: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/18' },
}

const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'attending' | 'not_attending' | 'maybe'>>({})
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    fetchMeetings()
    const saved = localStorage.getItem('meeting_rsvp')
    if (saved) setRsvpStatus(JSON.parse(saved))
  }, [])

  const fetchMeetings = async () => {
    try { setMeetings(await meetingsService.getAllMeetings()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleCreateMeeting = async (data: any) => {
    try { await meetingsService.createMeeting(data); fetchMeetings() }
    catch (e) { console.error(e) }
  }

  const handleRsvp = async (id: string, status: 'attending' | 'not_attending' | 'maybe') => {
    try {
      await meetingsService.updateRsvp(id, status)
      setRsvpStatus(prev => {
        const updated = { ...prev, [id]: status }
        localStorage.setItem('meeting_rsvp', JSON.stringify(updated))
        return updated
      })
    } catch (e) { console.error(e) }
  }

  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

  const filteredMeetings = meetings.filter(m =>
    (selectedType === 'All' || getMeetingType(m.venue) === selectedType.toLowerCase()) &&
    (!searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const upcomingMeetings = filteredMeetings.filter(m => new Date(m.date) >= today)
  const pastMeetings     = filteredMeetings.filter(m => new Date(m.date) < today)

  const statData = [
    { value: upcomingMeetings.length, label: 'Upcoming', color: '#e5e7eb', delay: 0 },
    { value: upcomingMeetings.filter(m => format(new Date(m.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')).length, label: 'Today', color: '#60a5fa', delay: 60 },
    { value: Object.values(rsvpStatus).filter(s => s === 'attending').length, label: 'My RSVPs', color: '#10b981', delay: 120 },
    { value: meetings.filter(m => getMeetingType(m.venue) === 'zoom').length, label: 'Zoom', color: '#a78bfa', delay: 180 },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateMeeting={handleCreateMeeting} />

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Meetings</h1>
            <p className="text-sm text-white/30 mt-1">Schedule, track, and join department meetings</p>
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
              <span className="relative z-10">Schedule Meeting</span>
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
              placeholder="Search meetings, venues…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white text-sm placeholder:text-white/18 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="relative">
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={selCls}>
              {['All','Zoom','Physical','Hybrid'].map(o => <option key={o} value={o} className="bg-[#06100a] text-white">{o === 'All' ? 'All Types' : o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
          </div>
        </motion.div>

        {/* ── Upcoming Meetings ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white/70 tracking-[0.12em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
              Upcoming
            </h2>
            <span className="text-xs text-white/22">{upcomingMeetings.length} meetings</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <motion.div className="w-8 h-8 border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]" style={{ borderRadius: '50%' }}
                animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-3 rounded-2xl bg-[#06100a] border border-white/[0.06]">
              <Calendar className="w-10 h-10 text-white/8" />
              <p className="text-white/22 text-sm">No upcoming meetings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingMeetings.map((meeting, i) => {
                const type = getMeetingType(meeting.venue)
                const cfg = TYPE_CFG[type as keyof typeof TYPE_CFG]
                const isToday = format(new Date(meeting.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                const isTomorrow = format(new Date(meeting.date), 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')

                return (
                  <motion.div key={meeting.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.07 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="group rounded-2xl bg-[#06100a] border border-white/[0.06] p-5 relative overflow-hidden"
                    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>

                    {/* Type glow bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(to right, transparent, ${cfg.glow}80, transparent)` }} />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                            <cfg.Icon className={`w-4 h-4 ${cfg.text}`} />
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border
                            ${isToday ? 'bg-amber-400/12 text-amber-400 border-amber-400/25' :
                              isTomorrow ? 'bg-sky-400/12 text-sky-400 border-sky-400/25' :
                              'bg-white/[0.05] text-white/35 border-white/[0.07]'}`}>
                            {isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : format(new Date(meeting.date), 'MMM d')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white/85 group-hover:text-white transition-colors">{meeting.title}</h3>
                      </div>
                      <Clock className="w-4 h-4 text-white/20 shrink-0" />
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-white/38">
                        <MapPin className="w-3 h-3 text-emerald-400/35" />{meeting.venue}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/38">
                        <Calendar className="w-3 h-3 text-sky-400/35" />
                        {format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')} at {meeting.time}
                      </div>
                      {meeting.agenda && <p className="text-[11px] text-white/22 line-clamp-2 mt-1">{meeting.agenda}</p>}
                    </div>

                    {/* RSVP three-state */}
                    <div className="flex gap-2 mb-4">
                      {(Object.entries(RSVP_CFG) as [string, typeof RSVP_CFG['attending']][]).map(([key, rcfg]) => (
                        <motion.button key={key} whileTap={{ scale: 0.95 }}
                          onClick={() => handleRsvp(meeting.id, key as any)}
                          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200
                            ${rsvpStatus[meeting.id] === key ? rcfg.on : rcfg.off}`}>
                          <rcfg.Icon className="w-3.5 h-3.5" />
                          {rcfg.label}
                        </motion.button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="relative overflow-hidden flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                          text-white text-xs font-bold shadow-[0_4px_16px_rgba(13,124,61,0.28)]">
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }} />
                        <span className="relative z-10">Join Meeting</span>
                      </motion.button>
                      <button onClick={() => window.location.href = `/dashboard/minutes/create?meeting=${meeting.id}`}
                        className="py-2.5 px-4 rounded-xl border border-white/[0.09] text-white/45 text-xs font-semibold
                          hover:text-white/70 hover:border-white/18 transition-colors">
                        Add Minutes
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Past Meetings ── */}
        {pastMeetings.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
            <h2 className="text-sm font-black text-white/40 tracking-[0.12em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
              Past Meetings
            </h2>
            <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
              style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Meeting','Date','Type','Minutes','Actions'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pastMeetings.map((m, i) => {
                      const type = getMeetingType(m.venue)
                      const cfg = TYPE_CFG[type as keyof typeof TYPE_CFG]
                      return (
                        <motion.tr key={m.id}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.04 }}
                          className="group border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors">
                          <td className="py-3.5 pl-5 pr-4">
                            <p className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors truncate max-w-[200px]">{m.title}</p>
                            <p className="text-[11px] text-white/25 truncate max-w-[200px]">{m.venue}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-sm text-white/50">{format(new Date(m.date), 'MMM d, yyyy')}</p>
                            <p className="text-[11px] text-white/25">{m.time}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                              <cfg.Icon className="w-3 h-3" />
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {m.minutesId ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs">
                                <CheckCircle className="w-3.5 h-3.5" />Recorded
                              </span>
                            ) : (
                              <button onClick={() => window.location.href = `/dashboard/minutes/create?meeting=${m.id}`}
                                className="text-xs text-[#0d7c3d] hover:text-emerald-400 font-semibold transition-colors">
                                Add Minutes
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 pr-5 pl-4">
                            <div className="flex gap-3">
                              <button className="text-xs text-sky-400/70 hover:text-sky-400 font-semibold transition-colors">Recording</button>
                              {currentUser?.role === 'ADMIN' && (
                                <button className="text-xs text-rose-400/60 hover:text-rose-400 font-semibold transition-colors">Delete</button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}