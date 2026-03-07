'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck, Plus, X, ArrowRight, Check, Loader2, AlertTriangle
} from 'lucide-react'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'
import { handoverService, type Handover, type HandoverSections } from '@/services/handover'

/* ─── Status badge ───────────────────────────────── */
function StatusBadge({ status, acknowledgedAt }: { status: Handover['status']; acknowledgedAt?: string }) {
  if (status === 'DRAFT') return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/[0.07] text-white/50">
      Draft
    </span>
  )
  if (status === 'SUBMITTED') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Submitted
    </span>
  )
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
        <Check className="w-3 h-3" />
        Acknowledged
      </span>
      {acknowledgedAt && (
        <span className="text-[10px] text-white/25">
          {new Date(acknowledgedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

/* ─── Sections count preview ─────────────────────── */
function sectionsCount(sections: HandoverSections): number {
  return Object.values(sections).filter(v => v && v.trim()).length
}

/* ─── Handover modal ─────────────────────────────── */
const SECTION_KEYS: Array<{ key: keyof HandoverSections; label: string; placeholder: string }> = [
  { key: 'responsibilities',   label: 'Responsibilities',    placeholder: 'Describe the key responsibilities of this role…' },
  { key: 'ongoingProjects',    label: 'Ongoing Projects',    placeholder: 'List and describe any projects currently in progress…' },
  { key: 'keyContacts',        label: 'Key Contacts',        placeholder: 'Important contacts: name, role, email/phone…' },
  { key: 'accessAndPasswords', label: 'Access & Passwords',  placeholder: 'Accounts, login credentials, and access information…' },
  { key: 'adviceAndTips',      label: 'Advice & Tips',       placeholder: 'Lessons learned, do\'s and don\'ts, personal advice…' },
  { key: 'pendingIssues',      label: 'Pending Issues',      placeholder: 'Unresolved issues that need attention…' },
  { key: 'resources',          label: 'Resources',           placeholder: 'Useful documents, links, tools, and references…' },
]

function HandoverModal({
  handover, currentUser, onClose, onUpdate
}: {
  handover: Handover
  currentUser: { name: string; role: string } | null
  onClose: () => void
  onUpdate: (h: Handover) => void
}) {
  const [sections, setSections] = useState<HandoverSections>(handover.sections ?? {})
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [activeSection, setActiveSection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOutgoing = currentUser?.name === handover.outgoingExec?.name
  const isIncoming = currentUser?.name === handover.incomingExec?.name

  /* Autosave */
  useEffect(() => {
    if (handover.status !== 'DRAFT') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveState('saving')
    debounceRef.current = setTimeout(async () => {
      try {
        const updated = await handoverService.updateHandover(handover._id, { sections })
        onUpdate(updated)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } catch {
        setSaveState('idle')
      }
    }, 1500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [sections]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (newStatus: 'SUBMITTED' | 'ACKNOWLEDGED') => {
    setSubmitting(true)
    try {
      const updated = await handoverService.updateHandover(handover._id, { status: newStatus })
      onUpdate(updated)
      onClose()
    } catch { /* ignore */ }
    finally { setSubmitting(false) }
  }

  const canEdit = handover.status === 'DRAFT' && isOutgoing

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {handover.position}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] text-[11px] text-white/50">{handover.session}</span>
              <StatusBadge status={handover.status} acknowledgedAt={handover.acknowledgedAt} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {handover.status === 'DRAFT' && (
              <span className={`text-[11px] transition-colors ${
                saveState === 'saving' ? 'text-amber-400/70' : saveState === 'saved' ? 'text-emerald-400/70' : 'text-white/20'
              }`}>
                {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : ''}
              </span>
            )}
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exec flow */}
        <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 text-sm shrink-0">
          <span className="text-white/70 font-medium">{handover.outgoingExec?.name}</span>
          <ArrowRight className="w-4 h-4 text-white/25 shrink-0" />
          <span className={handover.incomingExec ? 'text-white/70 font-medium' : 'text-white/25 italic'}>
            {handover.incomingExec?.name ?? 'No incoming exec set'}
          </span>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mx-6 mb-4 overflow-x-auto shrink-0 pb-1">
          {SECTION_KEYS.map((s, i) => (
            <button key={s.key} type="button" onClick={() => setActiveSection(i)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                activeSection === i
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60'
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Active section textarea */}
        <div className="flex-1 min-h-0 px-6 pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
              className="h-full flex flex-col gap-2">
              <label className="text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase">
                {SECTION_KEYS[activeSection].label}
              </label>
              <textarea
                value={sections[SECTION_KEYS[activeSection].key] ?? ''}
                onChange={e => {
                  if (!canEdit) return
                  setSections(prev => ({ ...prev, [SECTION_KEYS[activeSection].key]: e.target.value }))
                }}
                readOnly={!canEdit}
                placeholder={canEdit ? SECTION_KEYS[activeSection].placeholder : 'No content yet.'}
                rows={12}
                className="w-full flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-white/20 outline-none resize-none leading-relaxed
                  focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all
                  read-only:opacity-70 read-only:cursor-default"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action bar */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-white/30">
            {sectionsCount(sections)} / {SECTION_KEYS.length} sections filled
          </div>
          <div className="flex gap-2">
            {handover.status === 'DRAFT' && isOutgoing && (
              <button type="button" onClick={() => handleStatusChange('SUBMITTED')} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30
                  text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-40">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Handover
              </button>
            )}
            {handover.status === 'SUBMITTED' && isIncoming && (
              <button type="button" onClick={() => handleStatusChange('ACKNOWLEDGED')} disabled={submitting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                  text-white text-sm font-bold disabled:opacity-40 shadow-[0_4px_16px_rgba(13,124,61,0.4)] transition-all">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Acknowledge Receipt
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Create Handover Modal ──────────────────────── */
function CreateHandoverModal({
  onClose, onCreate
}: {
  onClose: () => void
  onCreate: (h: Handover) => void
}) {
  const [position, setPosition] = useState('')
  const [session, setSession] = useState('')
  const [incomingExec, setIncomingExec] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!position.trim() || !session.trim()) { setError('Position and Session are required.'); return }
    setSubmitting(true); setError('')
    try {
      const created = await handoverService.createHandover({
        position: position.trim(),
        session: session.trim(),
        incomingExec: incomingExec.trim() || undefined,
      })
      onCreate(created)
      onClose()
    } catch {
      setError('Failed to create handover. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>New Handover</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {[
            { label: 'Position', value: position, set: setPosition, placeholder: 'e.g. President', required: true },
            { label: 'Session', value: session, set: setSession, placeholder: 'e.g. 2025/2026', required: true },
            { label: 'Incoming Exec Name', value: incomingExec, set: setIncomingExec, placeholder: 'Optional — can be set later', required: false },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                {f.label}{f.required && <span className="text-emerald-400 ml-0.5">*</span>}
              </label>
              <input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-white/20 outline-none
                  focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all" />
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                disabled:opacity-40 shadow-[0_4px_16px_rgba(13,124,61,0.4)] transition-all">
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Handover card ──────────────────────────────── */
function HandoverCard({ handover, onClick }: { handover: Handover; onClick: () => void }) {
  const filled = sectionsCount(handover.sections)
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 cursor-pointer
        hover:border-white/[0.10] hover:bg-white/[0.03] transition-all space-y-3"
    >
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            {handover.position}
          </h3>
          <span className="inline-flex px-2 py-0.5 rounded-full bg-white/[0.06] text-[11px] text-white/45 mt-1">
            {handover.session}
          </span>
        </div>
        <StatusBadge status={handover.status} acknowledgedAt={handover.acknowledgedAt} />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/60 font-medium truncate">{handover.outgoingExec?.name}</span>
        <ArrowRight className="w-4 h-4 text-white/25 shrink-0" />
        <span className={`truncate ${handover.incomingExec ? 'text-white/60 font-medium' : 'text-white/25 italic'}`}>
          {handover.incomingExec?.name ?? 'TBD'}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/30">
        <span>{filled}/{SECTION_KEYS.length} sections filled</span>
        <span>{new Date(handover.createdAt).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function HandoverPage() {
  const [handovers, setHandovers] = useState<Handover[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'mine' | 'all'>('mine')
  const [openHandover, setOpenHandover] = useState<Handover | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (user) setCurrentUser({ name: user.name, role: user.role })
  }, [])

  useEffect(() => {
    handoverService.getHandovers()
      .then(data => setHandovers(Array.isArray(data) ? data : []))
      .catch(() => setHandovers([]))
      .finally(() => setLoading(false))
  }, [])

  const isAdmin = currentUser?.role === ROLES.ADMIN

  const displayed = tab === 'mine'
    ? handovers.filter(h => h.outgoingExec?.name === currentUser?.name || h.incomingExec?.name === currentUser?.name)
    : handovers

  const updateHandover = (updated: Handover) => {
    setHandovers(prev => prev.map(h => h._id === updated._id ? updated : h))
    if (openHandover?._id === updated._id) setOpenHandover(updated)
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#06100a] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">IESA</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Executive Handover
            </h1>
          </div>
          <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={e => { e.stopPropagation(); setShowCreate(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
              text-white text-sm font-bold shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
            <Plus className="w-4 h-4" />
            New Handover
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {[
            { key: 'mine', label: 'My Handovers' },
            ...(isAdmin ? [{ key: 'all', label: 'All Handovers' }] : []),
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key as 'mine' | 'all')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-[#0d7c3d] text-white shadow-[0_4px_12px_rgba(13,124,61,0.4)]'
                  : 'text-white/40 hover:text-white/60'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">
              {tab === 'mine' ? 'No handovers yet. Create your first one.' : 'No handovers found.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map(h => (
              <HandoverCard key={h._id} handover={h} onClick={() => setOpenHandover(h)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openHandover && (
          <HandoverModal
            handover={openHandover}
            currentUser={currentUser}
            onClose={() => setOpenHandover(null)}
            onUpdate={updateHandover}
          />
        )}
        {showCreate && (
          <CreateHandoverModal
            onClose={() => setShowCreate(false)}
            onCreate={h => setHandovers(prev => [h, ...prev])}
          />
        )}
      </AnimatePresence>
    </>
  )
}
