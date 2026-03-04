// src/app/dashboard/reports/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Download, TrendingUp, Users, Target, Calendar,
  CheckCircle, AlertCircle, Clock, ChevronDown, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { reportsService, type DepartmentReport, type TaskReport, type MeetingReport, type GoalReport } from '@/services/reports'
import { authService } from '@/services/auth'

/* ─── Colors ──────────────────────────────────────── */
const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#f43f5e','#34d399']

const TOOLTIP_STYLE = {
  contentStyle: { background: '#07150f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  itemStyle: { color: 'rgba(255,255,255,0.7)' },
  labelStyle: { color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}
const AXIS_STYLE = { stroke: 'rgba(255,255,255,0.12)', fontSize: 11, fill: 'rgba(255,255,255,0.3)' }

/* ─── Count-up chip ──────────────────────────────── */
function StatChip({ value, label, color, Icon, delay = 0 }: { value: number | string; label: string; color: string; Icon: any; delay?: number }) {
  const numVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (numVal === 0) return
    const t = setTimeout(() => {
      let i = 0; const inc = numVal / 24
      const id = setInterval(() => { i += inc; if (i >= numVal) { setCount(numVal); clearInterval(id) } else setCount(Math.floor(i)) }, 42)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, [numVal, delay])
  const display = typeof value === 'string' && value.includes('%') ? `${count}%` : count
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay / 1000 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
      <div>
        <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif', color }}>{display}</p>
        <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{label}</p>
      </div>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '14', border: `1px solid ${color}22` }}>
        <Icon style={{ width: 16, height: 16, color }} />
      </div>
    </motion.div>
  )
}

/* ─── Chart card ─────────────────────────────────── */
function ChartCard({ title, subtitle, onExport, children }: { title: string; subtitle?: string; onExport?: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-5"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-white/85" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h3>
          {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
        </div>
        {onExport && (
          <button onClick={onExport}
            className="text-[11px] text-emerald-400/70 hover:text-emerald-400 font-bold transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" />Export
          </button>
        )}
      </div>
      {children}
    </motion.div>
  )
}

/* ─── Mini stat row ──────────────────────────────── */
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif', color }}>{value}</p>
      <p className="text-[10px] text-white/28 font-bold tracking-[0.1em] uppercase">{label}</p>
    </div>
  )
}

