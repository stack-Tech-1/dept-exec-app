// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\minutes\page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, FileText, Download, CheckCircle, Clock, AlertCircle, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import CreateMinutesModal from '@/components/minutes/create-minutes-modal'
import ResponsiveTable from '@/components/ui/responsive-table'
import { minutesService, type MinutesRecord } from '@/services/minutes'
import { authService } from '@/services/auth'

export default function MinutesPage() {
  const [mounted, setMounted] = useState(false)
  const [minutes, setMinutes] = useState<MinutesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSession, setSelectedSession] = useState('All')
  const [selectedSemester, setSelectedSemester] = useState('All')
  

  useEffect(() => {
    setMounted(true)
    fetchMinutes()
  }, [])

  const fetchMinutes = async () => {
    try {
      const data = await minutesService.getAllMinutes()
      setMinutes(data)
    } catch (error) {
      console.error('Failed to fetch minutes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMinutes = async (newMinutes: any) => {
    try {
      await minutesService.createMinutes(newMinutes)
      fetchMinutes() // Refresh list
    } catch (error) {
      console.error('Failed to create minutes:', error)
    }
  }

  const handleApproveMinutes = async (id: string) => {
    if (!confirm('Are you sure you want to approve these minutes? Approved minutes cannot be edited.')) return
    
    try {
      await minutesService.approveMinutes(id)
      fetchMinutes() // Refresh list
    } catch (error) {
      console.error('Failed to approve minutes:', error)
    }
  }

  const handleDeleteMinutes = async (id: string) => {
    if (!confirm('Are you sure you want to delete these minutes? This action cannot be undone.')) return
    
    try {
      await minutesService.deleteMinutes(id)
      fetchMinutes() // Refresh list
    } catch (error) {
      console.error('Failed to delete minutes:', error)
    }
  }

  // Filter minutes
  const filteredMinutes = minutes.filter(record => {
    const matchesSession = selectedSession === 'All' || record.session === selectedSession
    const matchesSemester = selectedSemester === 'All' || record.semester === selectedSemester
    const matchesSearch = searchQuery === '' || 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.minutesText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.createdBy?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    return matchesSession && matchesSemester && matchesSearch
  })

  // Get unique sessions and semesters for filters
  const sessions = Array.from(new Set(minutes.map(m => m.session))).filter(Boolean)
  const semesters = Array.from(new Set(minutes.map(m => m.semester))).filter(Boolean)

  const currentUser = authService.getCurrentUser()

  // Prevent hydration mismatch by returning null or a skeleton 
  // until the client-side code has taken over
  if (!mounted) return null

  // Function to render each row
  const renderRow = (record: MinutesRecord) => {
    return (
      <>
        <td key="meeting" className="py-3 px-3 sm:py-4 sm:px-6">
          <div>
            <div className="font-medium text-gray-900 text-sm sm:text-base">
              {record.title}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 mt-1">
              <span>Session: {record.session}</span>
              <span>•</span>
              <span>{record.semester}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Created by: {record.createdBy?.name || 'Unknown'}
            </div>
          </div>
        </td>
        <td key="date" className="py-3 px-3 sm:py-4 sm:px-6">
          <div className="text-xs sm:text-sm">
            <div className="text-gray-900">{format(new Date(record.date), 'MMM d, yyyy')}</div>
            <div className="text-gray-500">{record.time}</div>
          </div>
        </td>
        <td key="venue" className="py-3 px-3 sm:py-4 sm:px-6">
          <div className="text-xs sm:text-sm text-gray-900 max-w-[150px] truncate">
            {record.venue}
          </div>
        </td>
        <td key="status" className="py-3 px-3 sm:py-4 sm:px-6">
          {record.approved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              <CheckCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Approved</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Pending Review</span>
            </span>
          )}
        </td>
        <td key="actions" className="py-3 px-3 sm:py-4 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => window.open(`/dashboard/minutes/${record.id}`, '_blank')}
              className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            
            {record.approved && (
              <button 
                onClick={() => window.open(`/api/minutes/${record.id}/download`, '_blank')}
                className="p-1 sm:p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                title="Download PDF"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}
            
            {currentUser?.role === 'ADMIN' && !record.approved && (
              <>
                <button 
                  onClick={() => window.location.href = `/dashboard/minutes/edit/${record.id}`}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button 
                  onClick={() => handleApproveMinutes(record.id)}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteMinutes(record.id)}
                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </>
            )}
          </div>
        </td>
      </>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Minutes Modal */}
      <CreateMinutesModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateMinutes={handleCreateMinutes}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Meeting Minutes</h1>
          <p className="text-sm text-gray-600 mt-1">Record, approve, and access all meeting minutes</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium py-2.5 px-4 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Minutes</span>
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Minutes</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{minutes.length}</div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-600">
            {minutes.filter(m => m.approved).length}
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Pending Review</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600">
            {minutes.filter(m => !m.approved).length}
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">This Semester</div>
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {minutes.filter(m => m.semester === 'First Semester 2024/2025').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search minutes, titles..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 text-black rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Sessions</option>
            {sessions.map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
          
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option>All Semesters</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>{semester}</option>
            ))}
          </select>
        </div>
        
        <button className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#0d7c3d]/5 border border-[#0d7c3d]/20 text-[#0d7c3d] font-medium rounded-lg sm:rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Minutes Table - USING RESPONSIVE TABLE */}
      {loading ? (
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d7c3d] mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading minutes...</p>
        </div>
      ) : filteredMinutes.length === 0 ? (
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-medium">No minutes found</h3>
          <p className="text-gray-500 mt-1">Get started by adding your first meeting minutes</p>
        </div>
      ) : (
        <ResponsiveTable
          headers={[
            { key: 'meeting', label: 'Meeting', mobileLabel: 'Meeting' },
            { key: 'date', label: 'Date & Time', mobileLabel: 'Date' },
            { key: 'venue', label: 'Venue', mobileLabel: 'Venue' },
            { key: 'status', label: 'Status', mobileLabel: 'Status' },
            { key: 'actions', label: 'Actions', mobileLabel: 'Actions', className: 'text-right' }
          ]}
          data={filteredMinutes}
          emptyMessage="No minutes found"
          renderRow={renderRow}
        />
      )}
    </div>
  )
}