'use client'

import { use, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Hash, GraduationCap, Users,
  CheckCircle2, AlertTriangle, Loader2, ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

const API_BASE = 'https://api.ipeexecs.page/api'

type PageState = 'loading' | 'invalid' | 'form' | 'success'

interface LinkInfo {
  label: string
  status: 'active' | 'expired'
  expiresAt?: string
}

/* ═══════════════════════════════════════════════════
   CIRCUIT CANVAS — same as login page
═══════════════════════════════════════════════════ */
function CircuitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: 2 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 150) * 0.15})`
            ctx.lineWidth = 0.7
            ctx.setLineDash([4, 7])
            ctx.lineDashOffset = -t * 18
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }
      nodes.forEach(n => {
        const pulse = Math.sin(t * 2 + n.phase) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + pulse * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.28 + pulse * 0.4})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + 5 + pulse * 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(134,239,172,${0.1 + pulse * 0.14})`
        ctx.lineWidth = 1
        ctx.stroke()
      })
      const scanY = ((t * 35) % (canvas.height + 60)) - 30
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      grad.addColorStop(0, 'rgba(134,239,172,0)')
      grad.addColorStop(0.5, 'rgba(134,239,172,0.05)')
      grad.addColorStop(1, 'rgba(134,239,172,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 20, canvas.width, 40)
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

/* ═══════════════════════════════════════════════════
   FIELD COMPONENT
═══════════════════════════════════════════════════ */
function Field({
  label, required, icon: Icon, children,
}: {
  label: string
  required?: boolean
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-bold tracking-[0.14em] uppercase text-white/40">
        <span>{label}</span>
        {required && <span className="text-emerald-400">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
        {children}
      </div>
    </div>
  )
}

const inputCls =
  'w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm placeholder:text-white/20 ' +
  'focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200'

const selectCls =
  'w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm ' +
  'focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200 ' +
  '[color-scheme:dark] appearance-none'

/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════ */
export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null)
  const [invalidMsg, setInvalidMsg] = useState('')

  // Form fields
  const [fullName, setName] = useState('')
  const [email, setEmail] = useState('')
  const [matricNumber, setMatricNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [level, setLevel] = useState('')
  const [gender, setGender] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Validate link on mount
  useEffect(() => {
    fetch(`${API_BASE}/members/links/${token}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Link not found.')
        return data
      })
      .then((data: LinkInfo) => {
        // API may not return a status field — infer from expiresAt
        const expired = data.expiresAt ? new Date(data.expiresAt) < new Date() : false
        if (data.status === 'expired' || expired) {
          setInvalidMsg('This registration link has expired.')
          setPageState('invalid')
        } else {
          setLinkInfo(data)
          setPageState('form')
        }
      })
      .catch((err: Error) => {
        setInvalidMsg(err.message || 'This registration link is invalid or has expired.')
        setPageState('invalid')
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/members/register/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, matricNumber, phone, level, gender }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed. Please try again.')
      setPageState('success')
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Shell ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        body { font-family: 'DM Sans', sans-serif; margin: 0; }
        .font-display { font-family: 'Syne', sans-serif !important; }
      `}</style>

      <div className="relative min-h-screen bg-[#051208] overflow-hidden flex flex-col items-center justify-center px-4 py-12">
        {/* Background canvas */}
        <CircuitCanvas />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(13,124,61,0.22) 0%, transparent 70%)' }} />

        {/* ── LOADING ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-white/40 text-sm font-medium">Verifying registration link…</p>
            </motion.div>
          )}

          {/* ── INVALID ───────────────────────────── */}
          {pageState === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="relative z-10 w-full max-w-sm text-center"
            >
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-md p-10">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-7 h-7 text-rose-400" />
                </div>
                <h2 className="font-display text-white text-xl font-bold mb-2">Link Expired</h2>
                <p className="text-white/45 text-sm leading-relaxed">{invalidMsg}</p>
                <p className="text-white/25 text-xs mt-4">
                  Contact the department executives for a new registration link.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ───────────────────────────── */}
          {pageState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="relative z-10 w-full max-w-sm text-center"
            >
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] backdrop-blur-md p-10">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30
                    flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </motion.div>
                <h2 className="font-display text-white text-2xl font-bold mb-3 leading-tight">
                  Registration<br />Successful!
                </h2>
                <p className="text-white/55 text-sm leading-relaxed">
                  Welcome to the IPE Department.<br />
                  Your registration has been recorded.
                </p>
                <div className="mt-8 h-px bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
                <p className="text-white/20 text-[11px] tracking-[0.18em] uppercase mt-5">
                  Industrial &amp; Production Engineering
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FORM ──────────────────────────────── */}
          {pageState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                  className="inline-flex items-center gap-2.5 mb-5"
                >
                  <Image
                    src="/icon.png" alt="IESA" width={44} height={44}
                    className="rounded-[14px] shadow-[0_8px_24px_rgba(13,124,61,0.45)]"
                  />
                  <span className="font-display text-white font-bold text-lg tracking-tight">IESA Portal</span>
                </motion.div>
                <p className="text-emerald-400/70 text-[10px] font-black tracking-[0.28em] uppercase mb-2">
                  Member Registration
                </p>
                {linkInfo?.label && (
                  <h1 className="font-display text-white text-2xl font-bold leading-tight">
                    {linkInfo.label}
                  </h1>
                )}
                <p className="text-white/35 text-sm mt-1.5">
                  Fill in your details to register as a department member.
                </p>
              </div>

              {/* Card */}
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-md p-7 sm:p-9">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Two-column grid on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Field label="Full Name" required icon={User}>
                        <input
                          type="text"
                          value={fullName}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Adewale Okafor"
                          className={inputCls}
                          required
                        />
                      </Field>
                    </div>

                    <Field label="Email Address" required icon={Mail}>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputCls}
                        required
                      />
                    </Field>

                    <Field label="Phone Number" required icon={Phone}>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="08012345678"
                        className={inputCls}
                        required
                      />
                    </Field>

                    <Field label="Matric Number" required icon={Hash}>
                      <input
                        type="text"
                        value={matricNumber}
                        onChange={e => setMatricNumber(e.target.value)}
                        placeholder="e.g. 200404/IPE/001"
                        className={inputCls}
                        required
                      />
                    </Field>

                    <Field label="Level / Year of Study" required icon={GraduationCap}>
                      <select
                        value={level}
                        onChange={e => setLevel(e.target.value)}
                        className={selectCls}
                        required
                      >
                        <option value="" disabled>Select level</option>
                        <option value="100">100 Level</option>
                        <option value="200">200 Level</option>
                        <option value="300">300 Level</option>
                        <option value="400">400 Level</option>
                        <option value="500">500 Level</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Gender" required icon={Users}>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          className={selectCls}
                          required
                        >
                          <option value="" disabled>Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          {/*<option value="Prefer not to say">Prefer not to say</option>*/}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-300">{submitError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.015 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    className="relative w-full overflow-hidden rounded-2xl py-3.5 font-bold text-white text-sm tracking-wide
                      bg-gradient-to-r from-[#0d7c3d] via-[#0e8f47] to-[#0a5a2d]
                      shadow-[0_8px_28px_rgba(13,124,61,0.32)]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(13,124,61,0.42)]"
                  >
                    {!submitting && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.8 }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-2.5">
                      {submitting ? (
                        <>
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          />
                          Submitting…
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </div>

              {/* Footer */}
              <p className="text-center text-[11px] text-white/20 tracking-[0.2em] uppercase mt-6">
                University of Ibadan · Industrial &amp; Production Engineering
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
