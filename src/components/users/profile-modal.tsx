// src/components/users/profile-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Building, Briefcase, Save, CheckCircle, Shield, User } from 'lucide-react'
import { userService, type User as UserType } from '@/services/user'
import { authService } from '@/services/auth'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
  onUpdate: () => void
}

const AVATAR_COLORS = ['#3b82f6','#10b981','#a78bfa','#f472b6','#f59e0b','#34d399','#60a5fa']
const getColor = (name: string) => AVATAR_COLORS[(name || '').charCodeAt(0) % AVATAR_COLORS.length]

const inputCls = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/18 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/32 mb-1.5">{children}</p>
}

function FieldIcon({ icon: Icon, children, disabled }: { icon: any; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
      <div className={disabled ? 'opacity-50' : ''}>{children}</div>
    </div>
  )
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [formData, setFormData] = useState<{
    name: string; email: string; position: string; department: string
    bio: string; phone: string; matricNumber: string; role: 'ADMIN' | 'EXEC' | ''
  }>({ name: '', email: '', position: '', department: '', bio: '', phone: '', matricNumber: '', role: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const currentUser = authService.getCurrentUser()
  const isOwnProfile = currentUser?.id === user?.id

  useEffect(() => {
    if (user && isOpen) {
      setFormData({ name: user.name || '', email: user.email || '', position: user.position || '', department: user.department || '', bio: user.bio || '', phone: user.phone || '', matricNumber: user.matricNumber || '', role: user.role || 'EXEC' })
      setError(''); setSaved(false)
    }
  }, [user, isOpen])

  const set = (key: string, val: string) => setFormData(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true); setError('')
    try {
      if (isOwnProfile) {
        const { role: _role, ...profileData } = formData
        await userService.updateProfile(profileData)
        const updated = { ...currentUser, ...profileData }
        if (typeof window !== 'undefined') localStorage.setItem('dept_exec_user', JSON.stringify(updated))
      } else if (currentUser?.role === 'ADMIN') {
        await userService.updateUser(user.id, {
          ...formData,
          role: (formData.role as 'ADMIN' | 'EXEC') || undefined,
        })
      }
      setSaved(true)
      setTimeout(() => { onUpdate(); onClose() }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const color = user ? getColor(user.name) : '#10b981'
  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.82)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>

            {/* Shimmer */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-4">
                {/* Avatar ring */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base"
                    style={{ background: color + '22', border: `2px solid ${color}45`, color, boxShadow: `0 4px 18px ${color}28` }}>
                    {initials}
                  </div>
                  {/* Active ring pulse */}
                  {user.isActive !== false && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex w-3 h-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#07150f]" />
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {isOwnProfile ? 'Edit Your Profile' : `Edit ${user.name}'s Profile`}
                  </h2>
                  <p className="text-[11px] text-white/30">Update profile information</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Grid: name + email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                    <input type="text" value={formData.name} onChange={e => set('name', e.target.value)}
                      className={`${inputCls} pl-10`} required />
                  </div>
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                    <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                      className={`${inputCls} pl-10 ${!isOwnProfile ? 'opacity-45 cursor-not-allowed' : ''}`}
                      required disabled={!isOwnProfile} />
                  </div>
                  {!isOwnProfile && <p className="text-[10px] text-white/20 mt-1">Only the user can change their own email</p>}
                </div>
                <div>
                  <Label>Position</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                    <input type="text" value={formData.position} onChange={e => set('position', e.target.value)}
                      className={`${inputCls} pl-10`} />
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/40" />
                    <input type="text" value={formData.department} onChange={e => set('department', e.target.value)}
                      className={`${inputCls} pl-10`} />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label>Bio</Label>
                <textarea value={formData.bio} onChange={e => set('bio', e.target.value)}
                  rows={3} maxLength={500}
                  placeholder="Tell us about your role in the department…"
                  className={`${inputCls} resize-none`} />
                <p className="text-[10px] text-white/20 mt-1 text-right">{formData.bio.length}/500</p>
              </div>

              {/* Phone */}
              <div>
                <Label>Phone Number</Label>
                <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+234 800 000 0000" className={inputCls} />
              </div>

              {/* Matric Number (admin editing another user) */}
              {currentUser?.role === 'ADMIN' && !isOwnProfile && (
                <div>
                  <Label>Matric Number</Label>
                  <input type="text" value={formData.matricNumber} onChange={e => set('matricNumber', e.target.value)}
                    placeholder="e.g. IPE/2021/001" className={inputCls} />
                  <p className="text-[10px] text-white/20 mt-1">Set to block this executive from voting</p>
                </div>
              )}

              {/* Admin role toggle */}
              {currentUser?.role === 'ADMIN' && !isOwnProfile && (
                <div>
                  <Label>User Role</Label>
                  <div className="flex gap-2">
                    {[
                      { r: 'ADMIN', Icon: Shield, label: 'Administrator', color: '#8b5cf6' },
                      { r: 'EXEC',  Icon: Briefcase, label: 'Executive',    color: '#3b82f6' },
                    ].map(({ r, Icon, label, color: c }) => (
                      <button key={r} type="button"
                        onClick={() => set('role', r)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all
                          ${formData.role === r
                            ? 'border-[1.5px] text-white'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/35 hover:text-white/60 hover:bg-white/[0.06]'}`}
                        style={formData.role === r ? { borderColor: c, background: c + '15', color: 'white', boxShadow: `0 4px 14px ${c}22` } : {}}>
                        <Icon className="w-3.5 h-3.5" style={{ color: formData.role === r ? c : undefined }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex gap-3 pt-4 border-t border-white/[0.05]">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold
                    hover:text-white/70 hover:border-white/18 transition-colors" disabled={loading}>
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
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
                      {saved ? (
                        <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />Saved!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Saving…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Save className="w-4 h-4" />Save Changes
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