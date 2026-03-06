'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Search, ChevronDown, Edit, Trash2,
  X, AlertCircle, Upload, Banknote, ChevronRight, FileText,
  Phone, Hash, GraduationCap, User
} from 'lucide-react'
import { authService } from '@/services/auth'
import { membersService, type Member } from '@/services/members'

/* ─── Helpers ──────────────────────────────────────── */
const AVATAR_COLORS = ['#3b82f6','#10b981','#a78bfa','#f472b6','#f59e0b','#34d399','#60a5fa','#f87171']
const getColor = (name: string) => {
  if (!name || typeof name !== 'string') return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
const getInitials = (name: string) => {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
const currentAcademicYear = () => {
  const now = new Date()
  const y = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  return `${y}/${y + 1}`
}

/* ─── Count-up ─────────────────────────────────────── */
function CountUp({ value, color }: { value: number; color: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0; const steps = 24; const inc = value / steps
    const t = setInterval(() => {
      i += inc
      if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i))
    }, 42)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{count}</span>
}

/* ─── Avatar ───────────────────────────────────────── */
function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
      style={{ background: color + '22', border: `1.5px solid ${color}38`, color, minWidth: 36, minHeight: 36, fontSize: 12 }}>
      {getInitials(name)}
    </div>
  )
}

/* ─── Dues badge ───────────────────────────────────── */
function DuesBadge({ paid }: { paid: boolean | null }) {
  if (paid === null) return <span className="text-[11px] text-white/20 font-medium">—</span>
  return paid
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Paid</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">Unpaid</span>
}

/* ─── Level badge ──────────────────────────────────── */
function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    '100': '#60a5fa', '200': '#a78bfa', '300': '#f472b6',
    '400': '#f59e0b', '500': '#34d399',
  }
  const c = colors[level] ?? '#e5e7eb'
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: c + '14', color: c, borderColor: c + '30' }}>
      {level}L
    </span>
  )
}

/* ─── Modal Overlay ────────────────────────────────── */
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-lg">
        {children}
      </motion.div>
    </div>
  )
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white text-sm placeholder:text-white/25 outline-none focus:border-emerald-500/40
  focus:bg-white/[0.07] transition-all`

const labelCls = `block text-[11px] font-bold text-white/40 tracking-[0.12em] uppercase mb-1.5`

/* ══════════════════════ AddMemberModal ══════════════════════ */
function AddMemberModal({
  member, onClose, onSaved
}: { member: Member | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!member
  const [form, setForm] = useState({
    name: member?.name ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    matricNumber: member?.matricNumber ?? '',
    level: member?.level ?? '100',
    gender: member?.gender ?? '',
    stateOfOrigin: member?.stateOfOrigin ?? '',
    notes: member?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setErr('Name is required'); return }
    if (!form.level) { setErr('Level is required'); return }
    setSaving(true); setErr('')
    try {
      if (isEdit && member) {
        await membersService.updateMember(member._id, form as any)
      } else {
        await membersService.createMember(form as any)
      }
      onSaved()
    } catch (e: any) {
      setErr(e.message || 'Failed to save member')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0a1c11 0%, #06100a 100%)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '-24px 0 64px rgba(0,0,0,0.5)',
          }}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">
                {isEdit ? 'Edit' : 'New'} Member
              </p>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {isEdit ? 'Update Member' : 'Add Member'}
              </h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {err && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-rose-400 text-sm">{err}</p>
              </div>
            )}

            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Amara Osei" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Level *</label>
                <div className="relative">
                  <select className={inputCls + ' appearance-none pr-8 cursor-pointer'} value={form.level} onChange={e => set('level', e.target.value)}>
                    {['100','200','300','400','500'].map(l => (
                      <option key={l} value={l} className="bg-[#06100a]">{l}L</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <div className="relative">
                  <select className={inputCls + ' appearance-none pr-8 cursor-pointer'} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="" className="bg-[#06100a]">Select…</option>
                    {['Male','Female','Other'].map(g => (
                      <option key={g} value={g} className="bg-[#06100a]">{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={e => set('email', e.target.value)} placeholder="student@uni.edu" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 ..." />
              </div>
              <div>
                <label className={labelCls}>Matric Number</label>
                <input className={inputCls} value={form.matricNumber} onChange={e => set('matricNumber', e.target.value)} placeholder="CSC/2021/..." />
              </div>
            </div>

            <div>
              <label className={labelCls}>State of Origin</label>
              <input className={inputCls} value={form.stateOfOrigin} onChange={e => set('stateOfOrigin', e.target.value)} placeholder="e.g. Anambra" />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea className={inputCls + ' resize-none'} rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional internal notes…" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                disabled:opacity-50 transition-all hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)]">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/* ══════════════════════ RecordDuesModal ══════════════════════ */
function RecordDuesModal({
  memberId, memberName, onClose, onSaved
}: { memberId: string; memberName: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    session: currentAcademicYear(),
    semester: 'First',
    amount: '',
    paid: true,
    note: '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount))) { setErr('Enter a valid amount'); return }
    setSaving(true); setErr('')
    try {
      await membersService.recordDues(memberId, {
        session: form.session,
        semester: form.semester,
        amount: Number(form.amount),
        paid: form.paid,
        note: form.note || undefined,
      })
      onSaved()
    } catch (e: any) {
      setErr(e.message || 'Failed to record dues')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <ModalOverlay onClose={onClose}>
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a1c11, #06100a)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">Dues Record</p>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Record Dues</h2>
              <p className="text-xs text-white/30 mt-0.5">{memberName}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {err && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-rose-400 text-sm">{err}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Session</label>
                <input className={inputCls} value={form.session} onChange={e => set('session', e.target.value)} placeholder="2024/2025" />
              </div>
              <div>
                <label className={labelCls}>Semester</label>
                <div className="relative">
                  <select className={inputCls + ' appearance-none pr-8 cursor-pointer'} value={form.semester} onChange={e => set('semester', e.target.value)}>
                    {['First','Second','Both'].map(s => (
                      <option key={s} value={s} className="bg-[#06100a]">{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Amount (₦)</label>
              <input type="number" min="0" className={inputCls} value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="5000" />
            </div>

            <div>
              <label className={labelCls}>Payment Status</label>
              <div className="flex gap-2">
                {[true, false].map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => set('paid', v)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.paid === v
                        ? v
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/30 hover:text-white/50'
                    }`}>
                    {v ? 'Paid' : 'Unpaid'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Note (optional)</label>
              <input className={inputCls} value={form.note} onChange={e => set('note', e.target.value)} placeholder="Payment reference, method…" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold disabled:opacity-50 hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)] transition-all">
                {saving ? 'Saving…' : 'Record Dues'}
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>
    </AnimatePresence>
  )
}

