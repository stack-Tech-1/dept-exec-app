'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Clock, CheckCircle, XCircle, MapPin,
  Edit, ChevronDown, X, AlertCircle, Plus, Users, Ticket, Link2, ImagePlus
} from 'lucide-react'
import { authService } from '@/services/auth'
import { eventsService, type Event, type EventStats } from '@/services/events'

/* ─── Helpers ──────────────────────────────────────── */
const TYPE_CFG: Record<string, { label: string; color: string }> = {
  SOCIAL:            { label: 'Social',            color: '#a78bfa' },
  ACADEMIC:          { label: 'Academic',          color: '#60a5fa' },
  COMPETITION:       { label: 'Competition',       color: '#f59e0b' },
  DEPARTMENTAL_WEEK: { label: 'Departmental Week', color: '#10b981' },
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  UPCOMING:  { label: 'Upcoming',  cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  ONGOING:   { label: 'Ongoing',   cls: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  COMPLETED: { label: 'Completed', cls: 'bg-white/[0.07] text-white/35 border-white/[0.08]' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
}

const TYPE_FILTERS = [
  { value: 'ALL',            label: 'All' },
  { value: 'SOCIAL',         label: 'Social' },
  { value: 'ACADEMIC',       label: 'Academic' },
  { value: 'COMPETITION',    label: 'Competition' },
  { value: 'DEPARTMENTAL_WEEK', label: 'Dept. Week' },
]

const STATUS_TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  UPCOMING:  [{ value: 'ONGOING', label: 'Mark Ongoing' }, { value: 'CANCELLED', label: 'Mark Cancelled' }],
  ONGOING:   [{ value: 'COMPLETED', label: 'Mark Completed' }, { value: 'CANCELLED', label: 'Mark Cancelled' }],
  COMPLETED: [],
  CANCELLED: [],
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function getCountdown(dateStr: string): { label: string; urgent: boolean } | null {
  const days = Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000)
  if (days < 0) return null
  if (days === 0) return { label: 'Today!', urgent: true }
  if (days === 1) return { label: 'Tomorrow', urgent: true }
  return { label: `${days} days away`, urgent: false }
}

/* ─── Count-up ─────────────────────────────────────── */
function CountUp({ value, color }: { value: number; color: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0; const steps = 24; const inc = value / steps
    const t = setInterval(() => {
      i += inc
      if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i))
    }, 42)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{count}</span>
}

/* ─── Type badge ────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CFG[type] ?? { label: type, color: '#e5e7eb' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: cfg.color + '15', color: cfg.color, borderColor: cfg.color + '30' }}>
      {cfg.label}
    </span>
  )
}

/* ─── Status badge ──────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: 'bg-white/[0.05] text-white/40 border-white/[0.08]' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white text-sm placeholder:text-white/25 outline-none focus:border-emerald-500/40
  focus:bg-white/[0.07] transition-all`
const labelCls = `block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5`

/* ═══════════════════════ EventModal ═══════════════════════ */
function EventModal({
  event, onClose, onSaved
}: { event: Event | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!event
  const [form, setForm] = useState({
    title: event?.title ?? '',
    description: event?.description ?? '',
    type: event?.type ?? 'SOCIAL',
    date: event?.date ? event.date.slice(0, 10) : '',
    endDate: event?.endDate ? event.endDate.slice(0, 10) : '',
    time: event?.time ?? '',
    venue: event?.venue ?? '',
    expectedAttendance: event?.expectedAttendance?.toString() ?? '',
    tags: event?.tags?.join(', ') ?? '',
    ticketPrice: event?.ticketPrice?.toString() ?? '',
    ticketItems: event?.ticketItems?.join(', ') ?? '',
  })
  const [isPaidEvent, setIsPaidEvent] = useState(event?.isPaidEvent ?? false)
  const [guestRegistrationEnabled, setGuestRegistrationEnabled] = useState(event?.guestRegistrationEnabled ?? false)
  const [registrationBrandName, setRegistrationBrandName] = useState(event?.registrationBrandName ?? '')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState(event?.coverImage ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setCoverImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    if (!form.date)         { setErr('Date is required'); return }
    if (!form.time.trim())  { setErr('Time is required'); return }
    if (!form.venue.trim()) { setErr('Venue is required'); return }
    setSaving(true); setErr('')
    try {
      let coverImageUrl = event?.coverImage
      if (coverImageFile) {
        const { url } = await eventsService.uploadCoverImage(coverImageFile)
        coverImageUrl = url
      }
      const payload: any = {
        ...form,
        expectedAttendance: form.expectedAttendance ? Number(form.expectedAttendance) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        endDate: form.endDate || undefined,
        isPaidEvent,
        ticketPrice: isPaidEvent && form.ticketPrice ? Number(form.ticketPrice) : undefined,
        ticketItems: isPaidEvent ? form.ticketItems.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        guestRegistrationEnabled,
        registrationBrandName: registrationBrandName.trim() || undefined,
        coverImage: coverImageUrl || undefined,
      }
      if (isEdit && event) {
        await eventsService.updateEvent(event._id, payload)
      } else {
        await eventsService.createEvent(payload)
      }
      onSaved()
    } catch (e: any) {
      setErr(e.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a1c11 0%, #06100a 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '-24px 0 64px rgba(0,0,0,0.5)',
        }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">
              {isEdit ? 'Edit' : 'New'} Event
            </p>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {isEdit ? 'Update Event' : 'Create Event'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {err && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-400 text-sm">{err}</p>
            </div>
          )}

          {/* Cover Image Upload */}
          <div>
            <label className={labelCls}>Cover Image</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden"
              style={{ height: coverImagePreview ? 'auto' : '88px' }}>
              {coverImagePreview ? (
                <div className="relative group">
                  <img src={coverImagePreview} alt="Cover" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <ImagePlus className="w-4 h-4" />Change Image
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1.5 text-white/30">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs font-medium">Upload cover image</span>
                </div>
              )}
            </button>
            {coverImagePreview && (
              <button type="button" onClick={() => { setCoverImagePreview(''); setCoverImageFile(null) }}
                className="text-[10px] text-white/25 hover:text-rose-400 transition-colors mt-1.5">
                Remove image
              </button>
            )}
          </div>

          <div>
            <label className={labelCls}>Title *</label>
            <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Annual Cultural Night" />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the event…" />
          </div>

          <div>
            <label className={labelCls}>Event Type</label>
            <div className="relative">
              <select className={inputCls + ' appearance-none pr-8 cursor-pointer'} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="SOCIAL" className="bg-[#06100a]">Social</option>
                <option value="ACADEMIC" className="bg-[#06100a]">Academic</option>
                <option value="COMPETITION" className="bg-[#06100a]">Competition</option>
                <option value="DEPARTMENTAL_WEEK" className="bg-[#06100a]">Departmental Week</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" className={inputCls + ' cursor-pointer'} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" className={inputCls + ' cursor-pointer'} value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Time *</label>
              <input className={inputCls} value={form.time} onChange={e => set('time', e.target.value)} placeholder="2:00 PM" />
            </div>
            <div>
              <label className={labelCls}>Expected Attendance</label>
              <input type="number" min="0" className={inputCls} value={form.expectedAttendance} onChange={e => set('expectedAttendance', e.target.value)} placeholder="100" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Venue *</label>
            <input className={inputCls} value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="e.g. Faculty Hall, 200L Block" />
          </div>

          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. cultural, annual, music" />
          </div>

          <div className="pt-1 border-t border-white/[0.06]">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsPaidEvent(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isPaidEvent ? 'bg-emerald-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPaidEvent ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70">Paid Event</p>
                <p className="text-[11px] text-white/30">Members need a ticket to attend</p>
              </div>
            </label>

            {isPaidEvent && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className={labelCls}>Ticket Price (₦) — display only</label>
                  <input type="number" min="0" className={inputCls} value={form.ticketPrice}
                    onChange={e => set('ticketPrice', e.target.value)} placeholder="e.g. 2000" />
                </div>
                <div>
                  <label className={labelCls}>Items Included (comma-separated)</label>
                  <input className={inputCls} value={form.ticketItems}
                    onChange={e => set('ticketItems', e.target.value)}
                    placeholder="e.g. Food, Drinks, Snacks, Souvenir" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06]">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setGuestRegistrationEnabled(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${guestRegistrationEnabled ? 'bg-emerald-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${guestRegistrationEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/70">Guest Registration</p>
                <p className="text-[11px] text-white/30">Allow non-members to register via a public link</p>
              </div>
            </label>

            {guestRegistrationEnabled && (
              <div className="mt-3">
                <label className={labelCls}>Registration Brand Name</label>
                <input
                  className={inputCls}
                  value={registrationBrandName}
                  onChange={e => setRegistrationBrandName(e.target.value)}
                  placeholder="e.g. ENERGY 2FACTOR (leave blank for IESA)"
                />
                <p className="text-[11px] text-white/25 mt-1.5">
                  Shown on the public registration page and confirmation emails in place of "IESA".
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold disabled:opacity-50 hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)] transition-all">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════ Event Card ═══════════════════════ */
function EventCard({
  event, isAdmin, currentUserId, onEdit, onStatusChange, onRsvp
}: {
  event: Event
  isAdmin: boolean
  currentUserId: string | undefined
  onEdit: (e: Event) => void
  onStatusChange: (id: string, status: string) => void
  onRsvp: (id: string, response: 'GOING' | 'NOT_GOING' | 'MAYBE') => void
}) {
  const [statusMenu, setStatusMenu] = useState(false)
  const [rsvping, setRsvping] = useState(false)

  const goingCount   = event.rsvps.filter(r => r.response === 'GOING').length
  const maybeCount   = event.rsvps.filter(r => r.response === 'MAYBE').length
  const myRsvp       = event.rsvps.find(r => r.user._id === currentUserId)?.response
  const countdown    = event.status === 'UPCOMING' ? getCountdown(event.date) : null
  const transitions  = STATUS_TRANSITIONS[event.status] ?? []

  const rsvpBtns: { response: 'GOING' | 'NOT_GOING' | 'MAYBE'; label: string; active: string; count: number }[] = [
    { response: 'GOING',     label: '✅ Going',    active: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400', count: goingCount },
    { response: 'MAYBE',     label: '❓ Maybe',    active: 'bg-amber-500/15 border-amber-500/40 text-amber-400',       count: maybeCount },
    { response: 'NOT_GOING', label: '❌ Not Going', active: 'bg-rose-500/15 border-rose-500/40 text-rose-400',         count: event.rsvps.filter(r => r.response === 'NOT_GOING').length },
  ]

  const handleRsvp = async (response: 'GOING' | 'NOT_GOING' | 'MAYBE') => {
    if (rsvping) return
    setRsvping(true)
    try { await onRsvp(event._id, response) } finally { setRsvping(false) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] flex flex-col overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

      {/* Type stripe */}
      <div className="h-1 w-full" style={{ background: TYPE_CFG[event.type]?.color ?? '#e5e7eb' }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Top row: badges */}
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={event.type} />
          <div className="flex items-center gap-1.5">
            {countdown && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                countdown.urgent
                  ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                  : 'bg-white/[0.05] text-white/40 border-white/[0.08]'
              }`}>
                {countdown.label}
              </span>
            )}
            <StatusBadge status={event.status} />
          </div>
        </div>

        {/* Title + description */}
        <div>
          <h3 className="text-base font-black text-white/90 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-white/38 mt-1 leading-relaxed">
              {event.description.length > 80 ? event.description.slice(0, 80) + '…' : event.description}
            </p>
          )}
        </div>

        {/* Date / venue */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-400/45 shrink-0" />
            <span>{formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` — ${formatDate(event.endDate)}` : ''}</span>
            <span className="text-white/25">·</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <MapPin className="w-3.5 h-3.5 text-white/20 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-white/25 border border-white/[0.06]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* RSVP buttons */}
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {rsvpBtns.map(btn => (
              <button key={btn.response}
                onClick={() => handleRsvp(btn.response)}
                disabled={rsvping}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                  myRsvp === btn.response
                    ? btn.active
                    : 'bg-white/[0.03] border-white/[0.07] text-white/30 hover:text-white/55 hover:bg-white/[0.06]'
                }`}>
                {btn.label} {btn.count > 0 ? `(${btn.count})` : ''}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-white/22">
            <span className="text-white/40 font-semibold">{goingCount}</span> going
            {maybeCount > 0 && <> · <span className="text-white/40 font-semibold">{maybeCount}</span> maybe</>}
            {event.expectedAttendance ? <> · <span className="text-white/22">of {event.expectedAttendance} expected</span></> : ''}
          </p>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
            <button onClick={() => onEdit(event)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/35 text-xs font-semibold hover:text-white/60 hover:bg-white/[0.07] transition-all">
              <Edit className="w-3 h-3" />Edit
            </button>

            {(event.isPaidEvent || event.guestRegistrationEnabled) && (
              <a href={`/dashboard/events/${event._id}/tickets`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all">
                <Ticket className="w-3 h-3" />Manage
              </a>
            )}

            {event.guestRegistrationEnabled && (
              <button
                onClick={() => {
                  const link = `${window.location.origin}/events/register/${event._id}`
                  navigator.clipboard.writeText(link).then(() => alert('Guest registration link copied!'))
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold hover:bg-violet-500/20 transition-all"
                title="Copy guest registration link"
              >
                <Link2 className="w-3 h-3" />Link
              </button>
            )}

            {transitions.length > 0 && (
              <div className="relative">
                <button onClick={() => setStatusMenu(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/35 text-xs font-semibold hover:text-white/60 hover:bg-white/[0.07] transition-all">
                  <ChevronDown className="w-3 h-3" />Status
                </button>
                <AnimatePresence>
                  {statusMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setStatusMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 4 }}
                        transition={{ duration: 0.13 }}
                        className="absolute left-0 bottom-full mb-1 w-44 rounded-xl overflow-hidden z-50"
                        style={{
                          background: 'linear-gradient(145deg, #0a1c11, #061510)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                        }}>
                        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        <div className="py-1">
                          {transitions.map(opt => (
                            <button key={opt.value}
                              onClick={() => { onStatusChange(event._id, opt.value); setStatusMenu(false) }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-xs text-white/55 hover:text-white hover:bg-white/[0.05] transition-colors">
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="ml-auto flex items-center gap-1 text-[11px] text-white/22">
              <Users className="w-3 h-3" />
              <span>{event.rsvps.length}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════ ROOT PAGE ═══════════════════════════ */
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<EventStats>({ total: 0, upcoming: 0, completed: 0, cancelled: 0, byType: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [modal, setModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Event | null>(null)

  const isAdmin    = authService.isAdmin()
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    fetchStats()
    fetchEvents()
  }, [tab])

  const fetchStats = async () => {
    try {
      const s = await eventsService.getStats()
      setStats(s)
    } catch { /* non-critical */ }
  }

  const fetchEvents = async () => {
    setLoading(true); setError('')
    try {
      const res = await eventsService.getEvents(tab === 'upcoming' ? { upcoming: true } : {})
      const all = res.events ?? []
      const filtered = tab === 'past'
        ? all.filter(e => e.status === 'COMPLETED' || e.status === 'CANCELLED')
        : all
      setEvents(filtered)
    } catch (e: any) {
      setError(e.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async (id: string, response: 'GOING' | 'NOT_GOING' | 'MAYBE') => {
    try {
      const updated = await eventsService.rsvp(id, response)
      setEvents(prev => prev.map(e => e._id === id ? updated : e))
    } catch (e: any) { alert(e.message || 'Failed to RSVP') }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await eventsService.updateEventStatus(id, status)
      setEvents(prev => prev.map(e => e._id === id ? updated : e))
      fetchStats()
    } catch (e: any) { alert(e.message || 'Failed to update status') }
  }

  const handleSaved = () => {
    setModal(false); setEditTarget(null)
    fetchEvents(); fetchStats()
  }

  const displayedEvents = typeFilter === 'ALL'
    ? events
    : events.filter(e => e.type === typeFilter)

  const statCards = [
    { value: stats.total,     label: 'Total Events',  color: '#e5e7eb', Icon: CalendarDays },
    { value: stats.upcoming,  label: 'Upcoming',      color: '#10b981', Icon: Clock },
    { value: stats.completed, label: 'Completed',     color: '#60a5fa', Icon: CheckCircle },
    { value: stats.cancelled, label: 'Cancelled',     color: '#f87171', Icon: XCircle },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Modal */}
      <AnimatePresence>
        {(modal || editTarget) && (
          <EventModal
            event={editTarget}
            onClose={() => { setModal(false); setEditTarget(null) }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Events
            </h1>
            <p className="text-sm text-white/30 mt-1">Social, academic, and departmental events</p>
          </div>
          {isAdmin && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setModal(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start sm:self-auto
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Event</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <CountUp value={s.value} color={s.color} />
                </p>
                <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{s.label}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '14', border: `1px solid ${s.color}22` }}>
                <s.Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0">
          {(['upcoming', 'past'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setTypeFilter('ALL') }}
              className={`relative px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'text-emerald-400' : 'text-white/35 hover:text-white/60'
              }`}>
              {t}
              {tab === t && (
                <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Type filter pills ── */}
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                typeFilter === f.value
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.07] text-white/35 hover:text-white/55 hover:bg-white/[0.06]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm flex-1">{error}</p>
            <button onClick={fetchEvents} className="text-xs text-rose-400/70 hover:text-rose-400 underline shrink-0">Retry</button>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
              animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
          </div>
        ) : displayedEvents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl bg-[#06100a] border border-white/[0.06] py-20 text-center">
            <CalendarDays className="w-10 h-10 text-white/8 mx-auto mb-3" />
            <p className="text-white/22 text-sm">
              {tab === 'upcoming' ? 'No upcoming events.' : 'No past events yet.'}
            </p>
            {isAdmin && tab === 'upcoming' && (
              <button onClick={() => setModal(true)} className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline">
                Create one to get started
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayedEvents.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  isAdmin={isAdmin}
                  currentUserId={currentUser?.id}
                  onEdit={e => { setEditTarget(e) }}
                  onStatusChange={handleStatusChange}
                  onRsvp={handleRsvp}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </>
  )
}
