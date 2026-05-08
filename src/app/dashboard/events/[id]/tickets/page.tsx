'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, CheckCircle, Clock, Mail, Download, Plus, ArrowLeft,
  Search, RefreshCw, Ticket, X, ChevronDown,
} from 'lucide-react'
import API from '@/services/api'
import { toast } from 'sonner'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.ipeexecs.page/api'

/* ── Types ───────────────────────────────────────── */
interface TicketItem { name: string; claimed: boolean; claimedAt?: string }
interface EventTicket {
  _id: string
  memberName: string
  memberEmail: string
  matricNumber?: string
  paymentStatus: 'PENDING' | 'CONFIRMED'
  confirmedBy?: { name: string }
  confirmedAt?: string
  checkedIn: boolean
  checkInTime?: string
  items: TicketItem[]
  token: string
}
interface EventInfo {
  _id: string
  title: string
  date: string
  venue: string
  time: string
  isPaidEvent: boolean
  ticketItems: string[]
  ticketPrice?: number
}
interface Member { _id: string; name: string; email: string; matricNumber?: string }

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function TicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const router = useRouter()

  const [event, setEvent] = useState<EventInfo | null>(null)
  const [tickets, setTickets] = useState<EventTicket[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirming, setConfirming] = useState<string | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadAll() }, [eventId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [eventRes, ticketsRes, membersRes] = await Promise.all([
        API.get(`/events/${eventId}`),
        API.get(`/event-tickets/event/${eventId}`),
        API.get('/members?limit=500'),
      ]) as any[]
      setEvent(eventRes)
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : [])
      const allMembers = Array.isArray(membersRes?.members) ? membersRes.members : (Array.isArray(membersRes) ? membersRes : [])
      setMembers(allMembers)
    } catch {
      toast.error('Failed to load ticket data')
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (ticketId: string, memberName: string) => {
    setConfirming(ticketId)
    try {
      await API.put(`/event-tickets/${ticketId}/confirm`, {})
      toast.success(`✅ Payment confirmed for ${memberName} — ticket emailed`)
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, paymentStatus: 'CONFIRMED' } : t))
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm payment')
    } finally {
      setConfirming(null)
    }
  }

  const resendEmail = async (ticketId: string, memberName: string) => {
    setResending(ticketId)
    try {
      await API.post(`/event-tickets/${ticketId}/resend`, {})
      toast.success(`Email resent to ${memberName}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend email')
    } finally {
      setResending(null)
    }
  }

  const addTickets = async () => {
    if (!selectedMembers.length) return
    setAdding(true)
    try {
      const res = await API.post('/event-tickets', { eventId, memberIds: selectedMembers }) as any
      toast.success(res.message || 'Tickets created')
      setShowAddModal(false)
      setSelectedMembers([])
      loadAll()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tickets')
    } finally {
      setAdding(false)
    }
  }

  const exportCsv = () => {
    window.open(`${API_BASE}/event-tickets/event/${eventId}/export`, '_blank')
  }

  /* ── Derived ─────────────────────────────────── */
  const filtered = tickets.filter(t =>
    t.memberName.toLowerCase().includes(search.toLowerCase()) ||
    t.matricNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.memberEmail.toLowerCase().includes(search.toLowerCase())
  )
  const confirmed = tickets.filter(t => t.paymentStatus === 'CONFIRMED').length
  const checkedIn = tickets.filter(t => t.checkedIn).length

  const ticketMemberIds = new Set(tickets.map(t => t.memberName.toLowerCase()))
  const availableMembers = members.filter(m =>
    !ticketMemberIds.has(m.name.toLowerCase()) &&
    (m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.matricNumber?.toLowerCase().includes(memberSearch.toLowerCase()))
  )

  /* ── Render ──────────────────────────────────── */
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-black text-white font-display">
            {event?.title || 'Event'} — Tickets
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {event?.date ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''} · {event?.venue}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => router.push(`/dashboard/events/${eventId}/scan`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            <Ticket className="w-4 h-4" /> Open Scanner
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600/40 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Members
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'text-white/60' },
          { label: 'Payment Confirmed', value: confirmed, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Checked In', value: checkedIn, icon: Users, color: 'text-sky-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-white/40 text-xs">{label}</span>
            </div>
            <p className={`text-2xl font-black ${color} font-display`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Items reference */}
      {event?.ticketItems?.length ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/30 text-xs">Items:</span>
          {event.ticketItems.map(item => (
            <span key={item} className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, matric or email…"
          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-emerald-600/50"
        />
      </div>

      {/* Ticket list */}
      {!filtered.length ? (
        <div className="text-center py-16 text-white/30">
          {tickets.length ? 'No tickets match your search' : 'No tickets yet — add members to get started'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{ticket.memberName}</p>
                  <p className="text-white/40 text-xs mt-0.5">{ticket.matricNumber || ticket.memberEmail}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {/* Payment badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ticket.paymentStatus === 'CONFIRMED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                    {ticket.paymentStatus === 'CONFIRMED' ? '✅ Paid' : '⏳ Pending'}
                  </span>

                  {/* Check-in badge */}
                  {ticket.checkedIn && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                      Checked In
                    </span>
                  )}

                  {/* Actions */}
                  {ticket.paymentStatus === 'PENDING' ? (
                    <button
                      onClick={() => confirmPayment(ticket._id, ticket.memberName)}
                      disabled={confirming === ticket._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                    >
                      {confirming === ticket._id
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <CheckCircle className="w-3 h-3" />}
                      Confirm Payment
                    </button>
                  ) : (
                    <button
                      onClick={() => resendEmail(ticket._id, ticket.memberName)}
                      disabled={resending === ticket._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-white/50 hover:text-white/80 text-xs transition-colors disabled:opacity-50"
                    >
                      {resending === ticket._id
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <Mail className="w-3 h-3" />}
                      Resend
                    </button>
                  )}
                </div>
              </div>

              {/* Items mini-display */}
              {ticket.items.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {ticket.items.map(item => (
                    <span key={item.name} className={`text-[11px] px-2 py-0.5 rounded-full ${item.claimed
                      ? 'bg-white/5 text-white/25 line-through'
                      : 'bg-white/[0.03] border border-white/10 text-white/40'
                      }`}>
                      {item.claimed ? '✓' : '·'} {item.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Members Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-white font-display text-lg">Add Members</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                placeholder="Search members…"
                className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-emerald-600/50 mb-3"
              />

              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {availableMembers.slice(0, 50).map(m => (
                  <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m._id)}
                      onChange={e => setSelectedMembers(prev =>
                        e.target.checked ? [...prev, m._id] : prev.filter(id => id !== m._id)
                      )}
                      className="accent-emerald-500"
                    />
                    <div>
                      <p className="text-white/80 text-sm">{m.name}</p>
                      <p className="text-white/30 text-xs">{m.matricNumber || m.email}</p>
                    </div>
                  </label>
                ))}
                {!availableMembers.length && (
                  <p className="text-center py-8 text-white/30 text-sm">All members already have tickets</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-white/40 text-sm">{selectedMembers.length} selected</span>
                <button
                  onClick={addTickets}
                  disabled={!selectedMembers.length || adding}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Tickets
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
