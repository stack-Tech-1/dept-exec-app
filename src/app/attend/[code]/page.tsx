'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
type PageState = 'loading' | 'form' | 'success' | 'closed' | 'not_found' | 'error'

interface SessionInfo {
  title: string
  description?: string
}

interface MarkResult {
  name?: string
  alreadyMarked?: boolean
  notFound?: boolean
}

const API_BASE = 'https://api.ipeexecs.page/api'

/* ─── Component ──────────────────────────────────── */
export default function AttendPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)

  const [state, setState] = useState<PageState>('loading')
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [matric, setMatric] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [memberName, setMemberName] = useState('')
  const [inlineError, setInlineError] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`https://api.ipeexecs.page/api/attendance/code/${code}`)
        if (res.status === 404) { setState('not_found'); return }
        if (!res.ok) { setState('error'); return }
        const data = await res.json()
        if (data.status === 'CLOSED' || data.session?.status === 'CLOSED') {
          setState('closed')
          setSession(data.session ?? data)
          return
        }
        setSession(data.session ?? data)
        setState('form')
      } catch {
        setState('error')
      }
    }
    verify()
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = matric.trim()
    if (!trimmed) { setInlineError('Please enter your matric number'); return }
    setSubmitting(true); setInlineError('')
    try {
      const res = await fetch(`https://api.ipeexecs.page/api/attendance/code/${code}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricNumber: trimmed.toUpperCase() }),
      })
      const data = await res.json()

      if (res.status === 409 || data.alreadyMarked) {
        setInlineError('already_marked')
        return
      }
      if (res.status === 404 || data.notFound) {
        setInlineError('not_found')
        return
      }
      if (res.status === 400 && data.message?.toLowerCase().includes('closed')) {
        setState('closed')
        return
      }
      if (!res.ok) {
        setInlineError(data.message || 'Something went wrong. Please try again.')
        return
      }

      setMemberName(data.name || data.member?.name || trimmed)
      setState('success')
    } catch {
      setInlineError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <div className="min-h-screen bg-[#06100a] flex items-center justify-center p-4"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(13,124,61,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(13,124,61,0.05) 0%, transparent 50%)',
        }}>

        <AnimatePresence mode="wait">

          {/* ── Loading ── */}
          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4">
              <motion.div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
                animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
              <p className="text-white/30 text-sm">Verifying session…</p>
            </motion.div>
          )}

          {/* ── Session Closed ── */}
          {state === 'closed' && (
            <motion.div key="closed"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Session Closed</h2>
                  {session?.title && <p className="text-sm text-white/35 mt-1">{session.title}</p>}
                  <p className="text-sm text-white/30 mt-3">This attendance session is closed. Please contact your executive.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Not Found ── */}
          {state === 'not_found' && (
            <motion.div key="not_found"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Session Not Found</h2>
                  <p className="text-sm text-white/30 mt-3">This QR code is invalid or has expired. Please scan a valid QR code.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Error ── */}
          {state === 'error' && (
            <motion.div key="error"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-4"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white/70" style={{ fontFamily: 'Syne, sans-serif' }}>Something went wrong</h2>
                  <p className="text-sm text-white/30 mt-2">Please check your connection and try again.</p>
                  <button onClick={() => { setState('loading'); setInlineError('') }}
                    className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-sm transition-colors underline">
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Sign-in Form ── */}
          {state === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

                <div className="p-8 space-y-6">
                  {/* Icon header */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase">IESA</p>
                      <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                        Attendance Sign-In
                      </h1>
                    </div>
                  </div>

                  {/* Session title */}
                  {session?.title && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15 text-center">
                      <p className="text-[11px] text-emerald-400/55 font-bold tracking-[0.12em] uppercase mb-0.5">Signing in for</p>
                      <p className="text-sm font-bold text-white/80">{session.title}</p>
                      {session.description && (
                        <p className="text-xs text-white/30 mt-0.5">{session.description}</p>
                      )}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-2">
                        Matric Number
                      </label>
                      <input
                        type="text"
                        value={matric}
                        onChange={e => { setMatric(e.target.value); setInlineError('') }}
                        placeholder="e.g. CSC/2021/001"
                        autoComplete="off"
                        autoCapitalize="characters"
                        className="w-full px-4 py-4 rounded-xl bg-white/[0.06] border border-white/[0.10]
                          text-white text-lg font-mono text-center placeholder:text-white/20
                          outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all"
                      />
                    </div>

                    {/* Inline errors */}
                    <AnimatePresence>
                      {inlineError === 'already_marked' && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-amber-300 text-sm font-medium">You're already marked present for this session!</p>
                        </motion.div>
                      )}
                      {inlineError === 'not_found' && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-300 text-sm font-medium">Matric number not found. Please check and try again.</p>
                        </motion.div>
                      )}
                      {inlineError && inlineError !== 'already_marked' && inlineError !== 'not_found' && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-300 text-sm font-medium">{inlineError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button type="submit" disabled={submitting || !matric.trim()}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-black text-base
                        disabled:opacity-40 transition-all shadow-[0_8px_24px_rgba(13,124,61,0.4)]">
                      {submitting ? 'Marking attendance…' : 'Mark My Attendance'}
                    </motion.button>
                  </form>

                  <p className="text-center text-[11px] text-white/18">
                    IESA — Department of Computer Science
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {state === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                <div className="p-8 text-center space-y-5">
                  {/* Big green checkmark */}
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center mx-auto
                      shadow-[0_12px_32px_rgba(13,124,61,0.5)]">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.2em] uppercase mb-1">Present!</p>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                      You're Marked Present! ✅
                    </h2>
                    {memberName && (
                      <p className="text-lg font-bold text-emerald-400/80 mt-2">{memberName}</p>
                    )}
                    {session?.title && (
                      <p className="text-sm text-white/35 mt-2">
                        Attendance recorded for <span className="text-white/55 font-medium">{session.title}</span>
                      </p>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="px-4 py-3 rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                    <p className="text-xs text-emerald-400/55">You may now close this page.</p>
                  </motion.div>

                  <p className="text-[11px] text-white/18">IESA — Department of Computer Science</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
