'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UsersRound, Plus, Link2, Share2, Check, Trash2, X,
  AlertTriangle, Loader2, Download, CheckCircle, Search, Pencil, Mail, RotateCcw
} from 'lucide-react'
import { authService } from '@/services/auth'
import { ROLES } from '@/lib/constants'
import { membersService, type Member, type RegistrationLink } from '@/services/members'

/* ─── Matric range validation ────────────────────── */
const MATRIC_RANGES: Record<string, { min: number; max: number }> = {
  '100': { min: 258409, max: 258452 },
  '200': { min: 251111, max: 251164 },
  '300': { min: 244018, max: 244080 },
  '400': { min: 236849, max: 236898 },
  '500': { min: 231518, max: 231580 },
}

function isMatricFlagged(matric: string | undefined, level: string, isDirectEntry?: boolean): boolean {
  if (!matric || isDirectEntry) return false
  const range = MATRIC_RANGES[level]
  if (!range) return false
  const num = parseInt(matric, 10)
  if (isNaN(num)) return false
  return num < range.min || num > range.max
}

/* ─── Level badge ────────────────────────────────── */
const LEVEL_COLORS: Record<string, string> = {
  '100': '#60a5fa',
  '200': '#a78bfa',
  '300': '#f472b6',
  '400': '#f59e0b',
  '500': '#34d399',
}

function LevelBadge({ level }: { level: string }) {
  const c = LEVEL_COLORS[level] ?? '#e5e7eb'
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: c + '18', color: c, borderColor: c + '35' }}>
      {level}L
    </span>
  )
}

/* ─── Generate Link Modal ────────────────────────── */
function GenerateLinkModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (link: RegistrationLink) => void
}) {
  const [label, setLabel]           = useState('')
  const [expiresAt, setExpiresAt]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [generated, setGenerated]   = useState<RegistrationLink | null>(null)
  const [copied, setCopied]         = useState(false)

  const handleSubmit = async () => {
    if (!label.trim()) { setError('Label is required.'); return }
    setSubmitting(true); setError('')
    try {
      const link = await membersService.createRegistrationLink({
        label: label.trim(),
        expiresAt: expiresAt || undefined,
      })
      setGenerated(link)
      onCreated(link)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate link.')
    } finally { setSubmitting(false) }
  }

  const regLink = generated ? `${window.location.origin}/join/${generated.token}` : ''
  const handleCopy = () => {
    navigator.clipboard.writeText(regLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#071a0f]"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {generated ? (
          /* ── Success state ── */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Link Generated!
                </h2>
              </div>
              <button type="button" onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Registration Link
              </label>
              <div className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-emerald-500/20
                text-emerald-300 text-sm font-mono break-all select-all">
                {regLink}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={handleCopy}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                  ${copied
                    ? 'bg-emerald-500/30 border border-emerald-500/40 text-emerald-300'
                    : 'bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white shadow-[0_4px_16px_rgba(13,124,61,0.4)]'
                  }`}>
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Generate Registration Link
              </h2>
              <button type="button" onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  Label<span className="text-emerald-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. 2025/2026 New Members"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                    text-white text-sm placeholder:text-white/20 outline-none
                    focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                  Expiry Date <span className="text-white/25 normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                    text-white text-sm outline-none focus:border-emerald-500/40 focus:bg-white/[0.08]
                    transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-rose-300 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                  disabled:opacity-40 transition-all shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Link2 className="w-4 h-4" /> Generate Link</>
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Edit Member Modal ──────────────────────────── */
function EditMemberModal({
  member,
  onClose,
  onSaved,
}: {
  member: Member
  onClose: () => void
  onSaved: (updated: Member) => void
}) {
  const [form, setForm] = useState({
    name:          member.name ?? '',
    email:         member.email ?? '',
    phone:         member.phone ?? '',
    matricNumber:  member.matricNumber ?? '',
    level:         member.level ?? '500',
    gender:        member.gender ?? '',
    stateOfOrigin: (member as any).stateOfOrigin ?? '',
    notes:         (member as any).notes ?? '',
    isActive:      member.isActive !== false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSubmitting(true); setError('')
    try {
      const updated = await membersService.updateMember(member._id, {
        name:          form.name.trim(),
        email:         form.email.trim() || undefined,
        phone:         form.phone.trim() || undefined,
        matricNumber:  form.matricNumber.trim() || undefined,
        level:         form.level as Member['level'],
        gender:        (form.gender || undefined) as Member['gender'],
        stateOfOrigin: form.stateOfOrigin.trim() || undefined,
        notes:         form.notes.trim() || undefined,
        isActive:      form.isActive,
      } as Partial<Member>)
      onSaved(updated)
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.')
    } finally { setSubmitting(false) }
  }

  const inputCls = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white text-sm placeholder:text-white/20 outline-none
    focus:border-emerald-500/40 focus:bg-white/[0.08] transition-all`

  const selectCls = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white/80 text-sm outline-none focus:border-emerald-500/40 transition-all`

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#071a0f] max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Edit Member
            </h2>
            <p className="text-white/35 text-xs mt-0.5">{member.name}</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 pb-2 space-y-4 flex-1">
          {/* Row: Name + Matric */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Name<span className="text-emerald-400 ml-0.5">*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Matric No.
              </label>
              <input type="text" value={form.matricNumber} onChange={e => set('matricNumber', e.target.value)}
                placeholder="e.g. 231501" className={inputCls} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
              Email
            </label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="email@example.com" className={inputCls} />
          </div>

          {/* Row: Phone + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Phone
              </label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="08XXXXXXXXX" className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Level
              </label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={selectCls}>
                {['100','200','300','400','500','Postgraduate'].map(l => (
                  <option key={l} value={l}>{l === 'Postgraduate' ? 'Postgraduate' : `${l}L`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Gender + State of Origin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                Gender
              </label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectCls}>
                <option value="">— Not specified —</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
                State of Origin
              </label>
              <input type="text" value={form.stateOfOrigin} onChange={e => set('stateOfOrigin', e.target.value)}
                placeholder="e.g. Lagos" className={inputCls} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5">
              Notes
            </label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes about this member…" rows={2} maxLength={500}
              className={`${inputCls} resize-none`} />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-white/70">Active Member</p>
              <p className="text-xs text-white/30">Inactive members cannot vote in elections</p>
            </div>
            <button type="button" onClick={() => set('isActive', !form.isActive)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-white/[0.12]'}`}
              style={{ height: '1.375rem', width: '2.5rem' }}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 border-t border-white/[0.05]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.04] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
              disabled:opacity-40 transition-all shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Check className="w-4 h-4" /> Save Changes</>
            }
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

