'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarRange, ChevronLeft, ChevronRight, Plus, X, AlertTriangle, Clock
} from 'lucide-react'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'
import { calendarService, type CalendarEvent } from '@/services/calendar'

/* ─── Event type config ──────────────────────────── */
const EVENT_TYPES = [
  { value: 'EXAM',       label: 'Exam',         color: '#ef4444' },
  { value: 'IESA_EVENT', label: 'IESA Event',   color: '#10b981' },
  { value: 'DEADLINE',   label: 'Deadline',     color: '#f97316' },
  { value: 'HOLIDAY',    label: 'Holiday',      color: '#3b82f6' },
  { value: 'ACADEMIC',   label: 'Academic',     color: '#a855f7' },
  { value: 'OTHER',      label: 'Other',        color: '#6b7280' },
]

const TYPE_COLOR: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map(t => [t.value, t.color])
)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* ─── Date helpers ───────────────────────────────── */
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function eventCoversDay(event: CalendarEvent, date: Date): boolean {
  const start = new Date(event.startDate)
  const end = event.endDate ? new Date(event.endDate) : start
  const d = date.getTime()
  // Compare dates only (strip time)
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return t >= s && t <= e
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Add Event Modal ────────────────────────────── */
function AddEventModal({
  onClose, onCreated
}: {
  onClose: () => void
  onCreated: (e: CalendarEvent) => void
}) {
  const [form, setForm] = useState({
    title: '', type: 'IESA_EVENT', startDate: '', endDate: '',
    isAllDay: true, session: '', description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (key: string, value: string | boolean) => setForm(p => ({ ...p, [key]: value }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.startDate) { setError('Start date is required.'); return }
    setSubmitting(true); setError('')
    try {
      const color = TYPE_COLOR[form.type] ?? '#6b7280'
      const created = await calendarService.createEvent({
        title: form.title.trim(),
        type: form.type as CalendarEvent['type'],
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        isAllDay: form.isAllDay,
        session: form.session.trim() || undefined,
        description: form.description.trim() || undefined,
        color,
      })
      onCreated(created)
      onClose()
    } catch {
      setError('Failed to create event. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white text-sm placeholder:text-white/20 outline-none
    focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all`

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Add Calendar Event</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Title<span className="text-emerald-400 ml-0.5">*</span>
              </label>
              <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
                placeholder="Event title" className={inputCls} />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Type</label>
              <select value={form.type} onChange={e => update('type', e.target.value)} className={inputCls}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  Start Date<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)}
                  className={`${inputCls} [color-scheme:dark]`} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">End Date</label>
                <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)}
                  className={`${inputCls} [color-scheme:dark]`} />
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-sm text-white/60">All Day Event</span>
              <button type="button" onClick={() => update('isAllDay', !form.isAllDay)}
                className={`w-10 h-5.5 rounded-full transition-colors relative ${form.isAllDay ? 'bg-[#0d7c3d]' : 'bg-white/[0.10]'}`}
                style={{ height: '22px' }}>
                <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all ${form.isAllDay ? 'left-5' : 'left-[3px]'}`} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Session</label>
              <input type="text" value={form.session} onChange={e => update('session', e.target.value)}
                placeholder="e.g. 2025/2026" className={inputCls} />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                placeholder="Optional description…" rows={3}
                className={`${inputCls} resize-none`} />
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
                disabled:opacity-40 shadow-[0_4px_16px_rgba(13,124,61,0.4)] transition-all">
              {submitting ? 'Adding…' : 'Add Event'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Day detail panel ───────────────────────────── */
function DayPanel({ day, month, year, events, onClose }: {
  day: number; month: number; year: number; events: CalendarEvent[]; onClose: () => void
}) {
  const date = new Date(year, month, day)
  const dayEvents = events.filter(e => eventCoversDay(e, date))
  const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-full lg:w-72 shrink-0 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-white/40 font-bold tracking-wider uppercase">{dayLabel}</p>
            <p className="text-3xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>{day}</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-colors mt-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-sm text-white/25 py-4 text-center">No events this day.</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map(e => (
              <div key={e._id} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLOR[e.type] ?? '#6b7280' }} />
                  <span className="text-sm font-bold text-white/80 truncate">{e.title}</span>
                </div>
                {e.description && <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{e.description}</p>}
                <p className="text-[10px] text-white/25">{EVENT_TYPES.find(t => t.value === e.type)?.label ?? e.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function CalendarPage() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setIsAdmin(user?.role === ROLES.ADMIN)
  }, [])

  useEffect(() => {
    setLoading(true)
    setSelectedDay(null)
    Promise.all([
      calendarService.getEvents({ month: month + 1, year }).catch(() => []),
      calendarService.getUpcoming().catch(() => []),
    ]).then(([ev, up]) => {
      setEvents(Array.isArray(ev) ? ev : [])
      setUpcoming(Array.isArray(up) ? up : [])
    }).finally(() => setLoading(false))
  }, [month, year])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  /* Calendar grid calculation */
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Monday=0 offset
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  /* Events per day */
  const getDayEvents = (day: number) => {
    const d = new Date(year, month, day)
    return events.filter(e => eventCoversDay(e, d))
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#06100a] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">IESA</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Academic Calendar
            </h1>
          </div>
          {isAdmin && (
            <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={e => { e.stopPropagation(); setShowAdd(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                text-white text-sm font-bold shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              <Plus className="w-4 h-4" />
              Add Event
            </motion.button>
          )}
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-4">
          <button type="button" onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center
              text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black text-white min-w-[180px] text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
            {MONTHS[month]} {year}
          </h2>
          <button type="button" onClick={nextMonth}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center
              text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button type="button"
            onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}
            className="ml-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white/50 hover:text-white transition-colors">
            Today
          </button>
        </div>

        {/* Calendar + side panel */}
        <div className="flex gap-4 items-start flex-col lg:flex-row">
          {/* Calendar grid */}
          <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-white/[0.06]">
              {DAY_HEADERS.map(d => (
                <div key={d} className="py-3 text-center text-[11px] font-bold text-white/30 tracking-[0.1em] uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {Array.from({ length: totalCells }, (_, i) => {
                  const dayNum = i - startOffset + 1
                  const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
                  const isToday = isCurrentMonth && isSameDay(new Date(year, month, dayNum), today)
                  const isSelected = isCurrentMonth && selectedDay === dayNum
                  const dayEvents = isCurrentMonth ? getDayEvents(dayNum) : []

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!isCurrentMonth}
                      onClick={() => setSelectedDay(isCurrentMonth ? (selectedDay === dayNum ? null : dayNum) : null)}
                      className={`relative min-h-[72px] p-2 border-b border-r border-white/[0.04] flex flex-col items-start transition-all
                        ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                        ${isSelected ? 'bg-emerald-950/40' : isCurrentMonth ? 'hover:bg-white/[0.04]' : ''}
                      `}
                    >
                      {isCurrentMonth && (
                        <>
                          {/* Day number */}
                          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1
                            ${isToday
                              ? 'bg-[#0d7c3d] text-white shadow-[0_0_0_2px_rgba(13,124,61,0.4)]'
                              : isSelected ? 'text-emerald-400' : 'text-white/60'
                            }`}>
                            {dayNum}
                          </span>

                          {/* Event dots */}
                          <div className="flex flex-wrap gap-0.5">
                            {dayEvents.slice(0, 3).map((e, ei) => (
                              <span key={ei} className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: TYPE_COLOR[e.type] ?? '#6b7280' }} />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className="text-[9px] text-white/30 font-bold leading-none mt-px">+{dayEvents.length - 3}</span>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDay !== null && (
              <DayPanel
                key={`${year}-${month}-${selectedDay}`}
                day={selectedDay}
                month={month}
                year={year}
                events={events}
                onClose={() => setSelectedDay(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {EVENT_TYPES.map(t => (
            <div key={t.value} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-white/45">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400/60" />
            <h2 className="text-sm font-bold text-white/60 tracking-wide uppercase text-[11px]">Upcoming Events</h2>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-8 text-center rounded-2xl border border-white/[0.05] bg-white/[0.01]">
              <p className="text-sm text-white/25">No upcoming events.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 10).map(e => (
                <div key={e._id} className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]
                  hover:border-white/[0.08] transition-colors">
                  <span className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: TYPE_COLOR[e.type] ?? '#6b7280' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/80 truncate">{e.title}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {formatDate(e.startDate)}
                      {e.endDate && e.endDate !== e.startDate && ` → ${formatDate(e.endDate)}`}
                      <span className="ml-2 text-white/20">·</span>
                      <span className="ml-2">{EVENT_TYPES.find(t => t.value === e.type)?.label ?? e.type}</span>
                      {e.session && <><span className="ml-2 text-white/20">·</span><span className="ml-2">{e.session}</span></>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddEventModal
            onClose={() => setShowAdd(false)}
            onCreated={e => {
              setEvents(prev => [...prev, e])
              setUpcoming(prev => [...prev, e].sort((a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
              ).slice(0, 10))
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
