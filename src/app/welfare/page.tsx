'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartHandshake, CheckCircle, Copy, Check, AlertTriangle, XCircle, Loader2, Search } from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
type Tab         = 'submit' | 'check'
type SubmitState = 'form' | 'submitting' | 'success'
type CheckState  = 'idle' | 'loading' | 'found' | 'not_found' | 'error'

interface PublicResponse {
  responderName: string
  message: string
  createdAt: string
}

interface TicketStatus {
  ticketId: string
  status: string
  category: string
  subject: string
  responses: PublicResponse[]
  resolvedAt?: string
}

const API = 'https://api.ipeexecs.page/api'

const CATEGORY_OPTIONS = [
  { value: 'ACADEMIC',   label: 'Academic Issue' },
  { value: 'FINANCIAL',  label: 'Financial Hardship' },
  { value: 'HARASSMENT', label: 'Harassment or Misconduct' },
  { value: 'GENERAL',    label: 'General Complaint' },
  { value: 'SUGGESTION', label: 'Suggestion or Feedback' },
]

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', DISMISSED: 'Dismissed'
}
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-500/20 text-emerald-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  RESOLVED: 'bg-emerald-950/60 text-emerald-500',
  DISMISSED: 'bg-white/[0.07] text-white/40',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/* ─── Component ──────────────────────────────────── */
