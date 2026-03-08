// src/app/reset-password/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { authService } from '@/services/auth'

/* ─── Password strength ───────────────────────────── */
function getStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: '', width: 'w-0' }
  if (pw.length < 6) return { label: 'Too short', color: 'bg-rose-500', width: 'w-1/4' }
  const hasUpper = /[A-Z]/.test(pw)
  const hasNum = /[0-9]/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  const score = [hasUpper, hasNum, hasSpecial].filter(Boolean).length
  if (score === 0) return { label: 'Weak', color: 'bg-orange-500', width: 'w-2/4' }
  if (score === 1) return { label: 'Medium', color: 'bg-amber-400', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' }
}

/* ─── Inner component that uses useSearchParams ───── */
function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [token, setToken] = useState('')
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const t = searchParams.get('token')
    if (!t) { setTokenValid(false); return }
    setToken(t)
    authService.verifyResetToken(t)
      .then(res => {
        setTokenValid(res.valid)
        if (res.name) setUserName(res.name)
      })
      .catch(() => setTokenValid(false))
  }, [searchParams])

  useEffect(() => {
    if (!success) return
    setCountdown(3)
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(id); router.push('/login'); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [success, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strength = getStrength(password)

  return (
    <div className="w-full max-w-sm relative z-10">
      <div className="rounded-2xl border border-white/[0.06] p-8"
        style={{
          background: 'linear-gradient(145deg, #06100a 0%, #08150d 100%)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(13,124,61,0.08)',
        }}>

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

          {/* ── Verifying token ── */}
          {tokenValid === null && (
            <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-6">
              <motion.div className="w-8 h-8 border-2 border-[#0d7c3d]/30 border-t-[#0d7c3d] rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
              <p className="text-white/30 text-sm">Verifying reset link…</p>
            </motion.div>
          )}

          {/* ── Invalid token ── */}
          {tokenValid === false && (
            <motion.div key="invalid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-400/10 border border-rose-400/20
                flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Link Expired
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                  shadow-[0_6px_20px_rgba(13,124,61,0.35)] hover:shadow-[0_8px_28px_rgba(13,124,61,0.45)] transition-shadow">
                Request New Link
              </Link>
            </motion.div>
          )}

          {/* ── Success ── */}
          {success && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20
                flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                Password Reset!
              </h2>
              <p className="text-white/40 text-sm mb-1">Your password has been updated successfully.</p>
              <p className="text-emerald-400/60 text-xs mb-6">
                Redirecting to login in {countdown}…
              </p>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                  shadow-[0_6px_20px_rgba(13,124,61,0.35)]">
                Go to Login
              </Link>
            </motion.div>
          )}

          {/* ── Reset form ── */}
          {tokenValid === true && !success && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-7">
                <h2 className="text-xl font-black text-white leading-tight mb-1.5"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  {userName ? `Hi ${userName.split(' ')[0]},` : 'Set New Password'}
                </h2>
                {userName && (
                  <p className="text-white/50 text-sm">Set your new password below</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm placeholder:text-white/18
                        bg-white/[0.05] border border-white/[0.08] outline-none
                        focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className={`h-full rounded-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: strength.width.replace('w-', '').includes('/')
                            ? `${eval(strength.width.replace('w-', '').replace('full','1')) * 100}%`
                            : strength.width === 'w-full' ? '100%'
                            : strength.width === 'w-3/4' ? '75%'
                            : strength.width === 'w-2/4' ? '50%'
                            : '25%'
                          }}
                          transition={{ duration: 0.3 }} />
                      </div>
                      <p className={`text-[10px] mt-1 font-semibold ${
                        strength.color.includes('rose') ? 'text-rose-400' :
                        strength.color.includes('orange') ? 'text-orange-400' :
                        strength.color.includes('amber') ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm placeholder:text-white/18
                        bg-white/[0.05] border border-white/[0.08] outline-none
                        focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-400 mt-1 font-semibold">Passwords do not match</p>
                  )}
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
                <motion.button type="submit" disabled={loading}
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
                        Resetting…
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Reset Password
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/[0.05] flex justify-center">
                <Link href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/55 transition-colors font-semibold">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <p className="text-center text-white/15 text-[11px] mt-5">
        University of Ibadan · Industrial & Production Engineering
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function ResetPasswordPage() {
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

        <Suspense fallback={
          <div className="flex items-center justify-center">
            <motion.div className="w-8 h-8 border-2 border-[#0d7c3d]/30 border-t-[#0d7c3d] rounded-full"
              animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
          </div>
        }>
          <ResetPasswordInner />
        </Suspense>
      </div>
    </>
  )
}
