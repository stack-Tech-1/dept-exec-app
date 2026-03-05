'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCircle, Check, RefreshCw, CheckSquare,
  Calendar, Settings, AlertTriangle, Inbox
} from 'lucide-react'
import { notificationsService, Notification } from '@/services/notifications'

/* ─── Types ──────────────────────────────────────── */
type FilterTab = 'all' | 'unread' | 'task' | 'meeting' | 'system' | 'alert'

/* ─── Type icon map ──────────────────────────────── */
function NotifIcon({ type }: { type?: string }) {
  const cls = 'w-4 h-4'
  switch (type) {
    case 'task':    return <CheckSquare className={`${cls} text-blue-400`} />
    case 'meeting': return <Calendar className={`${cls} text-violet-400`} />
    case 'alert':   return <AlertTriangle className={`${cls} text-amber-400`} />
    case 'system':  return <Settings className={`${cls} text-emerald-400`} />
    default:        return <Bell className={`${cls} text-white/40`} />
  }
}

function typeBg(type?: string) {
  switch (type) {
    case 'task':    return 'bg-blue-400/10 border-blue-400/20'
    case 'meeting': return 'bg-violet-400/10 border-violet-400/20'
    case 'alert':   return 'bg-amber-400/10 border-amber-400/20'
    case 'system':  return 'bg-emerald-400/10 border-emerald-400/20'
    default:        return 'bg-white/[0.05] border-white/[0.08]'
  }
}

/* ─── Single notification row ────────────────────── */
function NotifRow({
  notification, index, onMarkRead
}: {
  notification: Notification
  index: number
  onMarkRead: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={`group relative flex gap-4 px-5 py-4 border-b border-white/[0.04] last:border-b-0
        transition-colors duration-200 hover:bg-white/[0.025]
        ${!notification.read ? 'bg-[#0d7c3d]/[0.04]' : ''}`}
    >
      {/* Unread dot */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-full bg-emerald-400" />
      )}

      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${typeBg(notification.type)}`}>
        <NotifIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug mb-1 ${notification.read ? 'text-white/50' : 'text-white/90 font-medium'}`}>
          {notification.message}
        </p>
        <span className="text-[11px] text-white/30">
          {notificationsService.formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Mark read button */}
      {!notification.read && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
            text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px] font-semibold"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Mark read
        </button>
      )}
    </motion.div>
  )
}

/* ─── Skeleton ───────────────────────────────────── */
function NotifSkeleton() {
  return (
    <div className="flex gap-4 px-5 py-4 animate-pulse border-b border-white/[0.04]">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/[0.05] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/4" />
      </div>
    </div>
  )
}

/* ─── Filter tab ─────────────────────────────────── */
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'unread',  label: 'Unread' },
  { key: 'task',    label: 'Tasks' },
  { key: 'meeting', label: 'Meetings' },
  { key: 'alert',   label: 'Alerts' },
  { key: 'system',  label: 'System' },
]

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const data = await notificationsService.getNotifications()
      setNotifications(data)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { /* ignore */ }
  }

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    return n.type === activeTab
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Notifications
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                  text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => load(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.06] overflow-x-auto">
            {TABS.map(tab => {
              const count = tab.key === 'unread'
                ? unreadCount
                : tab.key === 'all'
                  ? notifications.length
                  : notifications.filter(n => n.type === tab.key).length
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                    transition-all duration-200
                    ${isActive
                      ? 'bg-[#0d7c3d] text-white shadow-[0_2px_12px_rgba(13,124,61,0.4)]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.05]'
                    }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5
                      ${isActive ? 'bg-white/20' : 'bg-white/[0.08]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Notifications list */}
          <div className="min-h-[300px]">
            {loading ? (
              [0,1,2,3,4].map(i => <NotifSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06]
                  flex items-center justify-center">
                  <Inbox className="w-7 h-7 text-white/20" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/40">No notifications</p>
                  <p className="text-xs text-white/25 mt-1">
                    {activeTab === 'unread' ? 'All notifications are read' : 'Nothing here yet'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtered.map((n, i) => (
                  <NotifRow key={n.id} notification={n} index={i} onMarkRead={handleMarkRead} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
