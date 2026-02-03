// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\reports\page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  Download, Filter, TrendingUp, Users, Target, Calendar,
  CheckCircle, AlertCircle, Clock, TrendingDown
} from 'lucide-react'
import { format } from 'date-fns'
import { reportsService, type DepartmentReport, type TaskReport, type MeetingReport, type GoalReport } from '@/services/reports'
import { authService } from '@/services/auth'

const COLORS = ['#0d7c3d', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981']

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [departmentReport, setDepartmentReport] = useState<DepartmentReport | null>(null)
  const [taskReport, setTaskReport] = useState<TaskReport | null>(null)
  const [meetingReport, setMeetingReport] = useState<MeetingReport | null>(null)
  const [goalReport, setGoalReport] = useState<GoalReport | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const currentUser = authService.getCurrentUser()
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async () => {
    try {
      setLoading(true)
      
      const [deptReport, tasks, meetings, goals] = await Promise.all([
        reportsService.getDepartmentReport(period),
        reportsService.getTaskReport(),
        reportsService.getMeetingReport(),
        reportsService.getGoalReport()
      ])

      setDepartmentReport(deptReport)
      setTaskReport(tasks)
      setMeetingReport(meetings)
      setGoalReport(goals)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'tasks' | 'meetings' | 'goals' | 'department') => {
    try {
      const blob = await reportsService.exportReport(type, 'pdf')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Department Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white border border-gray-300 text-[#0d7c3d] font-medium rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] cursor-pointer text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <button className="inline-flex items-center gap-2 px-3 py-2 bg-[#0d7c3d]/5 border border-[#0d7c3d]/20 text-[#0d7c3d] font-medium rounded-xl hover:bg-[#0d7c3d]/10 transition-colors text-sm">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => handleExport('department')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Health Summary */}
      {departmentReport && (
        <div className="bg-gradient-to-br from-[#0d7c3d]/5 via-white to-[#0a5a2d]/5 rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Department Health Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">
                Period: {format(new Date(departmentReport.period.start), 'MMM d')} - {format(new Date(departmentReport.period.end), 'MMM d, yyyy')}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              departmentReport.summary.departmentHealth === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
              departmentReport.summary.departmentHealth === 'good' ? 'bg-blue-100 text-blue-700' :
              departmentReport.summary.departmentHealth === 'fair' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {departmentReport.summary.departmentHealth.charAt(0).toUpperCase() + departmentReport.summary.departmentHealth.slice(1)} Health
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Productivity Score</div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{departmentReport.summary.overallProductivity}%</div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Tasks</div>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{departmentReport.summary.totalTasks}</div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Meetings</div>
                <Calendar className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{departmentReport.summary.totalMeetings}</div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Goals</div>
                <Target className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{departmentReport.summary.totalGoals}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        {taskReport && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Task Completion</h3>
                <p className="text-sm text-gray-600 mt-1">Completion rate: {taskReport.completionRate}%</p>
              </div>
              <button 
                onClick={() => handleExport('tasks')}
                className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium"
              >
                Export
              </button>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskReport.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => [value, 'Tasks']}
                    labelFormatter={(label) => `Week ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="created" name="Created" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#0d7c3d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{taskReport.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{taskReport.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{taskReport.overdue}</div>
                <div className="text-xs text-gray-600">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{taskReport.inProgress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Attendance Chart */}
        {meetingReport && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Meeting Analytics</h3>
                <p className="text-sm text-gray-600 mt-1">Attendance rate: {meetingReport.attendanceRate}%</p>
              </div>
              <button 
                onClick={() => handleExport('meetings')}
                className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium"
              >
                Export
              </button>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={Object.entries(meetingReport.rsvpStats).map(([key, value]) => ({
                      name: key.charAt(0).toUpperCase() + key.slice(1),
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      // Add null check for percent
                      const percentage = percent !== undefined ? (percent * 100).toFixed(0) : '0';
                      return `${name}: ${percentage}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(meetingReport.rsvpStats).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Responses']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{meetingReport.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{meetingReport.upcoming}</div>
                <div className="text-xs text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{meetingReport.past}</div>
                <div className="text-xs text-gray-600">Past</div>
              </div>
            </div>
          </div>
        )}

        {/* Goal Progress Chart */}
        {goalReport && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-900">Goal Progress</h3>
                <p className="text-sm text-gray-600 mt-1">Average progress: {goalReport.averageProgress}%</p>
              </div>
              <button 
                onClick={() => handleExport('goals')}
                className="text-[#0d7c3d] hover:text-[#0a5a2d] text-sm font-medium"
              >
                Export
              </button>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(goalReport.byCategory).map(([category, data]) => ({
                  category: category.charAt(0).toUpperCase() + category.slice(1),
                  count: data.count,
                  progress: data.avgProgress
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'count') return [value, 'Goals']
                      return [value, 'Avg Progress %']
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Number of Goals" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="progress" name="Average Progress %" fill="#0d7c3d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{goalReport.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{goalReport.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{goalReport.atRisk}</div>
                <div className="text-xs text-gray-600">At Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{goalReport.inProgress}</div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {departmentReport && departmentReport.topPerformers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Top Performers</h3>
            
            <div className="space-y-4">
              {departmentReport.topPerformers.map((performer, index) => (
                <div key={performer.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{performer.userName}</div>
                      <div className="text-xs text-gray-600">{performer.userPosition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{performer.overallScore}%</div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      {departmentReport && departmentReport.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
          
          <div className="space-y-3">
            {departmentReport.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}