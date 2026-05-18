'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipeexecs.page/api'

/* ── Types ───────────────────────────────────────── */
interface TicketItem { name: string; claimed: boolean; claimedAt?: string }
interface GuestTicketData {
  _id: string
  name: string
  email: string
  type: 'NON_STUDENT' | 'EXTERNAL_STUDENT'
  department?: string
  paymentStatus: 'NOT_REQUIRED' | 'PENDING' | 'CONFIRMED'
  checkedIn: boolean
  checkInTime?: string
  items: TicketItem[]
  token: string
  event: {
    title: string
    date: string
    time: string
    venue: string
    isPaidEvent: boolean
    registrationBrandName?: string
  }
}

type PageState = 'loading' | 'ready' | 'not_found' | 'error'

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function GuestTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [state, setState] = useState<PageState>('loading')
  const [ticket, setTicket] = useState<GuestTicketData | null>(null)

  const ticketUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://www.ipeexecs.page/events/guest-ticket/${token}`

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/guests/token/${token}`)
        if (res.status === 404) { setState('not_found'); return }
        if (!res.ok) { setState('error'); return }
        const data: GuestTicketData = await res.json()
        setTicket(data)
        setState('ready')
      } catch {
        setState('error')
      }
    }
    load()
  }, [token])

  const showQr = ticket?.paymentStatus === 'CONFIRMED' || ticket?.paymentStatus === 'NOT_REQUIRED'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
      <div
        className="min-h-screen bg-[#06100a] flex items-start justify-center p-4 pt-8 pb-16"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage:
            'radial-gradient(ellipse at 30% 10%, rgba(13,124,61,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}
      >
        <AnimatePresence mode="wait">

          {/* Loading */}
          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mt-20">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <p className="text-white/30 text-sm">Loading your ticket…</p>
            </motion.div>
          )}

          {/* Not found */}
          {state === 'not_found' && (
            <motion.div key="notfound" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Ticket Not Found
                  </h2>
                  <p className="text-sm text-white/30 mt-2">This link is invalid. Contact the event organiser.</p>
                </div>
                <p className="text-[11px] text-white/20">IESA — University of Ibadan</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
                <p className="text-white/50">Something went wrong. Please try again.</p>
              </div>
            </motion.div>
          )}

          {/* Ready */}
          {state === 'ready' && ticket && (
            <motion.div key="ready"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm space-y-4"
            >
              <div
                className="rounded-2xl border border-white/10 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f1f14 0%, #0a1a0f 100%)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
              >
                {/* Top stripe */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />

                <div className="p-6 space-y-5">
                  {/* Event + guest name */}
                  <div>
                    <p className="text-emerald-400/70 text-xs font-medium tracking-widest uppercase mb-1">
                      {ticket.event.title}
                    </p>
                    <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {ticket.name}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-medium">
                        {ticket.type === 'EXTERNAL_STUDENT' ? 'External Student' : 'Guest'}
                      </span>
                      {ticket.department && (
                        <span className="text-white/30 text-xs">{ticket.department}</span>
                      )}
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
                      <span>
                        {new Date(ticket.event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {ticket.event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500/60 flex-shrink-0" />
                      <span>{ticket.event.venue}</span>
                    </div>
                  </div>

                  {/* Dashed divider */}
                  <div className="border-t border-dashed border-white/10" />

                  {/* QR Code or pending state */}
                  <div className="flex flex-col items-center gap-3">
                    {showQr ? (
                      <>
                        <div className="p-4 bg-white rounded-xl">
                          <QRCodeSVG
                            value={ticketUrl}
                            size={180}
                            level="H"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-white/25 text-xs text-center">
                          {ticket.items.length > 0
                            ? 'Show this QR code to check in and collect your items'
                            : 'Show this QR code at the entrance to check in'}
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Clock className="w-10 h-10 text-amber-400/50" />
                        <p className="text-amber-400/80 text-sm font-medium">Payment Pending</p>
                        <p className="text-white/30 text-xs text-center">
                          Your QR code will appear here once payment is confirmed by the organiser.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items (if paid event with items) */}
                  {ticket.items.length > 0 && showQr && (
                    <>
                      <div className="border-t border-dashed border-white/10" />
                      <div>
                        <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Included Items</p>
                        <div className="space-y-2">
                          {ticket.items.map(item => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.claimed
                                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                                  : 'bg-white/5 border border-white/10'
                                  }`}>
                                  {item.claimed
                                    ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                                    : <div className="w-2 h-2 rounded-full bg-white/20" />
                                  }
                                </div>
                                <span className={`text-sm ${item.claimed ? 'text-white/30 line-through' : 'text-white/70'}`}>
                                  {item.name}
                                </span>
                              </div>
                              {item.claimed && item.claimedAt && (
                                <span className="text-[10px] text-white/20">
                                  {new Date(item.claimedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Check-in status */}
                  {ticket.checkedIn && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <div>
                        <p className="text-sky-300 text-xs font-medium">Checked In</p>
                        {ticket.checkInTime && (
                          <p className="text-sky-400/50 text-[10px]">
                            {new Date(ticket.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">
                    {ticket.event.registrationBrandName || 'IESA'} · Univ. of Ibadan
                  </p>
                  <p className="text-[10px] text-white/10 font-mono">{ticket.token.slice(0, 8)}…</p>
                </div>
              </div>

              <p className="text-white/20 text-xs text-center px-4">
                Save a screenshot of this page. You'll need your QR code at the event.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
