// src/components/meetings/create-meeting-modal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, Clock, MapPin, Link as LinkIcon,
  FileText, Video, Building, Users, ChevronDown, CheckCircle, Plus
} from 'lucide-react'

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateMeeting: (data: any) => Promise<void>
}

const inp = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/18 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/32 mb-1.5">{children}</p>
}

const MEETING_TYPES = [
  { value: 'physical', label: 'Physical', sub: 'In-person venue', Icon: Building, accent: '#10b981', glow: 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.22)]', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400' },
  { value: 'zoom',     label: 'Zoom',     sub: 'Video conference', Icon: Video,    accent: '#3b82f6', glow: 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_24px_rgba(59,130,246,0.22)]',   iconBg: 'bg-blue-500/15',    iconColor: 'text-blue-400' },
  { value: 'hybrid',   label: 'Hybrid',   sub: 'In-person + Online', Icon: Users, accent: '#8b5cf6', glow: 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.22)]', iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400' },
]

export default function CreateMeetingModal({ isOpen, onClose, onCreateMeeting }: CreateMeetingModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [agenda, setAgenda] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [meetingType, setMeetingType] = useState<'zoom' | 'physical' | 'hybrid'>('physical')
  const [rsvpDeadline, setRsvpDeadline] = useState('')
  const [session, setSession] = useState('2024/2025')
  const [semester, setSemester] = useState('First Semester')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time || !venue) return
    setLoading(true)
    try {
      await onCreateMeeting({ title, date, time, venue, agenda, zoomLink: meetingType !== 'physical' ? zoomLink : undefined, meetingType, rsvpDeadline, session, semester })
      setDone(true)
      setTimeout(() => {
        setTitle(''); setDate(''); setTime(''); setVenue(''); setAgenda(''); setZoomLink(''); setMeetingType('physical'); setRsvpDeadline('')
        setDone(false); onClose()
      }, 800)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.84)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 255, damping: 26 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12)',
            }}>

            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0d7c3d]/18 border border-[#0d7c3d]/25 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Schedule Meeting</h2>
                  <p className="text-[11px] text-white/30">Create a new department meeting</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
              <div className="px-7 py-6 space-y-6">

                {/* ── Meeting Type tiles ── */}
                <div>
                  <Label>Meeting Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {MEETING_TYPES.map(mt => (
                      <motion.button key={mt.value} type="button"
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setMeetingType(mt.value as any); if (mt.value === 'physical') setZoomLink('') }}
                        className={`relative overflow-hidden flex flex-col items-center gap-2.5 py-4 rounded-2xl border-[1.5px] transition-all duration-250
                          ${meetingType === mt.value ? `${mt.glow}` : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                        {meetingType === mt.value && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: mt.accent }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </motion.div>
                        )}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${meetingType === mt.value ? mt.iconBg : 'bg-white/[0.05]'}`}>
                          <mt.Icon className={`w-5 h-5 transition-colors ${meetingType === mt.value ? mt.iconColor : 'text-white/25'}`} />
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-bold transition-colors ${meetingType === mt.value ? 'text-white' : 'text-white/40'}`}>{mt.label}</p>
                          <p className="text-[10px] text-white/22 mt-0.5">{mt.sub}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* ── Basic Info grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meeting Title *</Label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Executive Committee Meeting"
                      className={inp} required />
                  </div>
                  <div>
                    <Label>Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className={`${inp} pl-10`} required />
                    </div>
                  </div>
                  <div>
                    <Label>Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="time" value={time} onChange={e => setTime(e.target.value)}
                        className={`${inp} pl-10`} required />
                    </div>
                  </div>
                  <div>
                    <Label>Venue / Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="text" value={venue} onChange={e => setVenue(e.target.value)}
                        placeholder={meetingType === 'zoom' ? 'Zoom Meeting Link' : 'Conference Room 302'}
                        className={`${inp} pl-10`} required />
                    </div>
                  </div>
                  <div>
                    <Label>Academic Session</Label>
                    <select value={session} onChange={e => setSession(e.target.value)}
                      className={`${inp} appearance-none cursor-pointer`}>
                      {['2023/2024','2024/2025','2025/2026'].map(s => <option key={s} className="bg-[#07150f]">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <select value={semester} onChange={e => setSemester(e.target.value)}
                      className={`${inp} appearance-none cursor-pointer`}>
                      {['First Semester','Second Semester','Summer Session'].map(s => <option key={s} className="bg-[#07150f]">{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Zoom link (conditional) */}
                <AnimatePresence>
                  {(meetingType === 'zoom' || meetingType === 'hybrid') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Label><LinkIcon className="inline w-3.5 h-3.5 mr-1" />Zoom Meeting Link</Label>
                      <input type="url" value={zoomLink} onChange={e => setZoomLink(e.target.value)}
                        placeholder="https://zoom.us/j/123456789"
                        className={inp} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* RSVP Deadline */}
                <div>
                  <Label><Clock className="inline w-3.5 h-3.5 mr-1" />RSVP Deadline (Optional)</Label>
                  <input type="datetime-local" value={rsvpDeadline} onChange={e => setRsvpDeadline(e.target.value)}
                    className={inp} />
                </div>

                {/* Agenda */}
                <div>
                  <Label><FileText className="inline w-3.5 h-3.5 mr-1" />Agenda (Optional)</Label>
                  <textarea value={agenda} onChange={e => setAgenda(e.target.value)} rows={4}
                    placeholder={'1. Budget review…\n2. Upcoming events…\n3. Committee reports…'}
                    className={`${inp} resize-none`} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-7 py-5 border-t border-white/[0.05]">
                <button type="button" onClick={onClose} disabled={loading}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold hover:text-white/70 hover:border-white/18 transition-colors">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 relative overflow-hidden py-3 rounded-2xl
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                    shadow-[0_8px_24px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-[0_12px_32px_rgba(13,124,61,0.45)] transition-shadow">
                  {!loading && <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />Scheduled!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Scheduling…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />Schedule Meeting
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}