const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
  text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [departmentReport, setDepartmentReport] = useState<DepartmentReport | null>(null)
  const [taskReport, setTaskReport] = useState<TaskReport | null>(null)
  const [meetingReport, setMeetingReport] = useState<MeetingReport | null>(null)
  const [goalReport, setGoalReport] = useState<GoalReport | null>(null)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const currentUser = authService.getCurrentUser()

  useEffect(() => { fetchReports() }, [period])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const [dept, tasks, meetings, goals] = await Promise.all([
        reportsService.getDepartmentReport(period),
        reportsService.getTaskReport(),
        reportsService.getMeetingReport(),
        reportsService.getGoalReport(),
      ])
      setDepartmentReport(dept); setTaskReport(tasks); setMeetingReport(meetings); setGoalReport(goals)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleExport = async (type: 'tasks' | 'meetings' | 'goals' | 'department') => {
    try {
      const blob = await reportsService.exportReport(type, 'pdf')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a)
    } catch { alert('Failed to export report') }
  }

  const HEALTH_CFG = { excellent: { color: '#10b981', bg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' }, good: { color: '#60a5fa', bg: 'bg-sky-400/10 text-sky-400 border-sky-400/20' }, fair: { color: '#f59e0b', bg: 'bg-amber-400/10 text-amber-400 border-amber-400/20' }, poor: { color: '#f43f5e', bg: 'bg-rose-400/10 text-rose-400 border-rose-400/20' } }

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

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Intelligence</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Analytics</h1>
            <p className="text-sm text-white/30 mt-1">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-2.5 self-start">
            <div className="relative">
              <select value={period} onChange={e => setPeriod(e.target.value as any)} className={selCls}>
                {[['week','Last Week'],['month','Last Month'],['quarter','Last Quarter'],['year','Last Year']].map(([v,l]) => (
                  <option key={v} value={v} className="bg-[#06100a] text-white">{l}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
            {currentUser?.role === 'ADMIN' && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleExport('department')}
                className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm
                  shadow-[0_6px_20px_rgba(13,124,61,0.35)]">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Export</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Dept Health Banner ── */}
        {departmentReport && (() => {
          const health = departmentReport.summary.departmentHealth
          const hcfg = HEALTH_CFG[health as keyof typeof HEALTH_CFG] ?? HEALTH_CFG.good
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-5"
              style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.28), inset 0 0 0 1px ${hcfg.color}18` }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>Department Health Dashboard</h2>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {format(new Date(departmentReport.period.start), 'MMM d')} – {format(new Date(departmentReport.period.end), 'MMM d, yyyy')}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-black border ${hcfg.bg}`}>
                  {health.charAt(0).toUpperCase() + health.slice(1)} Health
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatChip value={departmentReport.summary.overallProductivity} label="Productivity" color="#10b981" Icon={TrendingUp} delay={0} />
                <StatChip value={departmentReport.summary.totalTasks} label="Total Tasks" color="#60a5fa" Icon={CheckCircle} delay={60} />
                <StatChip value={departmentReport.summary.totalMeetings} label="Meetings" color="#a78bfa" Icon={Calendar} delay={120} />
                <StatChip value={departmentReport.summary.totalGoals} label="Active Goals" color="#f59e0b" Icon={Target} delay={180} />
              </div>
            </motion.div>
          )
        })()}

        {/* ── Charts Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Task Completion */}
          {taskReport && (
            <ChartCard title="Task Completion" subtitle={`${taskReport.completionRate}% completion rate`} onExport={() => handleExport('tasks')}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskReport.weeklyTrend} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" {...AXIS_STYLE} />
                    <YAxis {...AXIS_STYLE} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                    <Bar dataKey="created"   name="Created"   fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.05]">
                <MiniStat label="Total" value={taskReport.total} color="#e5e7eb" />
                <MiniStat label="Done" value={taskReport.completed} color="#10b981" />
                <MiniStat label="Overdue" value={taskReport.overdue} color="#f59e0b" />
                <MiniStat label="Active" value={taskReport.inProgress} color="#60a5fa" />
              </div>
            </ChartCard>
          )}

          {/* Meeting Attendance */}
          {meetingReport && (
            <ChartCard title="Meeting Analytics" subtitle={`${meetingReport.attendanceRate}% attendance rate`} onExport={() => handleExport('meetings')}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(meetingReport.rsvpStats).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }))}
                      cx="50%" cy="50%" outerRadius={80} labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      dataKey="value">
                      {Object.entries(meetingReport.rsvpStats).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/[0.05]">
                <MiniStat label="Total" value={meetingReport.total} color="#e5e7eb" />
                <MiniStat label="Upcoming" value={meetingReport.upcoming} color="#10b981" />
                <MiniStat label="Past" value={meetingReport.past} color="#60a5fa" />
              </div>
            </ChartCard>
          )}

          {/* Goal Progress */}
          {goalReport && (
            <ChartCard title="Goal Progress" subtitle={`${goalReport.averageProgress}% average progress`} onExport={() => handleExport('goals')}>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(goalReport.byCategory).map(([cat, data]) => ({ category: cat.charAt(0).toUpperCase() + cat.slice(1), count: data.count, progress: data.avgProgress }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="category" {...AXIS_STYLE} />
                    <YAxis {...AXIS_STYLE} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }} />
                    <Bar dataKey="count"    name="Goals"        fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar dataKey="progress" name="Avg Progress %" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/[0.05]">
                <MiniStat label="Total" value={goalReport.total} color="#e5e7eb" />
                <MiniStat label="Done" value={goalReport.completed} color="#10b981" />
                <MiniStat label="At Risk" value={goalReport.atRisk} color="#f59e0b" />
                <MiniStat label="Active" value={goalReport.inProgress} color="#60a5fa" />
              </div>
            </ChartCard>
          )}

          {/* Top Performers */}
          {departmentReport && departmentReport.topPerformers.length > 0 && (
            <ChartCard title="Top Performers">
              <div className="space-y-2.5">
                {departmentReport.topPerformers.map((p, i) => {
                  const ringColors = ['#f59e0b','#9ca3af','#b45309']
                  const rc = ringColors[i] ?? '#10b981'
                  return (
                    <motion.div key={p.userId}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.07 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                          style={{ background: rc + '22', border: `2px solid ${rc}45`, color: rc }}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/80">{p.userName}</p>
                          <p className="text-[11px] text-white/28">{p.userPosition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black" style={{ fontFamily: 'Syne, sans-serif', color: rc }}>{p.overallScore}%</p>
                        <p className="text-[10px] text-white/22 font-bold uppercase tracking-wider">Score</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ChartCard>
          )}
        </div>

        {/* ── Recommendations ── */}
        {departmentReport && departmentReport.recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-5"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>
            <h3 className="text-sm font-black text-white/80 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Recommendations
            </h3>
            <div className="space-y-2.5">
              {departmentReport.recommendations.map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#0d7c3d]/08 border border-[#0d7c3d]/15">
                  <div className="w-5 h-5 rounded-full bg-[#0d7c3d]/25 border border-[#0d7c3d]/35 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  )
}