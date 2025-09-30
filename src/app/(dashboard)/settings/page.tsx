'use client';

/**
 * Settings Page
 * System configuration and administrative settings
 */

import React, { useState } from 'react';

import { Button } from '@/components/atoms/Button/Button';
import { SelectField } from '@/components/molecules/FieldSet/SelectField/SelectField';
import { useTheme } from '@/contexts/ThemeContext';
import { clientLogger } from '@/lib/logging/client-logger';

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
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600 dark:text-gray-300">
            Settings
          </h1>
          <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
            Configure your system preferences and administrative settings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`font-montserrat border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-gray-600 dark:text-gray-300'
                    : 'border-transparent text-gray-600 hover:border-gray-200 hover:text-gray-600 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  General Settings
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Basic system configuration and preferences
                </p>
              </div>

              {/* Theme Selection */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-montserrat mb-1 text-base font-medium text-gray-600 dark:text-gray-300">
                    Appearance
                  </h4>
                  <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
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
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-sm border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
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
                      className={`font-montserrat text-sm font-medium ${theme === 'light' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      Light
                    </span>
                    {theme === 'light' && (
                      <div className="absolute top-2 right-2 size-2 rounded-full bg-blue-500"></div>
                    )}
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`relative flex flex-col items-center rounded border p-4 transition-colors ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-sm border border-slate-600 bg-slate-800">
                      <svg
                        className="size-4 text-slate-300 dark:text-slate-700"
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
                      className={`font-montserrat text-sm font-medium ${theme === 'dark' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      Dark
                    </span>
                    {theme === 'dark' && (
                      <div className="absolute top-2 right-2 size-2 rounded-full bg-blue-500"></div>
                    )}
                  </button>

                  {/* System Theme */}
                  <button
                    onClick={() => setTheme('system')}
                    className={`relative flex flex-col items-center rounded border p-4 transition-colors ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="mb-2 flex size-8 items-center justify-center rounded-sm border border-gray-200 bg-linear-to-br from-white to-slate-800 dark:border-gray-700 dark:from-gray-800">
                      <svg
                        className="size-4 text-gray-600 dark:text-gray-400"
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
                      className={`font-montserrat text-sm font-medium ${theme === 'system' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      System
                    </span>
                    {theme === 'system' && (
                      <div className="absolute top-2 right-2 size-2 rounded-full bg-blue-500"></div>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-montserrat block text-sm font-medium text-gray-600 dark:text-gray-300">
                    System Name
                  </label>
                  <input
                    type="text"
                    defaultValue="RBI System - Barangay Records"
                    className="block w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
                <SelectField
                  label="Timezone"
                  selectProps={{
                    options: [
                      { value: 'Asia/Manila', label: 'Asia/Manila (GMT+8)' },
                      { value: 'UTC', label: 'UTC (GMT+0)' },
                    ],
                    placeholder: 'Select timezone',
                    onSelect: option => clientLogger.debug('Timezone selected:', { component: 'SettingsPage', action: 'timezone_selected', data: { option } }),
                  }}
                />
                <SelectField
                  label="Default Language"
                  selectProps={{
                    options: [
                      { value: 'en', label: 'English' },
                      { value: 'fil', label: 'Filipino' },
                    ],
                    placeholder: 'Select language',
                    onSelect: option => clientLogger.debug('Language selected:', { component: 'SettingsPage', action: 'language_selected', data: { option } }),
                  }}
                />
                <SelectField
                  label="Date Format"
                  selectProps={{
                    options: [
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ],
                    placeholder: 'Select date format',
                    onSelect: option => clientLogger.debug('Date format selected:', { component: 'SettingsPage', action: 'date_format_selected', data: { option } }),
                  }}
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Security Settings
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Configure authentication and security policies
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Two-Factor Authentication
                    </h4>
                    <p className="font-montserrat mt-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
                  >
                    <span className="inline-block size-4 translate-x-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Session Timeout
                    </h4>
                    <p className="font-montserrat mt-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                      Automatic logout after inactivity
                    </p>
                  </div>
                  <div className="w-48">
                    <SelectField
                      selectProps={{
                        options: [
                          { value: '30', label: '30 minutes' },
                          { value: '60', label: '1 hour' },
                          { value: '120', label: '2 hours' },
                          { value: 'never', label: 'Never' },
                        ],
                        placeholder: 'Select timeout',
                        onSelect: option => clientLogger.debug('Timeout selected:', { component: 'SettingsPage', action: 'timeout_selected', data: { option } }),
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Password Complexity
                    </h4>
                    <p className="font-montserrat mt-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                      Enforce strong password requirements
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
                  >
                    <span className="inline-block size-4 translate-x-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200"></span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Database Configuration
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Database connection and maintenance settings
                </p>
              </div>

              <div className="rounded border border-green-200 bg-green-50 p-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="flex size-8 items-center justify-center rounded-sm bg-green-500">
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
                <div className="rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <h4 className="font-montserrat mb-4 text-base font-medium text-gray-600 dark:text-gray-300">
                    Connection Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Host:
                      </span>
                      <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                        Supabase
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Database:
                      </span>
                      <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                        postgres
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <span className="inline-flex items-center rounded-sm bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <h4 className="font-montserrat mb-4 text-base font-medium text-gray-600 dark:text-gray-300">
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Avg Response:
                      </span>
                      <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                        &lt;50ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Uptime:
                      </span>
                      <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
                        99.9%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                        Coverage:
                      </span>
                      <span className="font-montserrat text-sm font-medium text-gray-600 dark:text-gray-300">
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
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Notification Preferences
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Configure how you receive system notifications
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Email Notifications
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                      Receive updates via email
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications({ ...notifications, email: !notifications.email })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden ${
                      notifications.email ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`${notifications.email ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      SMS Notifications
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                      Receive urgent alerts via SMS
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden ${
                      notifications.sms ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`${notifications.sms ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Push Notifications
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                      Browser push notifications
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications({ ...notifications, push: !notifications.push })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden ${
                      notifications.push ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`${notifications.push ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
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
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  User Management
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Manage system users and access permissions
                </p>
              </div>

              <div className="rounded border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="flex size-8 items-center justify-center rounded-sm bg-amber-500">
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
                <h3 className="font-montserrat mb-2 text-lg font-semibold text-gray-600 dark:text-gray-300">
                  System Settings
                </h3>
                <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                  Advanced system configuration and maintenance
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Automatic Backup
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden ${
                      systemSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`${systemSettings.autoBackup ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Maintenance Mode
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-hidden ${
                      systemSettings.maintenance ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`${systemSettings.maintenance ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
                  <div>
                    <h4 className="font-montserrat text-base font-medium text-gray-600 dark:text-gray-300">
                      Debug Mode
                    </h4>
                    <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
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
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden ${
                      systemSettings.debugMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`${systemSettings.debugMode ? 'translate-x-5' : 'translate-x-0'} inline-block size-4 rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-gray-200`}
                    ></span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-6 dark:border-gray-600">
                <Button variant="danger" size="md">
                  Reset System Settings
                </Button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="border-t border-gray-300 pt-8 dark:border-gray-600">
            <div className="flex justify-end">
              <Button variant="primary" size="md">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
