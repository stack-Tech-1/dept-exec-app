// src/components/dashboard/upcoming-meetings.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Video, MapPin, Users, Clock, Plus, ArrowRight, Zap, Calendar } from 'lucide-react'
import { dashboardService, Meeting } from '@/services/dashboard'
import { format } from 'date-fns'
import Link from 'next/link'

/* ─── Meeting type config ────────────────────────── */
const TYPE_CONFIG = {
  zoom:     { icon: Video,   label: 'Virtual',  color: '#60a5fa', bg: 'bg-blue-400/10 text-blue-400' },
  physical: { icon: MapPin,  label: 'In-Person', color: '#34d399', bg: 'bg-emerald-400/10 text-emerald-400' },
  hybrid:   { icon: Users,   label: 'Hybrid',   color: '#a78bfa', bg: 'bg-violet-400/10 text-violet-400' },
}

function getMeetingType(venue: string): keyof typeof TYPE_CONFIG {
  const v = venue.toLowerCase()
  if (v.includes('zoom')) return 'zoom'
  if (v.includes('+') || v.includes('hybrid')) return 'hybrid'
  return 'physical'
}

/* ─── Single meeting card (timeline item) ────────── */
function MeetingItem({ meeting, index, isLast }: { meeting: Meeting; index: number; isLast: boolean }) {
  const type = getMeetingType(meeting.venue)
  const cfg = TYPE_CONFIG[type]
  const TypeIcon = cfg.icon

  const timeFromNow = dashboardService.getTimeFromNow(meeting.date)
  const isUrgent = timeFromNow === 'Today' || timeFromNow === 'Tomorrow'

  const meetingDate = new Date(meeting.date)

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
      className="relative flex gap-4 group"
    >
      {/* Timeline thread */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 32 }}>
        {/* Node */}
        <motion.div
          className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center border"
          style={{
            background: `${cfg.color}15`,
            borderColor: `${cfg.color}30`,
          }}
          whileHover={{ scale: 1.1 }}
        >
          {isUrgent && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{ background: cfg.color, opacity: 0.12 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0, 0.12] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <TypeIcon style={{ width: 14, height: 14, color: cfg.color }} />
        </motion.div>

        {/* Thread */}
        {!isLast && (
          <motion.div
            className="flex-1 w-px mt-1"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0.02))' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 pb-5 ${isLast ? '' : ''}`}>
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5
          group-hover:bg-white/[0.05] group-hover:border-white/[0.08]
          transition-all duration-200">

          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white/90 group-hover:text-white truncate transition-colors">
                {meeting.title}
              </h4>
              <p className="text-[11px] text-white/30 mt-0.5 truncate">{meeting.venue}</p>
            </div>
            <Link href={`/dashboard/minutes/${meeting.id}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {/* When */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
              ${isUrgent ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-white/[0.05] text-white/40 border border-white/[0.07]'}`}>
              {isUrgent && <Zap className="w-2.5 h-2.5" />}
              {timeFromNow}
            </span>

            {/* Type */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg}`}>
              <TypeIcon style={{ width: 9, height: 9 }} />
              {cfg.label}
            </span>

            {/* Time */}
            <span className="flex items-center gap-1 text-[11px] text-white/30 ml-auto">
              <Clock className="w-3 h-3" />
              {format(meetingDate, 'h:mm a')}
            </span>
          </div>

          {/* Date bar */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/25">
              {format(meetingDate, 'EEE, MMM d')}
            </span>
            <div className="flex gap-1.5">
              <Link href={`/dashboard/minutes/${meeting.id}`}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white
                    bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d]
                    hover:shadow-[0_2px_12px_rgba(13,124,61,0.4)] transition-shadow"
                >
                  Details
                </motion.button>
              </Link>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white/50
                  border border-white/[0.08] hover:text-white/80 hover:border-white/20 transition-colors"
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */
function MeetingSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-white/[0.05] shrink-0" />
      <div className="flex-1 pb-5">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3.5 space-y-2.5">
          <div className="h-4 bg-white/[0.05] rounded w-3/4" />
          <div className="h-3 bg-white/[0.04] rounded w-1/2" />
          <div className="h-6 bg-white/[0.03] rounded w-full" />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getUpcomingMeetings(3)
      .then(data => setMeetings(data))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>
      <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Upcoming Meetings
            </h3>
            <p className="text-[11px] text-white/35">This week's schedule</p>
          </div>
          <Link href="/dashboard/minutes/create"
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400
              hover:text-emerald-300 transition-colors tracking-wide uppercase">
            <Plus className="w-3 h-3" /> Schedule
          </Link>
        </div>

        {/* Timeline */}
        <div className="px-5 pt-5 pb-2 max-h-[480px] overflow-y-auto">
          {loading
            ? [0,1,2].map(i => <MeetingSkeleton key={i} />)
            : meetings.length === 0
              ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white/20" />
                  </div>
                  <p className="text-sm text-white/30">No upcoming meetings</p>
                </div>
              )
              : meetings.map((m, i) => (
                  <MeetingItem key={m.id} meeting={m} index={i} isLast={i === meetings.length - 1} />
                ))
          }
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.05]">
          <Link href="/dashboard/meetings">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                border border-dashed border-white/10 text-white/30
                hover:border-emerald-500/30 hover:text-emerald-400
                text-xs font-semibold transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              View Full Calendar
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  )
}