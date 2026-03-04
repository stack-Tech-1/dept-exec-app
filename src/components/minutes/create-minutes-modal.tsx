// src/components/minutes/create-minutes-modal.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Users, Calendar, MapPin, Clock, FileText, CheckCircle, Plus } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'

interface CreateMinutesModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateMinutes: (data: any) => Promise<void>
}

const inp = `w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.09]
  text-white text-sm placeholder:text-white/18 outline-none
  focus:border-emerald-500/45 focus:bg-white/[0.08] transition-all duration-200`

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/32 mb-1.5">{children}</p>
}

export default function CreateMinutesModal({ isOpen, onClose, onCreateMinutes }: CreateMinutesModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [minutesText, setMinutesText] = useState('')
  const [attendance, setAttendance] = useState('')
  const [session, setSession] = useState('2024/2025')
  const [semester, setSemester] = useState('First Semester')
  const [recordingFile, setRecordingFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const resetForm = () => {
    setTitle(''); setDate(''); setTime(''); setVenue('')
    setMinutesText(''); setAttendance(''); setRecordingFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !minutesText) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', title); fd.append('date', date); fd.append('time', time)
      fd.append('venue', venue); fd.append('minutesText', minutesText)
      fd.append('attendance', attendance); fd.append('session', session); fd.append('semester', semester)
      if (recordingFile) fd.append('recording', recordingFile)
      await onCreateMinutes(fd)
      setDone(true)
      setTimeout(() => { resetForm(); setDone(false); onClose() }, 800)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(3,10,5,0.84)', backdropFilter: 'blur(10px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose() }}>

          {/* Dark override for md-editor */}
          <style>{`
            .wmde-markdown-var { --color-canvas-default: #06100a !important; }
            .w-md-editor { background: #071510 !important; border: 1px solid rgba(255,255,255,0.09) !important; border-radius: 12px !important; }
            .w-md-editor-toolbar { background: #06100a !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; border-radius: 12px 12px 0 0 !important; }
            .w-md-editor-toolbar button { color: rgba(255,255,255,0.4) !important; }
            .w-md-editor-toolbar button:hover { color: rgba(255,255,255,0.8) !important; background: rgba(255,255,255,0.06) !important; border-radius: 6px; }
            .w-md-editor-text-textarea, .w-md-editor-text-pre > code { color: rgba(255,255,255,0.82) !important; }
            .w-md-editor-text { background: transparent !important; }
            .w-md-editor-area { background: transparent !important; }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 255, damping: 26 }}
            className="w-full max-w-4xl rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(13,124,61,0.12)',
            }}>

            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0d7c3d]/18 border border-[#0d7c3d]/25 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create Meeting Minutes</h2>
                  <p className="text-[11px] text-white/30">Record meeting details and minutes</p>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88, rotate: 90 }} onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/65 transition-colors">
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
              <div className="px-7 py-6 space-y-5">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Meeting Title *</Label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Executive Committee Meeting" className={inp} required />
                  </div>
                  <div>
                    <Label>Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className={`${inp} pl-10`} required />
                    </div>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="time" value={time} onChange={e => setTime(e.target.value)}
                        className={`${inp} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/45" />
                      <input type="text" value={venue} onChange={e => setVenue(e.target.value)}
                        placeholder="Zoom / Conference Room"
                        className={`${inp} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <Label>Academic Session</Label>
                    <select value={session} onChange={e => setSession(e.target.value)}
                      className={`${inp} appearance-none cursor-pointer`}>
                      {['2023/2024','2024/2025','2025/2026'].map(s => <option key={s} className="bg-[#07150f]">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <select value={semester} onChange={e => setSemester(e.target.value)}
                      className={`${inp} appearance-none cursor-pointer`}>
                      {['First Semester','Second Semester','Summer Session'].map(s => <option key={s} className="bg-[#07150f]">{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <Label><Users className="inline w-3.5 h-3.5 mr-1" />Attendance (JSON)</Label>
                  <textarea value={attendance} onChange={e => setAttendance(e.target.value)} rows={3}
                    placeholder={'[{"name": "John Doe", "role": "President"}, {"name": "Jane Smith", "role": "Secretary"}]'}
                    className={`${inp} resize-none font-mono text-xs`} />
                  <p className="text-[10px] text-white/22 mt-1">JSON array of {`{name, role}`} objects</p>
                </div>

                {/* Minutes rich text */}
                <div>
                  <Label>Minutes Text *</Label>
                  <div data-color-mode="dark">
                    <MDEditor value={minutesText} onChange={v => setMinutesText(v || '')} height={320} preview="edit" />
                  </div>
                </div>

                {/* Recording upload */}
                <div>
                  <Label><Upload className="inline w-3.5 h-3.5 mr-1" />Meeting Recording (Optional)</Label>
                  <label className="block cursor-pointer">
                    <input type="file" onChange={e => setRecordingFile(e.target.files?.[0] || null)}
                      className="hidden" accept=".mp4,.mov,.avi,.wmv,.mp3,.wav" />
                    <div className={`px-4 py-7 rounded-xl border-2 border-dashed text-center transition-all
                      ${recordingFile ? 'border-emerald-500/35 bg-emerald-500/06' : 'border-white/[0.08] hover:border-emerald-500/25 hover:bg-white/[0.02]'}`}>
                      <Upload className={`w-7 h-7 mx-auto mb-2 ${recordingFile ? 'text-emerald-400' : 'text-white/20'}`} />
                      <p className={`text-sm ${recordingFile ? 'text-emerald-400' : 'text-white/30'}`}>
                        {recordingFile ? recordingFile.name : 'Drop recording file or click to browse'}
                      </p>
                      <p className="text-[11px] text-white/18 mt-1">MP4, MOV, MP3, WAV up to 100MB</p>
                    </div>
                  </label>
                  {recordingFile && (
                    <button type="button" onClick={() => setRecordingFile(null)}
                      className="mt-2 text-xs text-rose-400/70 hover:text-rose-400 transition-colors font-semibold">
                      Remove file
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-7 py-5 border-t border-white/[0.05]">
                <button type="button" onClick={onClose} disabled={loading}
                  className="flex-1 py-3 rounded-2xl border border-white/[0.09] text-white/45 text-sm font-semibold hover:text-white/70 hover:border-white/18 transition-colors">
                  Cancel
                </button>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 relative overflow-hidden py-3 rounded-2xl
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-bold
                    shadow-[0_8px_24px_rgba(13,124,61,0.35)] disabled:opacity-50 disabled:cursor-not-allowed
                    hover:shadow-[0_12px_32px_rgba(13,124,61,0.45)] transition-shadow">
                  {!loading && <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }} />}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />Minutes Saved!
                        </motion.span>
                      ) : loading ? (
                        <motion.span key="spin" className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                          Saving…
                        </motion.span>
                      ) : (
                        <motion.span key="idle" className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />Create Minutes
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