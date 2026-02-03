// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\meetings\create-meeting-modal.tsx
'use client'

import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Users, Link as LinkIcon, FileText, Video, Building } from 'lucide-react'

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateMeeting: (data: any) => Promise<void>
}

export default function CreateMeetingModal({ isOpen, onClose, onCreateMeeting }: CreateMeetingModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [agenda, setAgenda] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [meetingType, setMeetingType] = useState<'zoom' | 'physical' | 'hybrid'>('physical')
  const [rsvpDeadline, setRsvpDeadline] = useState('')
  const [session, setSession] = useState('2024/2025')
  const [semester, setSemester] = useState('First Semester')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date || !time || !venue) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const meetingData = {
        title,
        date,
        time,
        venue,
        agenda,
        zoomLink: meetingType === 'zoom' || meetingType === 'hybrid' ? zoomLink : undefined,
        meetingType,
        rsvpDeadline,
        session,
        semester
      }

      await onCreateMeeting(meetingData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to create meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDate('')
    setTime('')
    setVenue('')
    setAgenda('')
    setZoomLink('')
    setMeetingType('physical')
    setRsvpDeadline('')
  }

  const handleMeetingTypeChange = (type: 'zoom' | 'physical' | 'hybrid') => {
    setMeetingType(type)
    if (type === 'physical') {
      setZoomLink('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Schedule Meeting</h2>
            <p className="text-sm text-gray-600 mt-1">Create a new department meeting</p>
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
            {/* Meeting Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Meeting Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleMeetingTypeChange('physical')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    meetingType === 'physical'
                      ? 'border-[#0d7c3d] bg-[#0d7c3d]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className={`h-6 w-6 ${
                    meetingType === 'physical' ? 'text-[#0d7c3d]' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">Physical</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMeetingTypeChange('zoom')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    meetingType === 'zoom'
                      ? 'border-[#0d7c3d] bg-[#0d7c3d]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className={`h-6 w-6 ${
                    meetingType === 'zoom' ? 'text-[#0d7c3d]' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">Zoom</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMeetingTypeChange('hybrid')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    meetingType === 'hybrid'
                      ? 'border-[#0d7c3d] bg-[#0d7c3d]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className={`h-6 w-6 ${
                    meetingType === 'hybrid' ? 'text-[#0d7c3d]' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium">Hybrid</span>
                </button>
              </div>
            </div>

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
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Venue / Zoom Details *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    placeholder={meetingType === 'zoom' ? 'Zoom Meeting Link' : 'Conference Room 302'}
                    required
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

            {/* Zoom Link (if zoom or hybrid) */}
            {(meetingType === 'zoom' || meetingType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  <LinkIcon className="inline h-4 w-4 mr-1" />
                  Zoom Meeting Link
                </label>
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>
            )}

            {/* RSVP Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                RSVP Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
              />
            </div>

            {/* Agenda */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                <FileText className="inline h-4 w-4 mr-1" />
                Agenda (Optional)
              </label>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm h-32"
                placeholder="1. Budget review...\n2. Upcoming events...\n3. Committee reports..."
              />
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
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}