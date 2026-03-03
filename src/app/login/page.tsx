// app/login/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, Settings, BarChart2, Cpu, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════
   ANIMATED CIRCUIT / NODE CANVAS
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

    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: 2 + Math.random() * 2.5,
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
          if (dist < 165) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 165) * 0.22})`
            ctx.lineWidth = 0.8
            ctx.setLineDash([4, 7])
            ctx.lineDashOffset = -t * 20
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
        ctx.arc(n.x, n.y, n.r + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.35 + pulse * 0.5})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r + 6 + pulse * 5, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(134,239,172,${0.12 + pulse * 0.18})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Scanning beam
      const scanY = ((t * 38) % (canvas.height + 60)) - 30
      const grad = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 22)
      grad.addColorStop(0, 'rgba(134,239,172,0)')
      grad.addColorStop(0.5, 'rgba(134,239,172,0.065)')
      grad.addColorStop(1, 'rgba(134,239,172,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 22, canvas.width, 44)

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

/* ═══════════════════════════════════════════════════
   ROTATING GEAR SVG
═══════════════════════════════════════════════════ */
function RotatingGear({ size = 120, speed = 20, reverse = false, style = {} }: {
  size?: number; speed?: number; reverse?: boolean; style?: React.CSSProperties
}) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100"
      className="absolute pointer-events-none"
      style={style}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      <path fill="white" d="M43.3,8.3l-1.8,6.8c-2.1,0.5-4.1,1.3-5.9,2.4l-6.3-3.4L23,20.3l3.4,6.3
        c-1.1,1.8-1.9,3.8-2.4,5.9l-6.8,1.8v8.8l6.8,1.8c0.5,2.1,1.3,4.1,2.4,5.9L23,57.1l6.3,6.3l6.3-3.4
        c1.8,1.1,3.8,1.9,5.9,2.4l1.8,6.8h8.8l1.8-6.8c2.1-0.5,4.1-1.3,5.9-2.4l6.3,3.4l6.3-6.3l-3.4-6.3
        c1.1-1.8,1.9-3.8,2.4-5.9l6.8-1.8v-8.8l-6.8-1.8c-0.5-2.1-1.3-4.1-2.4-5.9l3.4-6.3l-6.3-6.3l-6.3,3.4
        c-1.8-1.1-3.8-1.9-5.9-2.4l-1.8-6.8H43.3z
        M50,35c8.3,0,15,6.7,15,15s-6.7,15-15,15s-15-6.7-15-15S41.7,35,50,35z" />
    </motion.svg>
  )
}

/* ═══════════════════════════════════════════════════
   FLOATING STAT CARD
═══════════════════════════════════════════════════ */
const stats = [
  { icon: BarChart2, label: 'Reports Active', value: '24',  color: 'from-emerald-500/20 to-emerald-800/5' },
  { icon: Cpu,       label: 'Processes',       value: '142', color: 'from-green-400/20 to-green-800/5' },
  { icon: Zap,       label: 'System Load',     value: '87%', color: 'from-lime-400/20 to-lime-800/5' },
]

function StatCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${color}
        border border-white/8 backdrop-blur-sm px-4 py-3`}
    >
      <div className="rounded-xl bg-white/10 p-2 shrink-0">
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <div>
        <p className="text-[10px] text-emerald-300/60 font-bold tracking-[0.18em] uppercase">{label}</p>
        <p className="text-xl font-black text-white leading-none font-display">{value}</p>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   LOGIN FORM INNER
