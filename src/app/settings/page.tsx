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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-primary mb-0.5">Settings</h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
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
                  className={`py-2 px-1 border-b-2 font-montserrat font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-primary'
                      : 'border-transparent text-secondary hover:text-primary hover:border-default'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-surface border border-default rounded overflow-hidden">
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    General Settings
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Basic system configuration and preferences
                  </p>
                </div>

                {/* Theme Selection */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-montserrat font-medium text-base text-primary mb-1">
                      Appearance
                    </h4>
                    <p className="font-montserrat font-normal text-sm text-secondary">
                      {theme === 'system'
                        ? `Following system preference (${actualTheme})`
                        : `Using ${theme} theme`}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Light Theme */}
                    <button
                      onClick={() => setTheme('light')}
                      className={`relative flex flex-col items-center p-4 rounded border transition-colors ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-default bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div className="w-8 h-8 mb-2 rounded bg-surface border border-default flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-amber-500"
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
                        className={`font-montserrat font-medium text-sm ${theme === 'light' ? 'text-blue-700' : 'text-primary'}`}
                      >
                        Light
                      </span>
                      {theme === 'light' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => setTheme('dark')}
                      className={`relative flex flex-col items-center p-4 rounded border transition-colors ${
                        theme === 'dark'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-default bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div className="w-8 h-8 mb-2 rounded bg-slate-800 border border-slate-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-slate-300"
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
                        className={`font-montserrat font-medium text-sm ${theme === 'dark' ? 'text-blue-700' : 'text-primary'}`}
                      >
                        Dark
                      </span>
                      {theme === 'dark' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>

                    {/* System Theme */}
                    <button
                      onClick={() => setTheme('system')}
                      className={`relative flex flex-col items-center p-4 rounded border transition-colors ${
                        theme === 'system'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-default bg-surface hover:bg-surface-hover'
                      }`}
                    >
                      <div className="w-8 h-8 mb-2 rounded bg-gradient-to-br from-surface to-slate-800 border border-default flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-secondary"
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
                        className={`font-montserrat font-medium text-sm ${theme === 'system' ? 'text-blue-700' : 'text-primary'}`}
                      >
                        System
                      </span>
                      {theme === 'system' && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                  <div className="space-y-2">
                    <label className="block font-montserrat font-medium text-sm text-secondary">
                      System Name
                    </label>
                    <input
                      type="text"
                      defaultValue="RBI System - Barangay Records"
                      className="block w-full rounded border border-default py-2 px-3 text-primary bg-surface focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-montserrat font-medium text-sm text-secondary">
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
                    <label className="block font-montserrat font-medium text-sm text-secondary">
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
                    <label className="block font-montserrat font-medium text-sm text-secondary">
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
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    Security Settings
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Configure authentication and security policies
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Two-Factor Authentication
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary mt-1">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Session Timeout
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary mt-1">
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

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Password Complexity
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary mt-1">
                        Enforce strong password requirements
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="translate-x-5 inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    Database Configuration
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Database connection and maintenance settings
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded bg-green-500 flex items-center justify-center">
                        <div className="h-2 w-2 bg-white dark:bg-neutral-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-montserrat font-medium text-base text-green-900">
                        Database Connected
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-green-700">
                        Successfully connected to Supabase PostgreSQL database
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="bg-surface-hover rounded border border-default p-4">
                    <h4 className="font-montserrat font-medium text-base text-primary mb-4">
                      Connection Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Host:
                        </span>
                        <span className="font-montserrat font-medium text-sm text-primary">
                          Supabase
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Database:
                        </span>
                        <span className="font-montserrat font-medium text-sm text-primary">
                          postgres
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Status:
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-hover rounded border border-default p-4">
                    <h4 className="font-montserrat font-medium text-base text-primary mb-4">
                      Performance
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Avg Response:
                        </span>
                        <span className="font-montserrat font-medium text-sm text-primary">
                          &lt;50ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Uptime:
                        </span>
                        <span className="font-montserrat font-medium text-sm text-primary">
                          99.9%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-montserrat font-normal text-sm text-secondary">
                          Coverage:
                        </span>
                        <span className="font-montserrat font-medium text-sm text-primary">
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
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    Notification Preferences
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Configure how you receive system notifications
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Email Notifications
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
                        Receive updates via email
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, email: !notifications.email })
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.email ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`${notifications.email ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        SMS Notifications
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
                        Receive urgent alerts via SMS
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, sms: !notifications.sms })
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.sms ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`${notifications.sms ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Push Notifications
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
                        Browser push notifications
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications({ ...notifications, push: !notifications.push })
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifications.push ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`${notifications.push ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
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
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    User Management
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Manage system users and access permissions
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded bg-amber-500 flex items-center justify-center">
                        <div className="h-1 w-1 bg-white dark:bg-neutral-200 rounded-full"></div>
                        <div className="h-1 w-1 bg-white dark:bg-neutral-200 rounded-full ml-0.5"></div>
                        <div className="h-1 w-1 bg-white dark:bg-neutral-200 rounded-full ml-0.5"></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="font-montserrat font-medium text-base text-amber-900">
                        Feature Coming Soon
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-amber-700">
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
                  <h3 className="font-montserrat font-semibold text-lg text-primary mb-2">
                    System Settings
                  </h3>
                  <p className="font-montserrat font-normal text-sm text-secondary">
                    Advanced system configuration and maintenance
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Automatic Backup
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
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
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        systemSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.autoBackup ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Maintenance Mode
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
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
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        systemSettings.maintenance ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.maintenance ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-hover rounded border border-default">
                    <div>
                      <h4 className="font-montserrat font-medium text-base text-primary">
                        Debug Mode
                      </h4>
                      <p className="font-montserrat font-normal text-sm text-secondary">
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
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        systemSettings.debugMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`${systemSettings.debugMode ? 'translate-x-5' : 'translate-x-0'} inline-block h-4 w-4 transform rounded-full bg-white dark:bg-neutral-200 shadow ring-0 transition duration-200 ease-in-out`}
                      ></span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-default">
                  <Button variant="danger" size="md">
                    Reset System Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-8 border-t border-default">
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
