'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle, ChevronDown, CheckSquare, Target, Calendar,
  FileText, BarChart3, Users, Bell, Mail, MessageSquare,
  BookOpen, Keyboard, Zap
} from 'lucide-react'

/* ─── FAQ item ───────────────────────────────────── */
interface FaqItem { q: string; a: string }

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/[0.05] last:border-b-0"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
          hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-semibold text-white/80">{item.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-[#5aad7a]"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-white/45 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Feature card ───────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color }: {
  icon: React.ElementType; title: string; desc: string; color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2.5"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}>
        <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color }} />
      </div>
      <div>
        <p className="text-sm font-bold text-white/85">{title}</p>
        <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

/* ─── Keyboard shortcut ──────────────────────────── */
function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-b-0">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={i}>
            <kbd className="px-2 py-0.5 rounded-md bg-white/[0.07] border border-white/[0.1]
              text-[11px] font-mono font-semibold text-white/60">
              {k}
            </kbd>
            {i < keys.length - 1 && <span className="text-white/25 text-xs mx-0.5">+</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Section wrapper ────────────────────────────── */
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-[#0d7c3d]/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */
const FAQ: FaqItem[] = [
  {
    q: 'How do I create a new task?',
    a: 'Navigate to the Tasks page and click "Create Task", or use the Quick Actions widget on the dashboard. Fill in the title, assign it to a member, set a due date and priority, then submit.',
  },
  {
    q: 'Who can invite new members?',
    a: 'Only Administrators can invite new members. Go to the Members page, click "Invite Member", enter their email and assign their role and position. They will receive an invitation email.',
  },
  {
    q: 'How do meeting minutes work?',
    a: 'After a meeting, an Admin uploads the minutes document on the Minutes page. Other executives can view and comment. Admins approve minutes to finalise them.',
  },
  {
    q: 'What is the difference between ADMIN and EXEC roles?',
    a: 'Admins have full access including member management, minutes approval, and all settings. Exec members can create tasks, view reports, attend meetings, and update their own profiles.',
  },
  {
    q: 'How are goals tracked?',
    a: 'Goals are created with a target date and progress is updated manually or linked to completed tasks. The dashboard shows a health indicator: On Track, At Risk, or Overdue.',
  },
  {
    q: 'I forgot my password. What do I do?',
    a: 'Contact your Administrator. They can reset your account. Once logged in, go to Settings → Security to update your password.',
  },
  {
    q: 'How do notifications work?',
    a: 'The system sends real-time notifications for task assignments, meeting reminders, and minutes approvals. You can configure which notifications you receive in Settings → Notifications.',
  },
]

const FEATURES = [
  { icon: CheckSquare, title: 'Tasks',    desc: 'Assign and track tasks with priorities, due dates, and progress.',   color: '#3b82f6' },
  { icon: Target,      title: 'Goals',    desc: 'Set department objectives and monitor progress over time.',            color: '#10b981' },
  { icon: Calendar,    title: 'Meetings', desc: 'Schedule meetings, track attendance, and manage meeting details.',    color: '#a78bfa' },
  { icon: FileText,    title: 'Minutes',  desc: 'Upload, review, and approve meeting minutes with full audit trail.', color: '#34d399' },
  { icon: BarChart3,   title: 'Reports',  desc: 'Generate and view performance and activity reports.',                 color: '#f59e0b' },
  { icon: Users,       title: 'Members',  desc: 'Manage executive team members, roles, and positions.',               color: '#f43f5e' },
]

const SHORTCUTS = [
  { keys: ['Alt', 'D'], label: 'Go to Dashboard' },
  { keys: ['Alt', 'T'], label: 'Go to Tasks' },
  { keys: ['Alt', 'G'], label: 'Go to Goals' },
  { keys: ['Alt', 'M'], label: 'Go to Meetings' },
  { keys: ['Alt', 'N'], label: 'Open Notifications' },
  { keys: ['Ctrl', 'K'], label: 'Global Search' },
]

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export default function HelpPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Help & Support
            </h1>
            <p className="text-sm text-white/40 mt-1">Everything you need to use the IESA Exec Portal</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
            bg-emerald-400/10 border border-emerald-400/20">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">v1.0</span>
          </div>
        </div>

        {/* Features overview */}
        <Section title="Platform Features" icon={BookOpen}>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions" icon={HelpCircle}>
          <div>
            {FAQ.map((item, i) => <FaqRow key={i} item={item} index={i} />)}
          </div>
        </Section>

        {/* Keyboard shortcuts */}
        <Section title="Keyboard Shortcuts" icon={Keyboard}>
          <div className="px-5 py-2">
            {SHORTCUTS.map(s => <Shortcut key={s.label} {...s} />)}
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Support" icon={MessageSquare}>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="mailto:iesaipe@gmail.com"
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
                px-4 py-3 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                  Email Support
                </p>
                <p className="text-xs text-white/35">iesaipe@gmail.com</p>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
              px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">In-App Support</p>
                <p className="text-xs text-white/35">Contact your Administrator</p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-4 py-3">
              <p className="text-xs text-white/35 leading-relaxed">
                For urgent issues, reach out to the General Secretary or President directly.
                Response time for email support is typically within 24 hours during working days.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