═══════════════════════════════════════════════════ */
function LoginFormInner() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await authService.login({ email, password })
      document.cookie = `dept_exec_token=${result.token}; path=/; max-age=86400; SameSite=Strict`
      document.cookie = `dept_exec_user=${JSON.stringify(result.user)}; path=/; max-age=86400; SameSite=Strict`
      localStorage.setItem('dept_exec_token', result.token)
      localStorage.setItem('dept_exec_user', JSON.stringify(result.user))
      if (rememberMe) localStorage.setItem('dept_exec_remember', 'true')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (name: string) => `
    w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-800 text-sm font-medium
    border-2 transition-all duration-250 outline-none bg-white placeholder:text-gray-300
    ${focused === name
      ? 'border-[#0d7c3d] shadow-[0_0_0_4px_rgba(13,124,61,0.09)]'
      : 'border-gray-100 hover:border-gray-200'}
  `

  const inputWrapperClass = (name: string) =>
    cn(
      "relative",
      focused === name &&
        "after:content-[''] after:absolute after:inset-0 after:rounded-2xl after:shadow-[0_0_0_4px_rgba(13,124,61,0.09)]"
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <Label 
          htmlFor="email"
          className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400"
        >
          Department Email
        </Label>
        <div className={inputWrapperClass('email')}>
          <Mail 
            className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 z-10",
              focused === 'email' ? "text-[#0d7c3d]" : "text-gray-300"
            )} 
          />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            placeholder="executive@university.edu"
            className={cn(
              "pl-11 pr-4 py-3.5 rounded-2xl text-gray-800 text-sm font-medium",
              "border-2 transition-all duration-250 bg-white placeholder:text-gray-300",
              focused === 'email'
                ? "border-[#0d7c3d] shadow-none"  // we moved shadow to wrapper
                : "border-gray-100 hover:border-gray-200"
            )}
            required
          />
        </div>
      </div>

      {/* Password – similar pattern */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="password"
            className="text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400"
          >
            Password
          </Label>
          <button 
            type="button"
            onClick={() => alert('Please contact department admin for password reset')}
            className="text-xs text-[#0d7c3d] hover:text-[#0a5a2d] font-semibold transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className={inputWrapperClass('password')}>
          <Lock 
            className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 z-10",
              focused === 'password' ? "text-[#0d7c3d]" : "text-gray-300"
            )} 
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
            placeholder="••••••••"
            className={cn(
              "pl-11 pr-11 py-3.5 rounded-2xl text-gray-800 text-sm font-medium",
              "border-2 transition-all duration-250 bg-white placeholder:text-gray-300",
              focused === 'password'
                ? "border-[#0d7c3d]"
                : "border-gray-100 hover:border-gray-200"
            )}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors z-10"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember me – using shadcn Checkbox */}
      <div className="flex items-center space-x-2">
      <Checkbox 
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked: boolean | 'indeterminate') => 
            setRememberMe(checked === true) 
          }
          className="border-gray-300 data-[state=checked]:bg-[#0d7c3d] data-[state=checked]:border-[#0d7c3d]"
        />
        <Label
          htmlFor="remember"
          className="text-sm font-medium leading-none text-gray-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Remember me
        </Label>
      </div>

      {/* Submit – shadcn Button with your custom shine/gradient */}
      <Button
        type="submit"
        disabled={loading}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white text-sm tracking-wide",
          "bg-gradient-to-r from-[#0d7c3d] via-[#0e8f47] to-[#0a5a2d]",
          "shadow-[0_8px_28px_rgba(13,124,61,0.32)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(13,124,61,0.42)]",
          "h-auto" // override default height
        )}
      >
        {!loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.8 }}
          />
        )}
        <span className="relative flex items-center justify-center gap-2.5">
          {loading ? (
            <>
              <motion.div 
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Authenticating…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Access Executive Portal
            </>
          )}
        </span>
      </Button>
    </form>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT PAGE COMPONENT
