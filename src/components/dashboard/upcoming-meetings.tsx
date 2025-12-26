// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\dashboard\upcoming-meetings.tsx
'use client'

import { useEffect, useState } from 'react'
import { Calendar, Video, MapPin, Users, Clock, Plus } from 'lucide-react'
import { dashboardService, Meeting } from '@/services/dashboard'
import { format } from 'date-fns'

const meetingTypeColors = {
  zoom: 'bg-blue-100 text-blue-700',
  physical: 'bg-emerald-100 text-emerald-700',
  hybrid: 'bg-purple-100 text-purple-700',
}

const meetingTypeIcons = {
  zoom: Video,
  physical: MapPin,
  hybrid: Users,
}

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingMeetings()
  }, [])

  const fetchUpcomingMeetings = async () => {
    try {
      const data = await dashboardService.getUpcomingMeetings(3)
      setMeetings(data)
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }

  function getTimeFromNow(dateString: string): string {
    return dashboardService.getTimeFromNow(dateString)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-100 animate-pulse">
          <div className="space-y-2">
            <div className="h-5 w-32 sm:w-40 bg-gray-200 rounded"></div>
            <div className="h-3.5 w-40 sm:w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 sm:p-6 border-b border-gray-100 animate-pulse">
            <div className="space-y-3 sm:space-y-4">
              <div className="h-3.5 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-36 sm:w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const displayMeetings = meetings.length > 0 ? meetings : [
    {
      id: '1',
      title: 'Executive Committee Meeting',
      date: '2024-12-15T14:00:00',
      time: '14:00',
      venue: 'cs-dept/exec-meeting',
      approved: false,
      createdBy: { id: '1', name: 'Admin' },
      session: '2024/2025',
      semester: 'First Semester'
    },
    {
      id: '2',
      title: 'Faculty Advisor Briefing',
      date: '2024-12-18T10:00:00',
      time: '10:00',
      venue: 'CS Conference Room',
      approved: false,
      createdBy: { id: '1', name: 'Admin' },
      session: '2024/2025',
      semester: 'First Semester'
    },
    {
      id: '3',
      title: 'Department Orientation Planning',
      date: '2024-12-20T15:30:00',
      time: '15:30',
      venue: 'Zoom + Room 302',
      approved: false,
      createdBy: { id: '1', name: 'Admin' },
      session: '2024/2025',
      semester: 'First Semester'
    },
  ]

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
            <p className="text-sm text-gray-500 mt-1">This week's scheduled meetings</p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard/minutes/create'}
            className="inline-flex items-center gap-1 text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium self-start sm:self-center"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Schedule</span>
          </button>
        </div>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {displayMeetings.map((meeting) => {
            let meetingType: 'zoom' | 'physical' | 'hybrid' = 'physical'
            if (meeting.venue.toLowerCase().includes('zoom')) {
              meetingType = 'zoom'
            } else if (meeting.venue.toLowerCase().includes('+') || meeting.venue.toLowerCase().includes('hybrid')) {
              meetingType = 'hybrid'
            }
            
            const TypeIcon = meetingTypeIcons[meetingType]
            const timeFromNow = getTimeFromNow(meeting.date)
            const isUrgent = timeFromNow === 'Today' || timeFromNow === 'Tomorrow'
            
            return (
              <div key={meeting.id} className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Date Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#0d7c3d]/10 to-[#0a5a2d]/5 flex flex-col items-center justify-center">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#0d7c3d] mb-0.5" />
                      <span className="text-xs font-bold text-gray-900">
                        {format(new Date(meeting.date), 'dd')}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-gray-500">
                        {format(new Date(meeting.date), 'MMM')}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {/* Title and meta row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {meeting.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5 sm:mt-1">
                          <span className="text-xs text-[#0d7c3d] font-medium bg-[#0d7c3d]/10 px-1.5 py-0.5 rounded">
                            {timeFromNow}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${meetingTypeColors[meetingType]}`}>
                            <TypeIcon className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">
                              {meetingType.charAt(0).toUpperCase() + meetingType.slice(1)}
                            </span>
                          </span>
                          {isUrgent && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium">
                              ⚠️ <span className="hidden sm:inline">Urgent</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {meeting.time}
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                      {meeting.venue}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <button 
                        onClick={() => window.location.href = `/dashboard/minutes/${meeting.id}`}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white text-xs font-medium rounded-lg hover:shadow-[#0d7c3d]/20 transition-all duration-200 flex-1 min-w-[100px]"
                      >
                        View Details
                      </button>
                      <button className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex-1 min-w-[100px]">
                        Join Meeting
                      </button>
                    </div>

                    {/* Time indicator */}
                    <div className="mt-2 sm:mt-3">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5 sm:mb-1">
                        <span>{format(new Date(meeting.date), 'MMM d')}</span>
                        <span>{format(new Date(`${meeting.date.split('T')[0]}T${meeting.time}`), 'h:mm a')}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]"
                          style={{ width: isUrgent ? '90%' : '60%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Footer with quick action */}
      <div className="p-3 sm:p-4 border-t border-gray-100">
        <button 
          onClick={() => window.location.href = '/dashboard/minutes/create'}
          className="w-full py-2 sm:py-2.5 border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl text-gray-500 hover:text-[#0d7c3d] hover:border-[#0d7c3d]/30 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
        >
          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Add Meeting from Calendar
        </button>
      </div>
    </div>
  )
}