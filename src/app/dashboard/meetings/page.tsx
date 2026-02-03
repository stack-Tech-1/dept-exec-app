// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\meetings\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Video, MapPin, Users, Clock, Plus, CheckCircle, UserCheck, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import CreateMeetingModal from '@/components/meetings/create-meeting-modal'
import { meetingsService, type Meeting } from '@/services/meetings'
import { authService } from '@/services/auth'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'attending' | 'not_attending' | 'maybe'>>({})
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    fetchMeetings()
    // Load user's RSVP status from localStorage
    const savedRsvp = localStorage.getItem('meeting_rsvp')
    if (savedRsvp) {
      setRsvpStatus(JSON.parse(savedRsvp))
    }
  }, [])

  const fetchMeetings = async () => {
    try {
      const data = await meetingsService.getAllMeetings()
      setMeetings(data)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async (newMeeting: any) => {
    try {
      await meetingsService.createMeeting(newMeeting)
      fetchMeetings() // Refresh list
    } catch (error) {
      console.error('Failed to create meeting:', error)
    }
  }

  const handleRsvp = async (meetingId: string, status: 'attending' | 'not_attending' | 'maybe') => {
    try {
      await meetingsService.updateRsvp(meetingId, status)
      
      // Update local state
      setRsvpStatus(prev => {
        const updated = { ...prev, [meetingId]: status }
        localStorage.setItem('meeting_rsvp', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error('Failed to update RSVP:', error)
    }
  }

  const getMeetingType = (venue: string) => {
    if (venue.toLowerCase().includes('zoom')) return 'zoom'
    if (venue.toLowerCase().includes('+') || venue.toLowerCase().includes('hybrid')) return 'hybrid'
    return 'physical'
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesType = selectedType === 'All' || getMeetingType(meeting.venue) === selectedType.toLowerCase()
    const matchesSearch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.agenda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.createdBy?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    return matchesType && matchesSearch
  })

  // Group meetings by date
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const upcomingMeetings = filteredMeetings.filter(m => new Date(m.date) >= today)
  const pastMeetings = filteredMeetings.filter(m => new Date(m.date) < today)

  return (
    <div className="space-y-6">
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMeeting={handleCreateMeeting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-sm text-gray-600 mt-1">Schedule, track, and join department meetings</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings, venues..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Types</option>
            <option>Zoom</option>
            <option>Physical</option>
            <option>Hybrid</option>
          </select>
          
          <button className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0d7c3d]/5 border border-[#0d7c3d]/20 text-[#0d7c3d] font-medium rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Calendar View</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Upcoming</div>
          <div className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Today</div>
          <div className="text-2xl font-bold text-blue-600">
            {upcomingMeetings.filter(m => format(new Date(m.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">My RSVPs</div>
          <div className="text-2xl font-bold text-emerald-600">
            {Object.values(rsvpStatus).filter(s => s === 'attending').length}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Zoom Meetings</div>
          <div className="text-2xl font-bold text-purple-600">
            {meetings.filter(m => getMeetingType(m.venue) === 'zoom').length}
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d7c3d] mx-auto"></div>
          </div>
        ) : upcomingMeetings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-100">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">No upcoming meetings</h3>
            <p className="text-gray-500 mt-1">Schedule a new meeting to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingMeetings.map((meeting) => {
              const type = getMeetingType(meeting.venue)
              const TypeIcon = type === 'zoom' ? Video : type === 'hybrid' ? Users : MapPin
              const isToday = format(new Date(meeting.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
              const isTomorrow = format(new Date(meeting.date), 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')
              
              return (
                <div key={meeting.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${
                          type === 'zoom' ? 'bg-blue-100 text-blue-600' :
                          type === 'hybrid' ? 'bg-purple-100 text-purple-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isToday ? 'bg-amber-50 text-amber-700' :
                          isTomorrow ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : format(new Date(meeting.date), 'MMM d')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{meeting.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(meeting.date), 'EEEE, MMMM d, yyyy')} at {meeting.time}</span>
                    </div>
                    {meeting.agenda && (
                      <p className="text-sm text-gray-600 line-clamp-2">{meeting.agenda}</p>
                    )}
                  </div>

                  {/* RSVP Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleRsvp(meeting.id, 'attending')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                        rsvpStatus[meeting.id] === 'attending'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Attending
                    </button>
                    <button
                      onClick={() => handleRsvp(meeting.id, 'maybe')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                        rsvpStatus[meeting.id] === 'maybe'
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      Maybe
                    </button>
                    <button
                      onClick={() => handleRsvp(meeting.id, 'not_attending')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                        rsvpStatus[meeting.id] === 'not_attending'
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      Can't Attend
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-sm font-medium rounded-lg hover:shadow-[#0d7c3d]/20 transition-all">
                      Join Meeting
                    </button>
                    <button 
                      onClick={() => window.location.href = `/dashboard/minutes/create?meeting=${meeting.id}`}
                      className="py-2 px-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Add Minutes
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Past Meetings</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-900 uppercase">Meeting</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-900 uppercase">Date</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-900 uppercase">Type</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-900 uppercase">Minutes</th>
                    <th className="py-3 px-6 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastMeetings.map((meeting) => {
                    const type = getMeetingType(meeting.venue)
                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{meeting.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{meeting.venue}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{format(new Date(meeting.date), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-gray-500">{meeting.time}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            type === 'zoom' ? 'bg-blue-50 text-blue-700' :
                            type === 'hybrid' ? 'bg-purple-50 text-purple-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {type === 'zoom' ? <Video className="h-3 w-3" /> :
                             type === 'hybrid' ? <Users className="h-3 w-3" /> :
                             <MapPin className="h-3 w-3" />}
                            <span className="capitalize">{type}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {meeting.minutesId ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              Recorded
                            </span>
                          ) : (
                            <button 
                              onClick={() => window.location.href = `/dashboard/minutes/create?meeting=${meeting.id}`}
                              className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium"
                            >
                              Add Minutes
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              View Recording
                            </button>
                            {currentUser?.role === 'ADMIN' && (
                              <button className="text-rose-600 hover:text-rose-800 text-sm">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}