═══════════════════════════════════════════════════ */
export default function LoginPage() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 35, damping: 22 })
  const springY = useSpring(mouseY, { stiffness: 35, damping: 22 })

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX / window.innerWidth)
    mouseY.set(e.clientY / window.innerHeight)
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif !important; }
      `}</style>

      {/* ══════════════════════════════════
          DESKTOP  (md and up)
          Split: 52% green | 48% white
      ══════════════════════════════════ */}
      <div
        className="hidden md:flex min-h-screen"
        onMouseMove={handleMouseMove}
      >
        {/* LEFT — Living Green World */}
        <div className="relative w-[52%] bg-[#051208] overflow-hidden flex flex-col justify-between p-12">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d7c3d]/35 via-[#061a0e] to-[#03280f]/60 pointer-events-none" />

          {/* Circuit canvas */}
          <CircuitCanvas />

          {/* Parallax light pool following mouse */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 50% 45% at ${springX.get() * 100}% ${springY.get() * 100}%, rgba(13,124,61,0.28) 0%, transparent 68%)`,
            }}
          />

          {/* Gears */}
          <RotatingGear size={310} speed={38} style={{ right: '-60px', bottom: '-40px', opacity: 0.055 }} />
          <RotatingGear size={190} speed={22} reverse style={{ left: '-30px', bottom: '18%', opacity: 0.07 }} />
          <RotatingGear size={130} speed={17} style={{ right: '20px', top: '60px', opacity: 0.07 }} />
          <RotatingGear size={75}  speed={11} reverse style={{ left: '22%', top: '25%', opacity: 0.09 }} />

          {/* Top logo */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-[#0d7c3d]
                flex items-center justify-center shadow-lg shadow-emerald-950/60">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-white font-bold text-lg tracking-tight">DeptExec</span>
            </motion.div>
          </div>

          {/* Centre hero copy */}
          <div className="relative z-10 flex-1 flex flex-col justify-center my-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.9 }}>
              <p className="text-emerald-400/75 text-[10px] font-bold tracking-[0.3em] uppercase mb-5">
                Industrial & Production Engineering
              </p>
              <h1 className="font-display text-white font-black leading-[1.03] mb-6"
                style={{ fontSize: 'clamp(2.5rem, 3.8vw, 4rem)' }}>
                Executive<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-lime-400">
                  Management
                </span><br />
                Portal
              </h1>
              <p className="text-white/35 text-sm leading-relaxed max-w-[17rem] font-light">
                Centralised oversight, real-time analytics, and department intelligence — unified.
              </p>
            </motion.div>

            {/* Stat cards */}
            <div className="mt-10 space-y-3 max-w-xs">
              {stats.map((s, i) => <StatCard key={s.label} {...s} delay={0.55 + i * 0.14} />)}
            </div>
          </div>

          {/* Bottom */}
          <motion.div className="relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-600/35 to-transparent mb-5" />
            <p className="text-white/20 text-[11px] tracking-[0.22em] uppercase">
              University of Ibadan · {new Date().getFullYear()}
            </p>
          </motion.div>

          {/* Right-edge vignette blending into white panel */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-[#051208]/60 pointer-events-none" />
        </div>

        {/* RIGHT — White Form */}
        <div className="relative flex-1 bg-white flex items-center justify-center overflow-hidden p-10">
          {/* Dot grid background */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #0d7c3d 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

          {/* Soft corner washes */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-emerald-50/80 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-green-50/60 to-transparent rounded-tr-full pointer-events-none" />

          {/* Vertical accent line */}
          <motion.div
            className="absolute left-0 top-[15%] bottom-[15%] w-[3px] bg-gradient-to-b from-transparent via-[#0d7c3d]/30 to-transparent rounded-full"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          />

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut', delay: 0.1 }}
            className="w-full max-w-[21rem] relative z-10"
          >
            {/* Heading block */}
            <div className="mb-10">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, delay: 0.45 }}
                className="h-[3px] w-10 bg-gradient-to-r from-[#0d7c3d] to-emerald-400 rounded-full mb-6 origin-left"
              />
              <h2 className="font-display text-[2.6rem] font-black text-gray-900 leading-[1.05] tracking-tight">
                Welcome<br />back.
              </h2>
              <p className="mt-2.5 text-gray-400 text-sm font-medium">Sign in to your executive account</p>
            </div>

            <LoginFormInner />

            <div className="mt-10 pt-6 border-t border-gray-50/80">
              <p className="text-center text-[11px] text-gray-300 tracking-wide font-medium">
                Secured access · Dept. of Industrial & Production Engineering
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════
          MOBILE  (below md)
          Full-bleed green world +
          bottom-sheet form sliding up
      ══════════════════════════════════ */}
      <div className="flex md:hidden min-h-screen flex-col relative bg-[#051208] overflow-hidden">
        {/* Living background */}
        <div className="absolute inset-0">
          <CircuitCanvas />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d7c3d]/25 via-[#051208]/50 to-[#051208]" />
        </div>

        {/* Decorative gears */}
        <RotatingGear size={220} speed={28} style={{ right: '-40px', top: '8%', opacity: 0.065 }} />
        <RotatingGear size={130} speed={19} reverse style={{ left: '-20px', top: '38%', opacity: 0.075 }} />
        <RotatingGear size={80}  speed={13} style={{ right: '30px', top: '52%', opacity: 0.07 }} />

        {/* Hero top */}
        <div className="relative z-10 flex flex-col items-center justify-center px-7 pt-20 pb-8 text-center">
          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.15 }}
          >
            <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-[22px]
              bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
              flex items-center justify-center
              shadow-[0_16px_48px_rgba(13,124,61,0.55)]
              border border-white/10">
              <Settings className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.65 }}
          >
            <p className="text-emerald-400/70 text-[9px] font-black tracking-[0.3em] uppercase mb-2">
              IPE · Executive Portal
            </p>
            <h1 className="font-display text-white text-[2.6rem] font-black leading-tight">
              Dept<span className="text-emerald-400">Exec</span>
            </h1>
            <p className="text-white/30 text-sm mt-1.5 font-light">
              Department management at your fingertips
            </p>
          </motion.div>

          {/* Horizontal mini stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.6 }}
            className="flex gap-3.5 mt-8"
          >
            {[
              { label: 'Reports', val: '24' },
              { label: 'Processes', val: '142' },
              { label: 'Uptime', val: '99%' },
            ].map(s => (
              <div key={s.label}
                className="flex flex-col items-center px-4 py-2.5 rounded-2xl
                  bg-white/[0.06] border border-white/[0.07] backdrop-blur-sm">
                <span className="font-display text-white text-[1.3rem] font-black leading-none">{s.val}</span>
                <span className="text-emerald-400/65 text-[9px] font-bold tracking-[0.18em] uppercase mt-1">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 75, damping: 20, delay: 0.25 }}
          className="relative z-20 mt-auto bg-white rounded-t-[2.2rem] px-6 pt-7 pb-10
            shadow-[0_-24px_64px_rgba(0,0,0,0.45)]"
        >
          {/* Drag handle */}
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-7" />

          {/* Mobile heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <motion.div
                className="h-[2px] w-7 bg-gradient-to-r from-[#0d7c3d] to-emerald-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              />
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-600">Secure Sign In</p>
            </div>
            <h2 className="font-display text-[1.75rem] font-black text-gray-900 leading-tight">Welcome back</h2>
          </div>

          <LoginFormInner />

          <p className="text-center text-[11px] text-gray-300 mt-6 tracking-wide">
            Dept. of Industrial & Production Engineering
          </p>
        </motion.div>
      </div>
    </>
  )
}