/* ══════════════════════ BulkImportModal ══════════════════════ */
function BulkImportModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [err, setErr] = useState('')
  const [parseErr, setParseErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const HEADERS = ['name','email','phone','matricNumber','level','gender','stateOfOrigin']

  const parseCSV = (text: string) => {
    setParseErr('')
    const lines = text.trim().split('\n').filter(l => l.trim())
    if (!lines.length) { setPreview([]); return }
    const firstLine = lines[0].split(',').map(h => h.trim().toLowerCase())
    const hasHeader = firstLine.includes('name')
    const dataLines = hasHeader ? lines.slice(1) : lines

    const rows = dataLines.map(line => {
      const cols = line.split(',').map(c => c.trim())
      if (hasHeader) {
        const obj: any = {}
        firstLine.forEach((h, i) => { obj[h] = cols[i] ?? '' })
        return obj
      } else {
        const obj: any = {}
        HEADERS.forEach((h, i) => { obj[h] = cols[i] ?? '' })
        return obj
      }
    }).filter(r => r.name)

    if (!rows.length) { setParseErr('No valid rows found. Make sure the CSV has a "name" column.'); setPreview([]); return }
    setPreview(rows)
  }

  const handleTextChange = (v: string) => {
    setCsvText(v)
    parseCSV(v)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setCsvText(text)
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!preview.length) return
    setImporting(true); setErr('')
    try {
      await membersService.bulkImport(preview)
      onSaved()
    } catch (e: any) {
      setErr(e.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }} transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #0a1c11, #06100a)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div>
              <p className="text-[11px] text-emerald-400/60 font-bold tracking-[0.2em] uppercase mb-0.5">CSV Import</p>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Bulk Import Members</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/70 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Format hint */}
            <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] text-white/35 font-bold tracking-[0.1em] uppercase mb-1.5">Expected CSV columns</p>
              <p className="text-xs text-emerald-400/70 font-mono">{HEADERS.join(', ')}</p>
              <p className="text-[11px] text-white/22 mt-1">Header row is optional. Required: <span className="text-white/45">name</span>, <span className="text-white/45">level</span></p>
            </div>

            {/* File upload */}
            <div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-3 rounded-xl border border-dashed border-white/[0.12] text-white/35 text-sm hover:border-emerald-500/30 hover:text-white/55 transition-all flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />Upload .csv file
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-xs text-white/20">or paste CSV</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            {/* Text input */}
            <textarea
              value={csvText}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={`name,email,phone,matricNumber,level,gender,stateOfOrigin\nAmara Osei,amara@uni.edu,+234...,CSC/2021/001,300,Female,Anambra`}
              rows={5}
              className={inputCls + ' resize-none font-mono text-xs'}
            />

            {(parseErr || err) && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <p className="text-rose-400 text-sm">{parseErr || err}</p>
              </div>
            )}

            {/* Preview table */}
            {preview.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-white/40 font-bold tracking-[0.12em] uppercase">Preview — {preview.length} members</p>
                  <button onClick={() => { setCsvText(''); setPreview([]) }} className="text-[11px] text-white/25 hover:text-white/45 transition-colors">Clear</button>
                </div>
                <div className="rounded-xl border border-white/[0.06] overflow-hidden max-h-48 overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        {['Name','Matric','Level','Gender'].map(h => (
                          <th key={h} className="py-2 px-3 text-left text-[10px] font-black text-white/20 tracking-[0.12em] uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] last:border-0">
                          <td className="py-1.5 px-3 text-white/65">{row.name || '—'}</td>
                          <td className="py-1.5 px-3 text-white/35">{row.matricNumber || '—'}</td>
                          <td className="py-1.5 px-3 text-white/35">{row.level ? `${row.level}L` : '—'}</td>
                          <td className="py-1.5 px-3 text-white/35">{row.gender || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3 shrink-0">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/45 text-sm font-semibold hover:text-white/70 transition-colors">
              Cancel
            </button>
            <button onClick={handleImport} disabled={importing || preview.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold disabled:opacity-40 hover:shadow-[0_4px_16px_rgba(13,124,61,0.35)] transition-all">
              {importing ? 'Importing…' : `Import ${preview.length} Members`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/* ═══════════════════════════ ROOT PAGE ═══════════════════════════ */
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState({ total: 0, byLevel: {} as Record<string, number>, byGender: {} as Record<string, number>, dues: { paid: 0, unpaid: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [genderFilter, setGenderFilter] = useState('ALL')
  const [duesFilter, setDuesFilter] = useState('ALL')
  const [session, setSession] = useState(currentAcademicYear())

  // Modals
  const [addModal, setAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [bulkModal, setBulkModal] = useState(false)
  const [duesTarget, setDuesTarget] = useState<Member | null>(null)

  const isAdmin = authService.isAdmin()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true); setError('')
    try {
      const [membersRes, statsRes] = await Promise.all([
        membersService.getMembers(),
        membersService.getStats(),
      ])
      setMembers(membersRes.members ?? [])
      setStats(statsRes)
    } catch (e: any) {
      setError(e.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This action cannot be undone.`)) return
    try {
      await membersService.deleteMember(id)
      setMembers(prev => prev.filter(m => m._id !== id))
    } catch (e: any) { alert(e.message || 'Failed to delete member') }
  }

  const getDuesStatus = (member: Member): boolean | null => {
    if (!member.dues?.length) return null
    const entry = member.dues.find(d => d.session === session)
    if (!entry) return null
    return entry.paid
  }

  const filteredMembers = members.filter(m => {
    const ms = !search || [m.name, m.email, m.matricNumber, m.phone].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    const ml = levelFilter === 'ALL' || m.level === levelFilter
    const mg = genderFilter === 'ALL' || m.gender === genderFilter
    let md = true
    if (duesFilter !== 'ALL') {
      const paid = getDuesStatus(m)
      if (duesFilter === 'PAID') md = paid === true
      else if (duesFilter === 'UNPAID') md = paid === false || paid === null
    }
    return ms && ml && mg && md
  })

  const statCards = [
    { value: stats.total, label: 'Total Members', color: '#e5e7eb', Icon: Users },
    { value: stats.byLevel['100'] ?? 0, label: '100 Level', color: '#60a5fa', Icon: GraduationCap },
    { value: (stats.byLevel['200'] ?? 0) + (stats.byLevel['300'] ?? 0) + (stats.byLevel['400'] ?? 0), label: '200–400 Level', color: '#f59e0b', Icon: GraduationCap },
    { value: stats.byLevel['500'] ?? 0, label: '500 Level', color: '#34d399', Icon: GraduationCap },
  ]

  const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
          animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Modals */}
      <AnimatePresence>
        {(addModal || editTarget) && (
          <AddMemberModal
            member={editTarget}
            onClose={() => { setAddModal(false); setEditTarget(null) }}
            onSaved={() => { setAddModal(false); setEditTarget(null); fetchAll() }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {bulkModal && (
          <BulkImportModal
            onClose={() => setBulkModal(false)}
            onSaved={() => { setBulkModal(false); fetchAll() }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {duesTarget && (
          <RecordDuesModal
            memberId={duesTarget._id}
            memberName={duesTarget.name}
            onClose={() => setDuesTarget(null)}
            onSaved={() => { setDuesTarget(null); fetchAll() }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Department</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Student Members
            </h1>
            <p className="text-sm text-white/30 mt-1">Track dues, levels, and member records</p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setBulkModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/[0.10] bg-white/[0.04] text-white/70 font-semibold text-sm hover:bg-white/[0.07] transition-all">
                <Upload className="w-3.5 h-3.5" />Bulk Import
              </motion.button>
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setAddModal(true)}
                className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm
                  shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                <UserPlus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Member</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <CountUp value={s.value} color={s.color} />
                </p>
                <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{s.label}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '14', border: `1px solid ${s.color}22` }}>
                <s.Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#06100a] border border-white/[0.06]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/45" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, matric, phone…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white text-sm placeholder:text-white/18 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Level */}
          <div className="relative">
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={selCls}>
              <option value="ALL" className="bg-[#06100a]">All Levels</option>
              {['100','200','300','400','500'].map(l => (
                <option key={l} value={l} className="bg-[#06100a]">{l}L</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
          </div>

          {/* Gender */}
          <div className="relative">
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className={selCls}>
              <option value="ALL" className="bg-[#06100a]">All Genders</option>
              {['Male','Female','Other'].map(g => (
                <option key={g} value={g} className="bg-[#06100a]">{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
          </div>

          {/* Dues status */}
          <div className="relative">
            <select value={duesFilter} onChange={e => setDuesFilter(e.target.value)} className={selCls}>
              <option value="ALL" className="bg-[#06100a]">All Dues</option>
              <option value="PAID" className="bg-[#06100a]">Paid</option>
              <option value="UNPAID" className="bg-[#06100a]">Unpaid</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
          </div>

          {/* Session input — only shown when dues filter is active */}
          {duesFilter !== 'ALL' && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0 }}>
              <input value={session} onChange={e => setSession(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 text-sm outline-none focus:border-emerald-500/40 transition-all w-28"
                placeholder="2024/2025" />
            </motion.div>
          )}
        </motion.div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm flex-1">{error}</p>
            <button onClick={fetchAll} className="text-xs text-rose-400/70 hover:text-rose-400 underline shrink-0">Retry</button>
          </motion.div>
        )}

        {/* ── Table ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Member','Level','Gender','Phone','Dues Status','Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Users className="w-10 h-10 text-white/8 mx-auto mb-3" />
                      <p className="text-white/22 text-sm">No members found</p>
                    </td>
                  </tr>
                ) : filteredMembers.map((member, i) => {
                  const color = getColor(member.name)
                  const duesPaid = getDuesStatus(member)
                  return (
                    <motion.tr key={member._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                      className="group border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors duration-200">

                      {/* Member */}
                      <td className="py-4 pl-5 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} color={color} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/82 group-hover:text-white transition-colors truncate">
                              {member.name}
                            </p>
                            {member.matricNumber && (
                              <div className="flex items-center gap-1 text-[11px] text-white/28 mt-0.5">
                                <Hash className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[140px]">{member.matricNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="py-4 px-4">
                        <LevelBadge level={member.level} />
                      </td>

                      {/* Gender */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-white/45">
                          <User className="w-3 h-3 text-white/20 shrink-0" />
                          {member.gender ?? <span className="text-white/20">—</span>}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        {member.phone ? (
                          <div className="flex items-center gap-1.5 text-sm text-white/45">
                            <Phone className="w-3 h-3 text-white/20 shrink-0" />
                            {member.phone}
                          </div>
                        ) : (
                          <span className="text-[11px] text-white/20">—</span>
                        )}
                      </td>

                      {/* Dues status */}
                      <td className="py-4 px-4">
                        <DuesBadge paid={duesPaid} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-5 pl-4">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit — admin only */}
                          {isAdmin && (
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => setEditTarget(member)}
                              title="Edit member"
                              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                              <Edit className="w-3.5 h-3.5" />
                            </motion.button>
                          )}

                          {/* Record dues — admin only */}
                          {isAdmin && (
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => setDuesTarget(member)}
                              title="Record dues"
                              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-amber-400 hover:border-amber-500/30 transition-all">
                              <Banknote className="w-3.5 h-3.5" />
                            </motion.button>
                          )}

                          {/* Delete — admin only */}
                          {isAdmin && (
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(member._id, member.name)}
                              title="Delete member"
                              className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-rose-400 hover:border-rose-500/30 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}

                          {/* View details chevron (all roles) */}
                          <motion.button whileTap={{ scale: 0.9 }}
                            title="View details"
                            className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/22 hover:text-white/55 transition-all">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredMembers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.05]">
              <span className="text-xs text-white/25">
                Showing <span className="text-white/50 font-semibold">{filteredMembers.length}</span> of <span className="text-white/50 font-semibold">{members.length}</span> members
              </span>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-white/15" />
                <span className="text-xs text-white/20">Session: <span className="text-white/40 font-medium">{session}</span></span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
