"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Users,
  CreditCard,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionable?: boolean
  category: 'payment' | 'member' | 'loan' | 'system' | 'contribution'
}

interface NotificationsResponse {
  notifications: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    case 'error':
      return <X className="h-5 w-5 text-red-500" />
    default:
      return <Info className="h-5 w-5 text-blue-500" />
  }
}

const getCategoryIcon = (category: Notification['category']) => {
  switch (category) {
    case 'payment':
      return <DollarSign className="h-4 w-4" />
    case 'member':
      return <Users className="h-4 w-4" />
    case 'loan':
      return <CreditCard className="h-4 w-4" />
    case 'system':
      return <Bell className="h-4 w-4" />
    case 'contribution':
      return <Calendar className="h-4 w-4" />
    default:
      return <Info className="h-4 w-4" />
  }
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | Notification['category']>('all')

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter === 'unread') params.append('status', 'unread')
      if (['payment', 'member', 'loan', 'system', 'contribution'].includes(filter)) {
        params.append('category', filter)
      }

      const response = await fetch(`/api/notifications?${params}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data: NotificationsResponse = await response.json()
      setNotifications(data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  // Load notifications on mount and filter change
  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const markAsRead = (id: string) => {
    setNotifications((prev: Notification[]) => 
      prev.map((notification: Notification) => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev: Notification[]) => prev.filter((notification: Notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev: Notification[]) => 
      prev.map((notification: Notification) => ({ ...notification, read: true }))
    )
  }

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.category === filter
  })

  const unreadCount = notifications.filter((n: Notification) => !n.read).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark all read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'unread' as const, label: 'Unread' },
          { key: 'payment' as const, label: 'Payments' },
          { key: 'member' as const, label: 'Members' },
          { key: 'loan' as const, label: 'Loans' },
          { key: 'system' as const, label: 'System' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key)}
            className="whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <Card className="p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
              <p className="text-sm mt-1">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "Try adjusting your filters"}
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification: Notification) => (
            <Card
              key={notification.id}
              className={cn(
                "transition-colors",
                !notification.read && "bg-blue-50/50 border-blue-200"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(notification.category)}
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-7"
                            >
                              Mark as read
                            </Button>
                          )}
                          {notification.actionable && (
                            <Button size="sm" className="h-7 text-xs">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Simple notification badge component for header
export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?status=unread&limit=1')
        if (response.ok) {
          const data: NotificationsResponse = await response.json()
          setUnreadCount(data.pagination.total)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()
    // Update every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </div>
  )
}