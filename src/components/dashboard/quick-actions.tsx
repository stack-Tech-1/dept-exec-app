// src/components/dashboard/quick-actions.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Users, Bell, Calendar, Settings, Download, Upload, Zap, CheckCircle } from 'lucide-react'
import Link from 'next/link'

/* ─── Action definitions ──────────────────────────── */
const ACTIONS = [
  { icon: Plus,     label: 'Create Task',      sub: 'Assign to member',   href: '/dashboard/tasks/create',     accent: '#3b82f6', bg: '#060d18' },
  { icon: FileText, label: 'Add Minutes',       sub: 'Upload records',     href: '/dashboard/minutes/create',   accent: '#10b981', bg: '#061510' },
  { icon: Users,    label: 'Add Member',        sub: 'Invite executive',   href: '/dashboard/users/invite',     accent: '#a78bfa', bg: '#0d0818' },
  { icon: Calendar, label: 'Schedule Meeting',  sub: 'New meeting',        href: '/dashboard/meetings/create',  accent: '#f43f5e', bg: '#180608' },
  { icon: Bell,     label: 'Send Alert',        sub: 'Notify all members', href: '/dashboard/notifications',    accent: '#f59e0b', bg: '#180e04' },
  { icon: Settings, label: 'Settings',          sub: 'Configuration',      href: '/dashboard/settings',         accent: '#6b7280', bg: '#0e0e0e' },
]

/* ─── Ripple effect state ────────────────────────── */
interface Ripple { id: number; x: number; y: number }

/* ─── Single action button ───────────────────────── */
function ActionButton({ action, index }: { action: typeof ACTIONS[0]; index: number }) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [pressed, setPressed] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setPressed(true)
    setTimeout(() => { setRipples(r => r.filter(rp => rp.id !== id)); setPressed(false) }, 600)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
    >
      <Link href={action.href}>
        <motion.div
          onClick={handleClick}
          whileHover={{ y: -2, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.96 }}
          className="relative overflow-hidden rounded-2xl p-3.5 cursor-pointer border border-white/[0.05] transition-colors duration-200"
          style={{ background: action.bg }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${action.accent}30` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)' }}
        >
          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 120%, ${action.accent}18, transparent 70%)` }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />

          {/* Ripples */}
          <AnimatePresence>
            {ripples.map(r => (
              <motion.div key={r.id}
                className="absolute rounded-full pointer-events-none"
                style={{ left: r.x - 40, top: r.y - 40, width: 80, height: 80, background: `${action.accent}25` }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              />
            ))}
          </AnimatePresence>

          {/* Icon */}
          <div className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
            style={{ background: `${action.accent}18` }}>
            <action.icon style={{ width: 16, height: 16, color: action.accent }} />
          </div>

          {/* Text */}
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/85 leading-none mb-0.5">{action.label}</p>
            <p className="text-[10px] text-white/30 hidden sm:block">{action.sub}</p>
          </div>

          {/* Bottom accent bar on hover */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] rounded-full"
            style={{ background: action.accent }}
            initial={{ width: 0 }}
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function QuickActions() {
  const [exportDone, setExportDone] = useState(false)

  const handleExport = () => {
    setExportDone(true)
    setTimeout(() => setExportDone(false), 2000)
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div className="rounded-2xl bg-[#060e09] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0d7c3d]/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Quick Actions
              </h3>
              <p className="text-[11px] text-white/35">Frequent actions</p>
            </div>
          </div>

          {/* System status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-bold text-emerald-400">Online</span>
          </div>
        </div>

        {/* 2×3 action grid */}
        <div className="p-4 grid grid-cols-2 gap-2.5">
          {ACTIONS.map((action, i) => (
            <ActionButton key={action.label} action={action} index={i} />
          ))}
        </div>

        {/* Export / Upload row */}
        <div className="px-4 pb-4 flex gap-2.5">
          <motion.button
            onClick={handleExport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15
              text-[11px] font-bold transition-colors relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {exportDone ? (
                <motion.span key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Exported!
                </motion.span>
              ) : (
                <motion.span key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export Report
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <Link href="/dashboard/minutes/create" className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(13,124,61,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                text-white text-[11px] font-bold transition-shadow cursor-pointer
                relative overflow-hidden"
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
              />
              <Upload className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Upload Minutes</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  )
}