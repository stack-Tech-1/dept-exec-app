// src/components/users/invite-modal.tsx
'use client'

import { EXECUTIVE_POSITIONS, type ExecutivePosition } from '@/utils/positions'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Shield, Send, Briefcase, CheckCircle, ChevronDown } from 'lucide-react'
import API from '@/services/api'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const inputCls = `w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/20 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

export default function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EXEC'>('EXEC')
  const [position, setPosition] = useState<ExecutivePosition>('Executive Member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError(''); setSuccess('')
    try {
      await API.post('/auth/invite', { email, role, position })
      setSuccess(`Invitation sent to ${email}`)
      setEmail('')
      setTimeout(() => { onSuccess(); setSuccess('') }, 1800)
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const ROLES = [
    {
      value: 'EXEC', Icon: Briefcase, label: 'Executive',
      sub: 'View & contribute access',
      activeAccent: '#0d7c3d',
      activeCls: 'border-[#0d7c3d] shadow-[0_0_28px_rgba(13,124,61,0.28)]',
      iconBg: 'bg-[#0d7c3d]/20', iconColor: 'text-emerald-400',
    },
    {
      value: 'ADMIN', Icon: Shield, label: 'Administrator',
      sub: 'Full system access',
      activeAccent: '#8b5cf6',
      activeCls: 'border-violet-500 shadow-[0_0_28px_rgba(139,92,246,0.28)]',
      iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.82)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Shimmer */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0d7c3d]/18 border border-[#0d7c3d]/25 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Invite New Member</h3>
                  <p className="text-[11px] text-white/30">Send a registration link via email</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

              {/* Email */}
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">Email Address *</p>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="executive@university.edu"
                    className={`${inputCls} pl-10`} required />
                </div>
                <p className="text-[10px] text-white/22 mt-1.5">They'll receive a link to complete registration</p>
              </div>

              {/* Role selector cards */}
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-2">Role *</p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <motion.button key={r.value} type="button"
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
                      onClick={() => setRole(r.value as any)}
                      className={`relative overflow-hidden flex flex-col items-center gap-2.5 py-4 px-3 rounded-2xl border-[1.5px] transition-all duration-250
                        ${role === r.value ? `${r.activeCls} bg-white/[0.04]` : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                      {role === r.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: r.activeAccent }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </motion.div>
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === r.value ? r.iconBg : 'bg-white/[0.05]'} transition-colors`}>
                        <r.Icon className={`w-5 h-5 ${role === r.value ? r.iconColor : 'text-white/25'} transition-colors`} />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-bold transition-colors ${role === r.value ? 'text-white' : 'text-white/40'}`}>{r.label}</p>
                        <p className="text-[10px] text-white/25 mt-0.5 leading-snug">{r.sub}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Role desc */}
                <motion.div key={role} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[11px] text-white/40">
                    {role === 'EXEC'
                      ? 'Can view, create, and update department content'
                      : 'Full access to all features including user management'}
                  </p>
                </motion.div>
              </div>

              {/* Position */}
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35 mb-1.5">Position *</p>
                <div className="relative">
                  <select value={position} onChange={e => setPosition(e.target.value as ExecutivePosition)}
                    className={`${inputCls} appearance-none cursor-pointer pr-8`} required>
                    {EXECUTIVE_POSITIONS.map(pos => (
                      <option key={pos} value={pos} className="bg-[#07150f]">{pos}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/22 pointer-events-none" />
                </div>
              </div>

              {/* Info box */}
              <div className="px-4 py-3 rounded-xl bg-[#0d7c3d]/08 border border-[#0d7c3d]/18">
                <p className="text-[11px] font-bold text-emerald-400/70 mb-1.5">How it works</p>
                <div className="space-y-0.5 text-[11px] text-white/30">
                  <p>· User receives email with registration link</p>
                  <p>· Link expires in 24 hours</p>
                  <p>· Account is created with selected role</p>
                </div>
              </div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />{success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold
                    hover:text-white/70 hover:border-white/18 transition-colors">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading || !email}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 relative overflow-hidden py-3 rounded-2xl
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                    shadow-[0_8px_24px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-[0_12px_32px_rgba(13,124,61,0.45)] transition-shadow">
                  {!loading && (
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                      animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {success ? (
                        <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />Sent!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Sending…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Send className="w-4 h-4" />Send Invitation
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}