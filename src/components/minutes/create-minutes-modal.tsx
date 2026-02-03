// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\minutes\create-minutes-modal.tsx
'use client'

import { useState } from 'react'
import { X, Upload, Users, Calendar, MapPin } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'


interface CreateMinutesModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateMinutes: (data: any) => Promise<void>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !minutesText) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('date', date)
      formData.append('time', time)
      formData.append('venue', venue)
      formData.append('minutesText', minutesText)
      formData.append('attendance', attendance)
      formData.append('session', session)
      formData.append('semester', semester)
      if (recordingFile) {
        formData.append('recording', recordingFile)
      }

      await onCreateMinutes(formData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating minutes:', error)
      alert('Failed to create minutes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDate('')
    setTime('')
    setVenue('')
    setMinutesText('')
    setAttendance('')
    setRecordingFile(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Meeting Minutes</h2>
            <p className="text-sm text-gray-600 mt-1">Record meeting details and minutes</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  placeholder="Executive Committee Meeting"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Venue
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    placeholder="Zoom / Conference Room"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Academic Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                >
                  <option>2023/2024</option>
                  <option>2024/2025</option>
                  <option>2025/2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                >
                  <option>First Semester</option>
                  <option>Second Semester</option>
                  <option>Summer Session</option>
                </select>
              </div>
            </div>

            {/* Attendance */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                <Users className="inline h-4 w-4 mr-1" />
                Attendance (JSON format)
              </label>
              <textarea
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm h-32"
                placeholder='[{"name": "John Doe", "role": "President"}, {"name": "Jane Smith", "role": "Secretary"}]'
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter as JSON array of objects with name and role properties
              </p>
            </div>

            {/* Minutes Text (Rich Text Editor) */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                    Minutes Text *
                </label>
                <MDEditor
                    value={minutesText}
                    onChange={(value) => setMinutesText(value || '')}
                    height={300}
                    preview="edit"
                />
                </div>

            {/* Recording Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                <Upload className="inline h-4 w-4 mr-1" />
                Meeting Recording (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setRecordingFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept=".mp4,.mov,.avi,.wmv,.mp3,.wav"
                  />
                  <div className="px-4 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-[#0d7c3d]/30 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {recordingFile ? recordingFile.name : 'Drop recording file here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">MP4, MOV, MP3, WAV up to 100MB</p>
                  </div>
                </label>
                {recordingFile && (
                  <button
                    type="button"
                    onClick={() => setRecordingFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Minutes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}