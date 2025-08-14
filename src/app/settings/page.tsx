'use client';

/**
 * Settings Page
 * System configuration and administrative settings
 */

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates';
import { Button } from '@/components/atoms';
import { DropdownSelect } from '@/components/molecules';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, actualTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    maintenance: false,
    debugMode: false,
  });

  const tabs = [
    { id: 'general', name: 'General', description: 'Basic configuration' },
    { id: 'security', name: 'Security', description: 'Authentication & policies' },
    { id: 'database', name: 'Database', description: 'Connection & performance' },
    { id: 'notifications', name: 'Notifications', description: 'Alerts & messaging' },
    { id: 'users', name: 'Users', description: 'Access management' },
    { id: 'system', name: 'System', description: 'Advanced settings' },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600">Settings</h1>
            <p className="font-montserrat text-sm font-normal text-gray-600">
              Configure your system preferences and administrative settings
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-default">
            <nav className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`font-montserrat whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-gray-600'
                      : 'border-transparent text-gray-600 hover:border-default hover:text-gray-600'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-default overflow-hidden rounded border border-default">
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    General Settings
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Basic system configuration and preferences
                  </p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-montserrat mb-1 text-base font-medium text-gray-600">
                      Appearance
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600">
                      {theme === 'system'
                        ? `Following system preference (${actualTheme})`
                        : `Using ${theme} theme`}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Light Theme */}
                    <button
                      onClick={() => setTheme('light')}
                      className={`relative flex flex-col items-center rounded border p-4 transition-colors ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50'
                          : 'bg-default hover:bg-default-hover border-default'
                      }`}
                    >
                      <div className="bg-default mb-2 flex size-8 items-center justify-center rounded border border-default">
                        <svg
                          className="size-4 text-amber-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-montserrat text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-600'}`}
                      >
                        Light
                      </span>
                      {theme === 'light' && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-blue-500"></div>
                      )}
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => setTheme('dark')}
                      className={`relative flex flex-col items-center rounded border p-4 transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50'
                          : 'bg-default hover:bg-default-hover border-default'
                      }`}
                    >
                      <div className="mb-2 flex size-8 items-center justify-center rounded border border-slate-600 bg-slate-800">
                        <svg
                          className="size-4 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-montserrat text-sm font-medium ${theme === 'dark' ? 'text-gray-700' : 'text-gray-600'}`}
                      >
                        Dark
                      </span>
                      {theme === 'dark' && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-blue-500"></div>
                      )}
                    </button>

                    {/* System Theme */}
                    <button
                      onClick={() => setTheme('system')}
                      className={`relative flex flex-col items-center rounded border p-4 transition-colors ${
                        theme === 'system'
                          ? 'border-blue-500 bg-blue-50'
                          : 'bg-default hover:bg-default-hover border-default'
                      }`}
                    >
                      <div className="from-surface mb-2 flex size-8 items-center justify-center rounded border border-default bg-gradient-to-br to-slate-800">
                        <svg
                          className="size-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span
                        className={`font-montserrat text-sm font-medium ${theme === 'system' ? 'text-gray-700' : 'text-gray-600'}`}
                      >
                        System
                      </span>
                      {theme === 'system' && (
                        <div className="absolute right-2 top-2 size-2 rounded-full bg-blue-500"></div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="font-montserrat block text-sm font-medium text-gray-600">
                      System Name
                    </label>
                    <input
                      type="text"
                      defaultValue="RBI System - Barangay Records"
                      className="bg-default block w-full rounded border border-default px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-montserrat block text-sm font-medium text-gray-600">
                      Timezone
                    </label>
                    <DropdownSelect
                      options={[
                        { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' },
                        { value: 'UTC', label: 'UTC (GMT+0)' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-montserrat block text-sm font-medium text-gray-600">
                      Default Language
                    </label>
                    <DropdownSelect
                      options={[
                        { value: 'en', label: 'English' },
                        { value: 'fil', label: 'Filipino' },
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-montserrat block text-sm font-medium text-gray-600">
                      Date Format
                    </label>
                    <DropdownSelect
                      options={[
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    Security Settings
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Configure authentication and security policies
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Two-Factor Authentication
                      </h4>
                      <p className="font-montserrat mt-1 text-sm font-normal text-gray-600">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="inline-block size-4 translate-x-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200"></span>
                    </button>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Session Timeout
                      </h4>
                      <p className="font-montserrat mt-1 text-sm font-normal text-gray-600">
                        Automatic logout after inactivity
                      </p>
                    </div>
                    <div className="w-48">
                      <DropdownSelect
                        options={[
                          { value: '30', label: '30 minutes' },
                          { value: '60', label: '1 hour' },
                          { value: '120', label: '2 hours' },
                          { value: 'never', label: 'Never' },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Password Complexity
                      </h4>
                      <p className="font-montserrat mt-1 text-sm font-normal text-gray-600">
                        Enforce strong password requirements
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="inline-block size-4 translate-x-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    Database Configuration
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Database connection and maintenance settings
                  </p>
                </div>

                <div className="rounded border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="flex size-8 items-center justify-center rounded bg-green-500">
                        <div className="size-2 rounded-full bg-white dark:bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-montserrat text-base font-medium text-green-900">
                        Database Connected
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-green-700">
                        Successfully connected to Supabase PostgreSQL database
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-default-hover rounded border border-default p-4">
                    <h4 className="font-montserrat mb-4 text-base font-medium text-gray-600">
                      Connection Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Host:
                        </span>
                        <span className="font-montserrat text-sm font-medium text-gray-600">
                          Supabase
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Database:
                        </span>
                        <span className="font-montserrat text-sm font-medium text-gray-600">
                          postgres
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Status:
                        </span>
                        <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-default-hover rounded border border-default p-4">
                    <h4 className="font-montserrat mb-4 text-base font-medium text-gray-600">
                      Performance
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Avg Response:
                        </span>
                        <span className="font-montserrat text-sm font-medium text-gray-600">
                          &lt;50ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Uptime:
                        </span>
                        <span className="font-montserrat text-sm font-medium text-gray-600">
                          99.9%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-sm font-normal text-gray-600">
                          Coverage:
                        </span>
                        <span className="font-montserrat text-sm font-medium text-gray-600">
                          91.3%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    Notification Preferences
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Configure how you receive system notifications
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Email Notifications
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Receive updates via email
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, email: !notifications.email })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.email ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`${notifications.email ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        SMS Notifications
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Receive urgent alerts via SMS
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, sms: !notifications.sms })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.sms ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`${notifications.sms ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Push Notifications
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Browser push notifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, push: !notifications.push })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.push ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`${notifications.push ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Settings */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    User Management
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Manage system users and access permissions
                  </p>
                </div>

                <div className="rounded border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="flex size-8 items-center justify-center rounded bg-amber-500">
                        <div className="size-1 rounded-full bg-white dark:bg-gray-200"></div>
                        <div className="ml-0.5 size-1 rounded-full bg-white dark:bg-gray-200"></div>
                        <div className="ml-0.5 size-1 rounded-full bg-white dark:bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-montserrat text-base font-medium text-amber-900">
                        Feature Coming Soon
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-amber-700">
                        User management functionality will be available in the next release.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600">
                    System Settings
                  </h3>
                  <p className="font-montserrat text-sm font-normal text-gray-600">
                    Advanced system configuration and maintenance
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Automatic Backup
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Daily database backups
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSystemSettings({
                          ...systemSettings,
                          autoBackup: !systemSettings.autoBackup,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        systemSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.autoBackup ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Maintenance Mode
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Temporarily disable public access
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSystemSettings({
                          ...systemSettings,
                          maintenance: !systemSettings.maintenance,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        systemSettings.maintenance ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.maintenance ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>

                  <div className="bg-default-hover flex items-center justify-between rounded border border-default p-4">
                    <div>
                      <h4 className="font-montserrat text-base font-medium text-gray-600">
                        Debug Mode
                      </h4>
                      <p className="font-montserrat text-sm font-normal text-gray-600">
                        Enable detailed error logging
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSystemSettings({
                          ...systemSettings,
                          debugMode: !systemSettings.debugMode,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        systemSettings.debugMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.debugMode ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                      ></span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-default pt-6">
                  <Button variant="danger" size="md">
                    Reset System Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="border-t border-default pt-8">
              <div className="flex justify-end">
                <Button variant="primary" size="md">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