/* ─── Pagination helper ──────────────────────────── */
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

/* ─── Page ───────────────────────────────────────── */
export default function MembersPage() {
  const [isAdmin, setIsAdmin]               = useState(false)
  const [links, setLinks]                   = useState<RegistrationLink[]>([])
  const [linksLoading, setLinksLoading]     = useState(true)
  const [members, setMembers]               = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [showGenerate, setShowGenerate]     = useState(false)
  const [levelFilter, setLevelFilter]       = useState('')
  const [genderFilter, setGenderFilter]     = useState('')
  const [copiedId, setCopiedId]             = useState<string | null>(null)
  const [deletingId, setDeletingId]         = useState<string | null>(null)
  const [deletingMemberId, setDeletingMemberId]         = useState<string | null>(null)
  const [confirmDeleteMemberId, setConfirmDeleteMemberId] = useState<string | null>(null)
  const [totalMembers, setTotalMembers]     = useState(0)
  const [totalPages, setTotalPages]         = useState(1)
  const [currentPage, setCurrentPage]       = useState(1)
  const [searchQuery, setSearchQuery]       = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [editingMember, setEditingMember]   = useState<Member | null>(null)
  const [sendingCodeIds, setSendingCodeIds] = useState<Set<string>>(new Set())
  const [codeSentIds, setCodeSentIds]       = useState<Set<string>>(new Set())
  const [flaggedOnly, setFlaggedOnly]       = useState(false)
  const [showDeleted, setShowDeleted]       = useState(false)
  const [restoringId, setRestoringId]       = useState<string | null>(null)
  const [pendingDE, setPendingDE]           = useState<Member[]>([])
  const [approvingId, setApprovingId]       = useState<string | null>(null)
  const [rejectingId, setRejectingId]       = useState<string | null>(null)
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    const admin = user?.role === ROLES.ADMIN
    setIsAdmin(admin)
    if (admin) {
      membersService.listPendingDE().then(setPendingDE).catch(() => {})
    }
  }, [])

  useEffect(() => {
    membersService.getRegistrationLinks()
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(() => setLinks([]))
      .finally(() => setLinksLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [levelFilter, genderFilter, debouncedSearch, flaggedOnly, showDeleted])

  useEffect(() => {
    setMembersLoading(true)
    const params = showDeleted
      ? { isActive: false, search: debouncedSearch || undefined, page: currentPage }
      : flaggedOnly
      ? { limit: 1000 }
      : {
          level: levelFilter || undefined,
          gender: genderFilter || undefined,
          search: debouncedSearch || undefined,
          page: currentPage,
        }
    membersService.getMembers(params)
      .then(res => {
        const data = Array.isArray(res)
          ? { members: res, total: res.length, pages: 1 }
          : res as any
        setMembers(data.members ?? [])
        setTotalMembers(data.total ?? 0)
        setTotalPages(data.pages ?? 1)
      })
      .catch(() => { setMembers([]); setTotalMembers(0); setTotalPages(1) })
      .finally(() => setMembersLoading(false))
  }, [levelFilter, genderFilter, debouncedSearch, currentPage, flaggedOnly, showDeleted])

  const displayedMembers = flaggedOnly
    ? members.filter(m => isMatricFlagged(m.matricNumber, m.level, m.isDirectEntry))
    : members

  const handleCopyLink = (token: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${token}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteLink = async (id: string) => {
    setDeletingId(id)
    try {
      await membersService.deleteRegistrationLink(id)
      setLinks(prev => prev.filter(l => l._id !== id))
    } catch { /* silent */ }
    finally { setDeletingId(null) }
  }

  const handleDeleteMember = async (id: string) => {
    setDeletingMemberId(id)
    try {
      await membersService.deleteMember(id)
      setMembers(prev => prev.filter(m => m._id !== id))
      setConfirmDeleteMemberId(null)
    } catch { /* silent — member stays in list */ }
    finally { setDeletingMemberId(null) }
  }

  const handleRestoreMember = async (id: string) => {
    setRestoringId(id)
    try {
      await membersService.restoreMember(id)
      setMembers(prev => prev.filter(m => m._id !== id))
      setTotalMembers(t => t - 1)
    } catch { /* silent */ }
    finally { setRestoringId(null) }
  }

  const handleEditSaved = (updated: Member) => {
    setMembers(prev => prev.map(m => m._id === updated._id ? updated : m))
    setEditingMember(null)
  }

  const handleSendCode = async (member: Member) => {
    setSendingCodeIds(prev => new Set(prev).add(member._id))
    try {
      await membersService.sendVoteCode(member._id)
      setCodeSentIds(prev => new Set(prev).add(member._id))
      setTimeout(() => {
        setCodeSentIds(prev => { const s = new Set(prev); s.delete(member._id); return s })
      }, 3000)
    } catch { /* silent */ }
    finally {
      setSendingCodeIds(prev => { const s = new Set(prev); s.delete(member._id); return s })
    }
  }

  const handleApproveDE = async (id: string) => {
    setApprovingId(id)
    try {
      const { member } = await membersService.approveMember(id)
      setPendingDE(prev => prev.filter(m => m._id !== id))
      setMembers(prev => [member, ...prev])
      setTotalMembers(t => t + 1)
    } catch { /* silent */ }
    finally { setApprovingId(null) }
  }

  const handleRejectDE = async (id: string) => {
    setRejectingId(id)
    try {
      await membersService.rejectMember(id)
      setPendingDE(prev => prev.filter(m => m._id !== id))
    } catch { /* silent */ }
    finally { setRejectingId(null); setConfirmRejectId(null) }
  }

  const handleExportCsv = () => {
    const fmtText = (v: string) => `="${ v.replace(/"/g, '""') }"`
    const fmtDate = (d: string) =>
      `"${ new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }"`
    const headers = ['Name', 'Email', 'Matric No.', 'Level', 'Gender', 'Phone', 'Registered At']
    const rows = members.map(m => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${(m.email ?? '').replace(/"/g, '""')}"`,
      fmtText(m.matricNumber ?? ''),
      `"${m.level}L"`,
      `"${m.gender ?? ''}"`,
      fmtText(m.phone ?? ''),
      fmtDate(m.createdAt),
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'members.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const selectCls = `px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white/70 text-sm outline-none focus:border-emerald-500/30 transition-all
    [color-scheme:dark] cursor-pointer`

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');`}</style>

      <div className="min-h-screen bg-[#06100a] p-6 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase">IESA</p>
            <h1 className="text-2xl font-black text-white mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
              Members
            </h1>
          </div>
          {isAdmin && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowGenerate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                text-white text-sm font-bold shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              <Plus className="w-4 h-4" />
              Generate Registration Link
            </motion.button>
          )}
        </div>

        {/* ── Registration Links ── */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-white/50 tracking-[0.15em] uppercase"
            style={{ fontFamily: 'Syne, sans-serif' }}>Registration Links</h2>

          {linksLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
            </div>
          ) : links.length === 0 ? (
            <div className="py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/25 text-sm">No registration links yet</p>
              {isAdmin && (
                <p className="text-white/15 text-xs mt-1">Generate a link to allow members to self-register</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {links.map(l => (
                <div key={l._id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl
                    border border-white/[0.06] bg-white/[0.02] flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{l.label}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {l.expiresAt
                        ? `Expires ${new Date(l.expiresAt).toLocaleDateString()}`
                        : 'No expiry'
                      }
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    l.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/[0.07] text-white/40'
                  }`}>
                    {l.status === 'ACTIVE' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {l.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(l.token, l._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                        bg-white/[0.05] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white">
                      {copiedId === l._id
                        ? <Check className="w-3.5 h-3.5" />
                        : <Share2 className="w-3.5 h-3.5" />}
                      {copiedId === l._id ? 'Copied!' : 'Copy Link'}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLink(l._id)}
                        disabled={deletingId === l._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                          bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40">
                        {deletingId === l._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pending D.E. Applications ── */}
        {isAdmin && pendingDE.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white/50 tracking-[0.15em] uppercase"
                style={{ fontFamily: 'Syne, sans-serif' }}>Pending D.E. Applications</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 border border-amber-500/30 text-amber-400">
                {pendingDE.length}
              </span>
            </div>
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] overflow-hidden">
              <div className="px-4 py-2.5 bg-amber-500/[0.06] border-b border-amber-500/10 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-xs text-amber-400/80 font-medium">
                  These students registered as Direct Entry. Review and approve or reject each application.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Name', 'Matric No.', 'Level', 'Email', 'Submitted'].map(h => (
                        <th key={h} className="py-2.5 px-4 text-left text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                      <th className="py-2.5 px-4 text-right text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {pendingDE.map(m => (
                      <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-white/80 font-medium whitespace-nowrap">{m.name}</td>
                        <td className="py-3 px-4 text-white/60 font-mono text-xs whitespace-nowrap">
                          <span>{m.matricNumber ?? <span className="text-white/20">—</span>}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 border border-sky-500/25 text-sky-400">D.E.</span>
                        </td>
                        <td className="py-3 px-4"><LevelBadge level={m.level} /></td>
                        <td className="py-3 px-4 text-white/45 text-xs whitespace-nowrap">
                          {m.email ?? <span className="text-white/20">—</span>}
                        </td>
                        <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {confirmRejectId === m._id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setConfirmRejectId(null)}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-medium hover:text-white/70 transition-colors">
                                Cancel
                              </button>
                              <button onClick={() => handleRejectDE(m._id)} disabled={rejectingId === m._id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/30 disabled:opacity-40 transition-colors">
                                {rejectingId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Confirm
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleApproveDE(m._id)} disabled={approvingId === m._id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 disabled:opacity-40 transition-colors">
                                {approvingId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Approve
                              </button>
                              <button onClick={() => setConfirmRejectId(m._id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/30 text-xs font-medium hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Registered Members ── */}
        <div className="space-y-3">
          {/* Section header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-black tracking-[0.15em] uppercase inline"
                style={{ fontFamily: 'Syne, sans-serif', color: showDeleted ? 'rgba(251,113,133,0.7)' : 'rgba(255,255,255,0.5)' }}>
                {showDeleted ? 'Deleted Members' : 'Registered Members'}
              </h2>
              {!membersLoading && (
                <span className="text-sm text-white/25 ml-2">— {totalMembers} total</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level filter — hidden in deleted/flagged view */}
              {!showDeleted && !flaggedOnly && (
                <select
                  value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value)}
                  className={selectCls}
                >
                  <option value="">All Levels</option>
                  {['100', '200', '300', '400', '500'].map(l => (
                    <option key={l} value={l}>{l}L</option>
                  ))}
                </select>
              )}

              {/* Gender filter — hidden in deleted/flagged view */}
              {!showDeleted && !flaggedOnly && (
                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value)}
                  className={selectCls}
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              )}

              {/* Flagged filter */}
              <button
                type="button"
                onClick={() => { setFlaggedOnly(f => !f); setShowDeleted(false); setLevelFilter(''); setGenderFilter('') }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                  flaggedOnly
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:bg-amber-500/10 hover:border-amber-500/20 hover:text-amber-400'
                }`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Flagged
              </button>

              {/* Deleted filter (admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => { setShowDeleted(d => !d); setFlaggedOnly(false); setLevelFilter(''); setGenderFilter('') }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    showDeleted
                      ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                      : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400'
                  }`}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Deleted
                </button>
              )}

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={members.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors
                  border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40">
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or matric number…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white/80 text-sm placeholder-white/25 outline-none focus:border-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table */}
          {membersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d] animate-spin" />
            </div>
          ) : displayedMembers.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <UsersRound className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/25 text-sm">
                {showDeleted ? 'No deleted members found'
                  : flaggedOnly ? 'No flagged members found — all matric numbers are within valid ranges'
                  : levelFilter || genderFilter || searchQuery ? 'No members match the selected filters'
                  : 'No registered members yet'}
              </p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                    {['Name', 'Email', 'Matric No.', 'Level', 'Gender', 'Phone', 'Registered At'].map(h => (
                      <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {isAdmin && (
                      <th className="py-3 px-4 text-right text-[10px] font-black text-white/30 tracking-[0.12em] uppercase whitespace-nowrap">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {displayedMembers.map(m => (
                    <tr key={m._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-white/80 font-medium whitespace-nowrap">{m.name}</td>
                      <td className="py-3 px-4 text-white/45 font-mono text-xs whitespace-nowrap">
                        {m.email ?? <span className="text-white/20">—</span>}
                      </td>
                      <td className="py-3 px-4 text-white/60 font-mono text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{m.matricNumber ?? <span className="text-white/20">—</span>}</span>
                          {m.isDirectEntry && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 border border-sky-500/25 text-sky-400">
                              D.E.
                            </span>
                          )}
                          {isMatricFlagged(m.matricNumber, m.level, m.isDirectEntry) && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold
                              bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              <AlertTriangle className="w-2.5 h-2.5" /> Out of range
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <LevelBadge level={m.level} />
                      </td>
                      <td className="py-3 px-4 text-white/50 whitespace-nowrap">
                        {m.gender ?? <span className="text-white/20">—</span>}
                      </td>
                      <td className="py-3 px-4 text-white/45 font-mono text-xs whitespace-nowrap">
                        {m.phone ?? <span className="text-white/20">—</span>}
                      </td>
                      <td className="py-3 px-4 text-white/35 text-xs whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {showDeleted ? (
                            <button onClick={() => handleRestoreMember(m._id)}
                              disabled={restoringId === m._id}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-40 ml-auto">
                              {restoringId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                              Restore
                            </button>
                          ) : confirmDeleteMemberId === m._id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => setConfirmDeleteMemberId(null)}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs font-medium hover:text-white/70 transition-colors">
                                Cancel
                              </button>
                              <button onClick={() => handleDeleteMember(m._id)}
                                disabled={deletingMemberId === m._id}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition-colors disabled:opacity-40">
                                {deletingMemberId === m._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Yes
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleSendCode(m)}
                                disabled={sendingCodeIds.has(m._id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 ${
                                  codeSentIds.has(m._id)
                                    ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                                    : 'bg-white/[0.03] border-white/[0.06] text-white/25 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400'
                                }`}>
                                {sendingCodeIds.has(m._id)
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : codeSentIds.has(m._id)
                                  ? <Check className="w-3 h-3" />
                                  : <Mail className="w-3 h-3" />
                                }
                                {codeSentIds.has(m._id) ? 'Sent!' : 'Send Code'}
                              </button>
                              <button onClick={() => setEditingMember(m)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/25 text-xs font-medium hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-400 transition-colors">
                                <Pencil className="w-3 h-3" />
                                Edit
                              </button>
                              <button onClick={() => setConfirmDeleteMemberId(m._id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/25 text-xs font-medium hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.05] flex-wrap gap-3">
                <p className="text-xs text-white/30">
                  Showing {(currentPage - 1) * 50 + 1}–{Math.min(currentPage * 50, totalMembers)} of {totalMembers}
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                      bg-white/[0.04] border-white/[0.07] text-white/50 hover:bg-white/[0.08] hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed">
                    ← Prev
                  </button>
                  {getPageNumbers(currentPage, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`e-${i}`} className="px-1 text-white/20 text-xs">…</span>
                    ) : (
                      <button key={p} onClick={() => setCurrentPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition-colors ${
                          p === currentPage
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.07] text-white/50 hover:bg-white/[0.08]'
                        }`}>
                        {p}
                      </button>
                    )
                  )}
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                      bg-white/[0.04] border-white/[0.07] text-white/50 hover:bg-white/[0.08] hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed">
                    Next →
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showGenerate && (
          <GenerateLinkModal
            onClose={() => setShowGenerate(false)}
            onCreated={link => {
              setLinks(prev => [link, ...prev])
              setShowGenerate(false)
            }}
          />
        )}
        {editingMember && (
          <EditMemberModal
            member={editingMember}
            onClose={() => setEditingMember(null)}
            onSaved={handleEditSaved}
          />
        )}
      </AnimatePresence>
    </>
  )
}
