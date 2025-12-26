'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle, Check } from 'lucide-react'
import { notificationsService, Notification } from '@/services/notifications'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications on mount and set up polling
  useEffect(() => {
    loadNotifications()
    
    // Poll every 15 seconds for new notifications
    const interval = setInterval(loadNotifications, 15000)
    
    // Cleanup
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }
    
    // TODO: Navigate to relevant page based on notification type
    // For now, just close the dropdown
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button - MATCHING YOUR EXISTING DESIGN */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors group"
        aria-label={`${unreadCount} unread notifications`}
      >
        <Bell className="h-5 w-5" />
        
        {/* Unread Count Badge - MATCHING YOUR EXISTING DESIGN */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#0d7c3d]"></span>
        )}
      </button>

      {/* Dropdown Menu - MATCHING YOUR DASHBOARD DESIGN LANGUAGE */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-medium text-white bg-[#0d7c3d] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-[#0d7c3d] hover:text-[#0a5a2d] font-medium flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 ${
                    notification.read ? 'bg-white' : 'bg-blue-50/30'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Notification Status Indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.read ? 'bg-gray-300' : 'bg-[#0d7c3d]'
                      }`}></div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notificationsService.formatRelativeTime(notification.createdAt)}
                        </span>
                        
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                            className="text-xs text-[#0d7c3d] hover:text-[#0a5a2d] font-medium flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Auto-refreshes every 15s</span>
                <button
                  onClick={loadNotifications}
                  className="text-[#0d7c3d] hover:text-[#0a5a2d] font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}