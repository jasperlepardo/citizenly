'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/templates'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function NotificationsContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, important

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'New resident registration',
      message: 'Maria Santos has completed her resident registration and is awaiting approval.',
      time: '2 hours ago',
      read: false,
      important: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'System maintenance scheduled',
      message: 'Citizenly will undergo maintenance on December 20, 2024 from 2:00 AM to 4:00 AM.',
      time: '1 day ago',
      read: false,
      important: true
    },
    {
      id: 3,
      type: 'success',
      title: 'Certificate request approved',
      message: 'Barangay Certificate request #001 for Juan Dela Cruz has been approved and is ready for pickup.',
      time: '2 days ago',
      read: true,
      important: false
    },
    {
      id: 4,
      type: 'info',
      title: 'Monthly report available',
      message: 'Your November 2024 barangay statistics report has been generated and is ready for review.',
      time: '3 days ago',
      read: true,
      important: false
    },
    {
      id: 5,
      type: 'error',
      title: 'Data backup failed',
      message: 'The scheduled data backup on December 12, 2024 encountered an error. Please contact support.',
      time: '5 days ago',
      read: false,
      important: true
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'important') return notification.important
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DashboardLayout 
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-neutral-900 mb-0.5">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="font-montserrat font-normal text-sm text-neutral-600">
              Stay updated with system alerts, resident activities, and important announcements
            </p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-montserrat font-medium text-sm">
            Mark all as read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-neutral-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', name: 'All', count: notifications.length },
                { id: 'unread', name: 'Unread', count: unreadCount },
                { id: 'important', name: 'Important', count: notifications.filter(n => n.important).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-2 px-1 border-b-2 font-montserrat font-medium text-sm whitespace-nowrap ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface rounded-lg border border-default">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-background-muted rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z" />
                </svg>
              </div>
              <h3 className="font-montserrat font-medium text-neutral-900 mb-2">No notifications</h3>
              <p className="font-montserrat text-sm text-neutral-600">
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'important' && 'No important notifications'}
                {filter === 'all' && 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-neutral-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className={`font-montserrat text-sm ${
                              !notification.read ? 'font-semibold text-neutral-900' : 'font-medium text-neutral-800'
                            }`}>
                              {notification.title}
                            </h4>
                            {notification.important && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Important
                              </span>
                            )}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="mt-1 font-montserrat text-sm text-neutral-600">
                            {notification.message}
                          </p>
                          <p className="mt-2 font-montserrat text-xs text-neutral-500">
                            {notification.time}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {!notification.read && (
                            <button className="text-blue-600 hover:text-blue-700 font-montserrat text-xs">
                              Mark as read
                            </button>
                          )}
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  )
}