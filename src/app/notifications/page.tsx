'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { ProtectedRoute } from '@/components/organisms';

function NotificationsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, important

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'New resident registration',
      message: 'Maria Santos has completed her resident registration and is awaiting approval.',
      time: '2 hours ago',
      read: false,
      important: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'System maintenance scheduled',
      message: 'Citizenly will undergo maintenance on December 20, 2024 from 2:00 AM to 4:00 AM.',
      time: '1 day ago',
      read: false,
      important: true,
    },
    {
      id: 3,
      type: 'success',
      title: 'Certificate request approved',
      message:
        'Barangay Certificate request #001 for Juan Dela Cruz has been approved and is ready for pickup.',
      time: '2 days ago',
      read: true,
      important: false,
    },
    {
      id: 4,
      type: 'info',
      title: 'Monthly report available',
      message:
        'Your November 2024 barangay statistics report has been generated and is ready for review.',
      time: '3 days ago',
      read: true,
      important: false,
    },
    {
      id: 5,
      type: 'error',
      title: 'Data backup failed',
      message:
        'The scheduled data backup on December 12, 2024 encountered an error. Please contact support.',
      time: '5 days ago',
      read: false,
      important: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="bg-success-100 flex size-10 items-center justify-center rounded-full">
            <svg
              className="text-success-600 size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="bg-warning-100 flex size-10 items-center justify-center rounded-full">
            <svg
              className="text-warning-600 size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-danger-100 flex size-10 items-center justify-center rounded-full">
            <svg
              className="text-danger-600 size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-primary-100 flex size-10 items-center justify-center rounded-full">
            <svg
              className="text-primary-600 size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'important') return notification.important;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat text-foreground mb-0.5 text-xl font-semibold">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-danger-100 text-danger-800 ml-2 rounded-full px-2 py-1 text-xs font-medium">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="font-montserrat text-secondary text-sm font-normal">
              Stay updated with system alerts, resident activities, and important announcements
            </p>
          </div>
          <button className="font-montserrat focus:ring-offset-background text-primary-600 hover:text-primary-700 focus:text-primary-800 focus:ring-primary-500 rounded px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2">
            Mark all as read
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-default border-b">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', name: 'All', count: notifications.length },
                { id: 'unread', name: 'Unread', count: unreadCount },
                {
                  id: 'important',
                  name: 'Important',
                  count: notifications.filter(n => n.important).length,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`font-montserrat whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                    filter === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'hover:border-muted text-muted hover:text-secondary border-transparent'
                  }`}
                >
                  {tab.name}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        filter === tab.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-muted bg-background-muted'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface border-default rounded-lg border">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-background-muted mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
                <svg
                  className="text-muted size-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a9.5 9.5 0 0119 0v10z"
                  />
                </svg>
              </div>
              <h3 className="font-montserrat text-foreground mb-2 font-medium">No notifications</h3>
              <p className="font-montserrat text-secondary text-sm">
                {filter === 'unread' && 'No unread notifications'}
                {filter === 'important' && 'No important notifications'}
                {filter === 'all' && 'You&rsquo;re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-default divide-y">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`hover:bg-surface-hover p-4 transition-colors ${
                    !notification.read ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="flex space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`font-montserrat text-sm ${
                                !notification.read
                                  ? 'text-foreground font-semibold'
                                  : 'text-secondary font-medium'
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {notification.important && (
                              <span className="bg-danger-100 text-danger-800 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                                Important
                              </span>
                            )}
                            {!notification.read && (
                              <div className="bg-primary-600 size-2 rounded-full"></div>
                            )}
                          </div>
                          <p className="font-montserrat text-secondary mt-1 text-sm">
                            {notification.message}
                          </p>
                          <p className="font-montserrat text-muted mt-2 text-xs">
                            {notification.time}
                          </p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          {!notification.read && (
                            <button className="font-montserrat focus:ring-offset-surface text-primary-600 hover:text-primary-700 focus:text-primary-800 focus:ring-primary-500 rounded px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1">
                              Mark as read
                            </button>
                          )}
                          <button
                            className="focus:ring-offset-surface text-muted hover:text-secondary focus:text-danger-600 focus:ring-danger-500 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                            title="Delete notification"
                          >
                            <svg
                              className="size-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
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
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
