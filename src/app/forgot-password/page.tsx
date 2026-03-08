// src/app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { authService } from '@/services/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#040e07] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute"
            style={{
              width: 600, height: 600, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(13,124,61,0.08) 0%, transparent 70%)',
              left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            }} />
          <div className="absolute inset-0 opacity-[0.018]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(13,124,61,1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Card */}
          <div className="rounded-2xl border border-white/[0.06] p-8"
            style={{
              background: 'linear-gradient(145deg, #06100a 0%, #08150d 100%)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(13,124,61,0.08)',
            }}>

            {/* Top accent */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-8" />

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.07, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-14 h-14 rounded-2xl overflow-hidden border border-white/[0.1]"
                style={{ boxShadow: '0 6px 20px rgba(13,124,61,0.4)' }}>
                <Image src="/icon.png" alt="IESA Logo" width={56} height={56} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                /* ── Success state ── */
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20
                    flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Check your email!
                  </h2>
                  <p className="text-white/45 text-sm leading-relaxed mb-1">
                    A reset link has been sent to
                  </p>
                  <p className="text-emerald-400 text-sm font-semibold mb-2">{email}</p>
                  <p className="text-white/30 text-xs mb-6">The link expires in 1 hour.</p>
                  <Link href="/login"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                      bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                      shadow-[0_6px_20px_rgba(13,124,61,0.35)] hover:shadow-[0_8px_28px_rgba(13,124,61,0.45)] transition-shadow">
                    Back to Login
                  </Link>
                </motion.div>
              ) : (
                /* ── Form state ── */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="text-center mb-7">
                    <h2 className="text-2xl font-black text-white leading-tight mb-2"
                      style={{ fontFamily: 'Syne, sans-serif' }}>
                      Forgot Password
                    </h2>
                    <p className="text-white/35 text-sm leading-relaxed">
                      Enter your registered email and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email input */}
                    <div>
                      <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="executive@university.edu"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder:text-white/18
                            bg-white/[0.05] border border-white/[0.08] outline-none
                            focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <p className="text-rose-400 text-xs">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button type="submit" disabled={loading || !email.trim()}
                      whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                      className="relative overflow-hidden w-full py-3 rounded-2xl
                        bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                        shadow-[0_6px_20px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                        transition-shadow hover:shadow-[0_8px_28px_rgba(13,124,61,0.45)]">
                      {!loading && (
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                          animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reset Link
                          </>
                        )}
                      </span>
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom link */}
            {!sent && (
              <div className="mt-6 pt-5 border-t border-white/[0.05] flex justify-center">
                <Link href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/55 transition-colors font-semibold">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            )}
          </div>

          <p className="text-center text-white/15 text-[11px] mt-5">
            University of Ibadan · Industrial & Production Engineering
          </p>
        </motion.div>
      </div>
    </>
  )
}
