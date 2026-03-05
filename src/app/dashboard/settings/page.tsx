'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Bell, Shield, Save, Eye, EyeOff, CheckCircle, AlertCircle
} from 'lucide-react'
import { userService } from '@/services/user'
import { authService } from '@/services/auth'

/* ─── Types ──────────────────────────────────────── */
type Tab = 'profile' | 'security' | 'notifications'

type Toast = { type: 'success' | 'error'; message: string }

/* ─── Tab button ─────────────────────────────────── */
function TabButton({ label, icon: Icon, active, onClick }: {
  label: string
  icon: React.ElementType
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-200 w-full text-left
        ${active
          ? 'bg-gradient-to-r from-[#0d7c3d] to-[#0e9147] text-white shadow-[0_4px_16px_rgba(13,124,61,0.35)]'
          : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
        }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#5aad7a]'}`} />
      {label}
    </button>
  )
}

/* ─── Form field ─────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5
        text-sm text-white placeholder:text-white/20 outline-none
        focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed ${props.className ?? ''}`}
    />
  )
}

/* ─── Profile tab ────────────────────────────────── */
function ProfileTab({ toast, setToast }: { toast: Toast | null; setToast: (t: Toast | null) => void }) {
  const [form, setForm] = useState({ name: '', email: '', position: '', bio: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    userService.getProfile()
      .then(user => {
        setForm({
          name:     user.name ?? '',
          email:    user.email ?? '',
          position: user.position ?? '',
          bio:      user.bio ?? '',
          phone:    user.phone ?? '',
        })
      })
      .catch(() => {
        // Fall back to localStorage data
        const u = authService.getCurrentUser()
        if (u) setForm({ name: u.name, email: u.email, position: u.position, bio: '', phone: '' })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await userService.updateProfile({
        name: form.name,
        bio: form.bio,
        phone: form.phone,
      })
      // Update localStorage
      const current = authService.getCurrentUser()
      if (current) {
        localStorage.setItem('dept_exec_user', JSON.stringify({ ...current, name: updated.name }))
      }
      setToast({ type: 'success', message: 'Profile updated successfully' })
    } catch {
      setToast({ type: 'error', message: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-white/[0.06] rounded w-20" />
            <div className="h-10 bg-white/[0.04] rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name">
          <Input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email Address">
          <Input value={form.email} disabled placeholder="Email" />
        </Field>
        <Field label="Position">
          <Input value={form.position} disabled placeholder="Position" />
        </Field>
        <Field label="Phone Number">
          <Input
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+234 xxx xxx xxxx"
          />
        </Field>
      </div>

      <Field label="Bio">
        <textarea
          value={form.bio}
          onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          rows={3}
          placeholder="A short bio about yourself..."
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5
            text-sm text-white placeholder:text-white/20 outline-none resize-none
            focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all duration-200"
        />
      </Field>

      <div className="pt-2 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
            bg-gradient-to-r from-[#0d7c3d] to-[#0e9147]
            hover:shadow-[0_4px_20px_rgba(13,124,61,0.5)] transition-shadow
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Security tab ───────────────────────────────── */
function SecurityTab({ setToast }: { setToast: (t: Toast | null) => void }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)

  const toggle = (field: keyof typeof show) =>
    setShow(s => ({ ...s, [field]: !s[field] }))

  const handleChange = async () => {
    if (!form.current || !form.next || !form.confirm) {
      setToast({ type: 'error', message: 'Please fill in all fields' })
      return
    }
    if (form.next !== form.confirm) {
      setToast({ type: 'error', message: 'New passwords do not match' })
      return
    }
    if (form.next.length < 8) {
      setToast({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }
    setSaving(true)
    try {
      await userService.changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      setToast({ type: 'success', message: 'Password changed successfully' })
    } catch {
      setToast({ type: 'error', message: 'Failed to change password. Check your current password.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-amber-400/[0.06] border border-amber-400/20 px-4 py-3">
        <p className="text-xs text-amber-300/80">
          Use a strong password with at least 8 characters, including numbers and symbols.
        </p>
      </div>

      {([
        { key: 'current' as const, label: 'Current Password' },
        { key: 'next' as const,    label: 'New Password' },
        { key: 'confirm' as const, label: 'Confirm New Password' },
      ]).map(({ key, label }) => (
        <Field key={key} label={label}>
          <div className="relative">
            <Input
              type={show[key] ? 'text' : 'password'}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => toggle(key)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {show[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
      ))}

      <div className="pt-2 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleChange}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
            bg-gradient-to-r from-[#0d7c3d] to-[#0e9147]
            hover:shadow-[0_4px_20px_rgba(13,124,61,0.5)] transition-shadow
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Shield className="w-4 h-4" />
          {saving ? 'Updating...' : 'Update Password'}
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Notifications tab ──────────────────────────── */
function NotificationsTab({ setToast }: { setToast: (t: Toast | null) => void }) {
  const [prefs, setPrefs] = useState({
    taskAssigned:    true,
    taskDue:         true,
    meetingReminder: true,
    minutesApproval: true,
    systemAlerts:    true,
    emailDigest:     false,
  })

  const toggle = (key: keyof typeof prefs) =>
    setPrefs(p => ({ ...p, [key]: !p[key] }))

  const items: { key: keyof typeof prefs; label: string; sub: string }[] = [
    { key: 'taskAssigned',    label: 'Task Assigned',         sub: 'When a task is assigned to you' },
    { key: 'taskDue',         label: 'Task Due Reminders',    sub: '24 hours before a task deadline' },
    { key: 'meetingReminder', label: 'Meeting Reminders',     sub: '1 hour before scheduled meetings' },
    { key: 'minutesApproval', label: 'Minutes Approval',      sub: 'When minutes require your approval' },
    { key: 'systemAlerts',    label: 'System Alerts',         sub: 'Important system notifications' },
    { key: 'emailDigest',     label: 'Daily Email Digest',    sub: 'Summary of activity each morning' },
  ]

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.key}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div>
            <p className="text-sm font-semibold text-white/80">{item.label}</p>
            <p className="text-xs text-white/35 mt-0.5">{item.sub}</p>
          </div>
          <button
            onClick={() => toggle(item.key)}
            className={`relative w-10 h-5.5 rounded-full transition-colors duration-200
              ${prefs[item.key] ? 'bg-[#0d7c3d]' : 'bg-white/[0.12]'}`}
            style={{ height: 22, width: 40 }}
          >
            <motion.div
              animate={{ x: prefs[item.key] ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow"
            />
          </button>
        </div>
      ))}

      <div className="pt-2 flex justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setToast({ type: 'success', message: 'Notification preferences saved' })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
            bg-gradient-to-r from-[#0d7c3d] to-[#0e9147]
            hover:shadow-[0_4px_20px_rgba(13,124,61,0.5)] transition-shadow"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </motion.button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'profile',       label: 'Profile',        icon: User },
    { key: 'security',      label: 'Security',       icon: Lock },
    { key: 'notifications', label: 'Notifications',  icon: Bell },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl
              text-sm font-semibold shadow-xl
              ${toast.type === 'success'
                ? 'bg-[#0d7c3d] text-white'
                : 'bg-rose-600 text-white'
              }`}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Settings
          </h1>
          <p className="text-sm text-white/40 mt-1">Manage your account and preferences</p>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-52 shrink-0">
            <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-2 space-y-1"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
              {tabs.map(tab => (
                <TabButton
                  key={tab.key}
                  label={tab.label}
                  icon={tab.icon}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 rounded-2xl bg-[#06100a] border border-white/[0.06] p-6"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
            <AnimatePresence>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'profile' && (
                  <ProfileTab toast={toast} setToast={setToast} />
                )}
                {activeTab === 'security' && (
                  <SecurityTab setToast={setToast} />
                )}
                {activeTab === 'notifications' && (
                  <NotificationsTab setToast={setToast} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

