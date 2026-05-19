'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, CheckCircle, XCircle, AlertTriangle, Calendar, MapPin, Clock } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipeexecs.page/api'

/* ── Types ───────────────────────────────────────── */
type PageState = 'loading' | 'form' | 'success' | 'closed' | 'not_found' | 'error'
type GuestType = 'NON_STUDENT' | 'EXTERNAL_STUDENT'

interface EventInfo {
  _id: string
  title: string
  date: string
  time: string
  venue: string
  isPaidEvent: boolean
  guestRegistrationEnabled: boolean
  registrationBrandName?: string
  coverImage?: string
}

/* ── Component ───────────────────────────────────── */
export default function GuestRegisterPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [event, setEvent] = useState<EventInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [guestType, setGuestType] = useState<GuestType>('NON_STUDENT')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/events/${eventId}/public-info`)
        if (res.status === 404) { setPageState('not_found'); return }
        if (!res.ok) { setPageState('error'); return }
        const data: EventInfo = await res.json()
        setEvent(data)
        setPageState(data.guestRegistrationEnabled ? 'form' : 'closed')
      } catch {
        setPageState('error')
      }
    }
    load()
  }, [eventId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setInlineError('Please enter your full name'); return }
    if (!email.trim() || !email.includes('@')) { setInlineError('Please enter a valid email address'); return }
    if (guestType === 'EXTERNAL_STUDENT' && !department.trim()) {
      setInlineError('Please enter your department'); return
    }
    setSubmitting(true)
    setInlineError('')

    try {
      const res = await fetch(`${API}/events/${eventId}/guests/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          type: guestType,
          department: guestType === 'EXTERNAL_STUDENT' ? department.trim() : undefined,
        }),
      })
      const data = await res.json()

      if (res.status === 409) { setInlineError('You are already registered for this event with that email.'); return }
      if (res.status === 403) { setPageState('closed'); return }
      if (!res.ok) { setInlineError(data.message || 'Registration failed. Please try again.'); return }

      setPageState('success')
    } catch {
      setInlineError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const eventDate = event
    ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div
        className="min-h-screen bg-[#06100a] flex items-start justify-center p-4 pt-8 pb-16"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(13,124,61,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}
      >
        <AnimatePresence mode="wait">

          {/* Loading */}
          {pageState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mt-20">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <p className="text-white/30 text-sm">Loading event…</p>
            </motion.div>
          )}

          {/* Not found */}
          {pageState === 'not_found' && (
            <motion.div key="notfound" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm mt-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Event Not Found</h2>
                  <p className="text-sm text-white/30 mt-2">This registration link is invalid. Contact the organiser.</p>
                </div>
                <p className="text-[11px] text-white/20">IESA — University of Ibadan</p>
              </div>
            </motion.div>
          )}

          {/* Registration closed */}
          {pageState === 'closed' && (
            <motion.div key="closed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm mt-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Registration Closed</h2>
                  {event?.title && <p className="text-sm text-white/35 mt-1">{event.title}</p>}
                  <p className="text-sm text-white/30 mt-3">Guest registration is not currently open for this event.</p>
                </div>
                <p className="text-[11px] text-white/20">{event?.registrationBrandName || 'IESA'} — University of Ibadan</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {pageState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm mt-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-white/50 text-sm">Something went wrong. Please try again.</p>
              </div>
            </motion.div>
          )}

          {/* Registration form */}
          {pageState === 'form' && event && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }} className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                <div className="p-6 space-y-5">
                  {/* Header */}
                  <div className="flex flex-col items-center gap-3">
                    {event.coverImage ? (
                      <img src={event.coverImage} alt={event.title}
                        className="w-14 h-14 rounded-2xl object-cover shadow-[0_8px_24px_rgba(13,124,61,0.4)]" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                        <UserPlus className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div className="text-center">
                      {event.registrationBrandName ? (
                        <p
                          className="font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-400"
                          style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem, 5vw, 1.9rem)' }}
                        >
                          {event.registrationBrandName}
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase">IESA</p>
                      )}
                      <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Event Registration
                      </h1>
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15 space-y-1.5">
                    <p className="text-[11px] text-emerald-400/55 font-bold tracking-[0.12em] uppercase mb-2">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
                      <span>{eventDate} · {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                    {event.isPaidEvent && (
                      <div className="flex items-center gap-2 text-amber-400/70 text-xs mt-1">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Payment confirmation required — you'll be notified by email</span>
                      </div>
                    )}
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Guest type toggle */}
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                        I am a
                      </label>
                      <div className="flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1 gap-1">
                        {([
                          { value: 'NON_STUDENT', label: 'Non-Student' },
                          { value: 'EXTERNAL_STUDENT', label: 'Allied Dept Student' },
                        ] as { value: GuestType; label: string }[]).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setGuestType(opt.value); setInlineError('') }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${guestType === opt.value
                              ? 'bg-emerald-600 text-white shadow-[0_2px_8px_rgba(13,124,61,0.4)]'
                              : 'text-white/40 hover:text-white/60'
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full name */}
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => { setName(e.target.value); setInlineError('') }}
                        placeholder="Your full name"
                        autoComplete="name"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setInlineError('') }}
                        placeholder="your@email.com"
                        autoComplete="email"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                      />
                    </div>

                    {/* Phone (optional) */}
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                        Phone Number <span className="text-white/20 normal-case font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setInlineError('') }}
                        placeholder="e.g. 08012345678"
                        autoComplete="tel"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                      />
                    </div>

                    {/* Department (external students only) */}
                    <AnimatePresence>
                      {guestType === 'EXTERNAL_STUDENT' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        >
                          <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                            Department
                          </label>
                          <input
                            type="text"
                            value={department}
                            onChange={e => { setDepartment(e.target.value); setInlineError('') }}
                            placeholder="e.g. Mechanical Engineering"
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Inline error */}
                    <AnimatePresence>
                      {inlineError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-300 text-sm font-medium">{inlineError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={submitting || !name.trim() || !email.trim()}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]"
                    >
                      {submitting ? 'Registering…' : 'Register for Event'}
                    </motion.button>
                  </form>

                  <p className="text-center text-[11px] text-white/18">
                    {event.registrationBrandName
                      ? `${event.registrationBrandName} · University of Ibadan`
                      : "IESA — Industrial Engineering Students' Association"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm mt-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="p-8 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto shadow-[0_12px_32px_rgba(13,124,61,0.5)]"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase mb-1">Registered!</p>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                      You're All Set!
                    </h2>
                    {event?.title && (
                      <p className="text-sm text-white/35 mt-2">
                        Registration received for <span className="text-white/55 font-medium">{event.title}</span>
                      </p>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                    <p className="text-xs text-emerald-400/60 leading-relaxed">
                      Check your email for a confirmation. Your ticket and QR code will be sent once registration is finalised.
                    </p>
                  </motion.div>

                  <p className="text-[11px] text-white/18">
                    {event?.registrationBrandName
                      ? `${event.registrationBrandName} · University of Ibadan`
                      : "IESA — Industrial Engineering Students' Association"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