export default function WelfarePage() {
  const [tab, setTab] = useState<Tab>('submit')

  /* Submit tab */
  const [submitState, setSubmitState] = useState<SubmitState>('form')
  const [anonymous, setAnonymous] = useState(true)
  const [name, setName] = useState('')
  const [matric, setMatric] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [createdTicketId, setCreatedTicketId] = useState('')
  const [copied, setCopied] = useState(false)

  /* Check tab */
  const [checkId, setCheckId] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [foundTicket, setFoundTicket] = useState<TicketStatus | null>(null)

  const resetForm = () => {
    setSubmitState('form')
    setAnonymous(true); setName(''); setMatric(''); setEmail('')
    setCategory(''); setSubject(''); setDescription('')
    setSubmitError(''); setCreatedTicketId('')
  }

  const handleSubmit = async () => {
    if (!category) { setSubmitError('Please select a category.'); return }
    if (!subject.trim()) { setSubmitError('Subject is required.'); return }
    if (!description.trim()) { setSubmitError('Description is required.'); return }
    if (!anonymous && !name.trim()) { setSubmitError('Please enter your name or submit anonymously.'); return }

    setSubmitState('submitting'); setSubmitError('')
    try {
      const body: Record<string, unknown> = {
        category, subject: subject.trim(), description: description.trim(), isAnonymous: anonymous,
      }
      if (!anonymous) {
        if (name.trim()) body.submitterName = name.trim()
        if (matric.trim()) body.submitterMatric = matric.trim().toUpperCase()
        if (email.trim()) body.submitterEmail = email.trim()
      }
      const res = await fetch(`${API}/welfare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.message || 'Failed to submit ticket. Please try again.')
        setSubmitState('form')
        return
      }
      const data = await res.json()
      setCreatedTicketId(data.ticketId || data.ticket?.ticketId || '')
      setSubmitState('success')
    } catch {
      setSubmitError('Network error. Please check your connection.')
      setSubmitState('form')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(createdTicketId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCheckStatus = async () => {
    const id = checkId.trim().toUpperCase()
    if (!id) return
    setCheckState('loading'); setFoundTicket(null)
    try {
      const res = await fetch(`${API}/welfare/track/${id}`)
      if (res.status === 404) { setCheckState('not_found'); return }
      if (!res.ok) { setCheckState('error'); return }
      const data: TicketStatus = await res.json()
      setFoundTicket(data)
      setCheckState('found')
    } catch {
      setCheckState('error')
    }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.10]
    text-white text-sm placeholder:text-white/20 outline-none
    focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all`

  const labelCls = `block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2`

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div className="min-h-screen bg-[#06100a] flex items-start justify-center p-4 pt-8"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(13,124,61,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}>

        <div className="w-full max-w-md space-y-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
              <HeartHandshake className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase">IESA</p>
              <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                Welfare & Support
              </h1>
              <p className="text-sm text-white/35 mt-1">Submit a complaint, concern, or suggestion</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            {(['submit', 'check'] as Tab[]).map(t => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  tab === t
                    ? 'bg-[#0d7c3d] text-white shadow-[0_4px_12px_rgba(13,124,61,0.4)]'
                    : 'text-white/40 hover:text-white/60'
                }`}>
                {t === 'submit' ? 'Submit a Ticket' : 'Check Status'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Submit Tab ── */}
            {tab === 'submit' && (
              <motion.div key="submit"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                  style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                  <AnimatePresence mode="wait">
                    {/* Success */}
                    {submitState === 'success' && (
                      <motion.div key="success"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-8 text-center space-y-5">
                        <motion.div
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.05 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(13,124,61,0.5)]">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                            Ticket Submitted!
                          </h2>
                          <p className="text-sm text-white/40 mt-1">Your ticket has been received.</p>
                        </div>

                        <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/25 p-4 space-y-2">
                          <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.12em] uppercase">Your Ticket ID</p>
                          <div className="flex items-center gap-2">
                            <span className="flex-1 font-mono text-lg font-black text-emerald-400 text-center tracking-widest">
                              {createdTicketId}
                            </span>
                            <button type="button" onClick={handleCopy}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                copied
                                  ? 'bg-emerald-500/30 text-emerald-300'
                                  : 'bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.10]'
                              }`}>
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-emerald-400/50">Save this ID to track your ticket status.</p>
                        </div>

                        <button type="button" onClick={resetForm}
                          className="text-sm text-white/35 hover:text-white/60 transition-colors underline">
                          Submit another ticket
                        </button>
                      </motion.div>
                    )}

                    {/* Form */}
                    {submitState !== 'success' && (
                      <motion.div key="form" className="p-6 space-y-4">
                        {/* Anonymous toggle */}
                        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div>
                            <p className="text-sm font-medium text-white/70">Submit Anonymously</p>
                            <p className="text-[11px] text-white/30 mt-0.5">Your identity will not be disclosed</p>
                          </div>
                          <button type="button" onClick={() => setAnonymous(v => !v)}
                            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${anonymous ? 'bg-[#0d7c3d]' : 'bg-white/[0.10]'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${anonymous ? 'left-6' : 'left-1'}`} />
                          </button>
                        </div>

                        {/* Identity fields (when not anonymous) */}
                        <AnimatePresence>
                          {!anonymous && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="overflow-hidden space-y-3">
                              <div>
                                <label className={labelCls}>Name<span className="text-emerald-400 ml-0.5">*</span></label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)}
                                  placeholder="Your full name" className={inputCls} />
                              </div>
                              <div>
                                <label className={labelCls}>Matric Number</label>
                                <input type="text" value={matric} onChange={e => setMatric(e.target.value)}
                                  placeholder="e.g. CSC/2021/001" className={`${inputCls} font-mono`} />
                              </div>
                              <div>
                                <label className={labelCls}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                  placeholder="your@email.com" className={inputCls} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Category */}
                        <div>
                          <label className={labelCls}>Category<span className="text-emerald-400 ml-0.5">*</span></label>
                          <select value={category} onChange={e => setCategory(e.target.value)}
                            className={`${inputCls} appearance-none`}>
                            <option value="" disabled>Select a category…</option>
                            {CATEGORY_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Subject */}
                        <div>
                          <label className={labelCls}>Subject<span className="text-emerald-400 ml-0.5">*</span></label>
                          <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                            placeholder="Brief summary of your issue" className={inputCls} />
                        </div>

                        {/* Description */}
                        <div>
                          <label className={labelCls}>Description<span className="text-emerald-400 ml-0.5">*</span></label>
                          <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value.slice(0, 2000))}
                            placeholder="Describe your issue in detail…"
                            rows={5}
                            className={`${inputCls} resize-none`}
                          />
                          <p className={`text-[10px] text-right mt-1 ${description.length > 1900 ? 'text-amber-400/70' : 'text-white/25'}`}>
                            {description.length}/2000
                          </p>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {submitError && (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                              <p className="text-rose-300 text-sm">{submitError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button type="button" onClick={handleSubmit}
                          disabled={submitState === 'submitting'}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base
                            disabled:opacity-50 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                          {submitState === 'submitting'
                            ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting…</span>
                            : 'Submit Ticket'
                          }
                        </motion.button>

                        <p className="text-center text-[11px] text-white/18">
                          IESA — Department of Computer Science
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── Check Status Tab ── */}
            {tab === 'check' && (
              <motion.div key="check"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                  style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                  <div className="p-6 space-y-4">

                    {/* Input */}
                    <div>
                      <label className={labelCls}>Ticket ID</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={checkId}
                          onChange={e => { setCheckId(e.target.value); setCheckState('idle'); setFoundTicket(null) }}
                          onKeyDown={e => e.key === 'Enter' && handleCheckStatus()}
                          placeholder="e.g. IESA-A1B2C3"
                          className={`${inputCls} flex-1 font-mono tracking-wider`}
                        />
                        <motion.button type="button" onClick={handleCheckStatus}
                          disabled={checkState === 'loading' || !checkId.trim()}
                          whileTap={{ scale: 0.96 }}
                          className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                            text-white font-bold disabled:opacity-40 transition-all
                            shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
                          {checkState === 'loading'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Search className="w-4 h-4" />
                          }
                        </motion.button>
                      </div>
                    </div>

                    {/* Results */}
                    <AnimatePresence>

                      {checkState === 'not_found' && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-300 text-sm">No ticket found with that ID. Please check and try again.</p>
                        </motion.div>
                      )}

                      {checkState === 'error' && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-amber-300 text-sm">Something went wrong. Please try again.</p>
                        </motion.div>
                      )}

                      {checkState === 'found' && foundTicket && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="space-y-4">
                          {/* Ticket summary */}
                          <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                {foundTicket.ticketId}
                              </span>
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[foundTicket.status] ?? 'bg-white/[0.07] text-white/40'}`}>
                                {STATUS_LABELS[foundTicket.status] ?? foundTicket.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-white/35 uppercase font-bold tracking-widest mb-1">{foundTicket.category}</p>
                              <p className="text-sm font-bold text-white/80">{foundTicket.subject}</p>
                            </div>
                            {foundTicket.resolvedAt && (
                              <p className="text-[11px] text-emerald-400/60">
                                Resolved {timeAgo(foundTicket.resolvedAt)}
                              </p>
                            )}
                          </div>

                          {/* Public responses */}
                          {foundTicket.responses.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-[11px] font-bold text-white/30 tracking-[0.15em] uppercase">Responses</p>
                              {foundTicket.responses.map((r, i) => (
                                <div key={i} className="rounded-xl bg-emerald-950/30 border border-emerald-500/15 px-4 py-3 space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-white/60">{r.responderName}</span>
                                    <span className="text-[10px] text-white/30">{timeAgo(r.createdAt)}</span>
                                  </div>
                                  <p className="text-sm text-white/65 leading-relaxed">{r.message}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center rounded-xl bg-white/[0.02] border border-white/[0.04]">
                              <p className="text-sm text-white/25">No responses yet. Please check back later.</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>

                    <p className="text-center text-[11px] text-white/18">
                      IESA — Department of Computer Science
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
