'use client'

/**
 * Settings Page
 * System configuration and administrative settings
 */

import React, { useState } from 'react'
import AppShell from '@/components/layout/AppShell'


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  })
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    maintenance: false,
    debugMode: false
  })

  const tabs = [
    { id: 'general', name: 'General', description: 'Basic configuration' },
    { id: 'security', name: 'Security', description: 'Authentication & policies' },
    { id: 'database', name: 'Database', description: 'Connection & performance' },
    { id: 'notifications', name: 'Notifications', description: 'Alerts & messaging' },
    { id: 'users', name: 'Users', description: 'Access management' },
    { id: 'system', name: 'System', description: 'Advanced settings' },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/60">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Configure your RBI System preferences and administrative settings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex flex-col items-start px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${
                      activeTab === tab.id ? 'text-white' : 'text-slate-900'
                    }`}>
                      {tab.name}
                    </span>
                    <span className={`text-xs mt-1 ${
                      activeTab === tab.id ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      {tab.description}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
              <div className="p-8">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">General Settings</h3>
                      <p className="mt-2 text-slate-600">Basic system configuration and preferences</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 mt-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">System Name</label>
                        <input
                          type="text"
                          defaultValue="RBI System - Barangay Records"
                          className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Timezone</label>
                        <select className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200">
                          <option>Asia/Manila (GMT+8)</option>
                          <option>UTC (GMT+0)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Default Language</label>
                        <select className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200">
                          <option>English</option>
                          <option>Filipino</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Date Format</label>
                        <select className="block w-full rounded-xl border-0 py-3 px-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">Security Settings</h3>
                      <p className="mt-2 text-slate-600">Configure authentication and security policies</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h4>
                          <p className="text-slate-600 mt-1">Require 2FA for all admin accounts</p>
                        </div>
                        <button
                          type="button"
                          className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                        >
                          <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out"></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">Session Timeout</h4>
                          <p className="text-slate-600 mt-1">Automatic logout after inactivity</p>
                        </div>
                        <select className="rounded-xl border-0 py-2 px-3 text-slate-900 bg-white shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all duration-200">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>2 hours</option>
                          <option>Never</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">Password Complexity</h4>
                          <p className="text-slate-600 mt-1">Enforce strong password requirements</p>
                        </div>
                        <button
                          type="button"
                          className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                        >
                          <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Settings */}
                {activeTab === 'database' && (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">Database Configuration</h3>
                      <p className="mt-2 text-slate-600">Database connection and maintenance settings</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold text-emerald-900">Database Connected</h4>
                          <p className="mt-1 text-emerald-700">
                            Successfully connected to Supabase PostgreSQL database
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Connection Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Host:</span>
                            <span className="font-medium text-slate-900">Supabase</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Database:</span>
                            <span className="font-medium text-slate-900">postgres</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Status:</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                              Connected
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Avg Response:</span>
                            <span className="font-medium text-slate-900">&lt;50ms</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Uptime:</span>
                            <span className="font-medium text-slate-900">99.9%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Coverage:</span>
                            <span className="font-medium text-slate-900">91.3%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">Notification Preferences</h3>
                      <p className="mt-2 text-slate-600">Configure how you receive system notifications</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifications({...notifications, email: !notifications.email})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            notifications.email ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${notifications.email ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifications({...notifications, sms: !notifications.sms})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            notifications.sms ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${notifications.sms ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-500">Browser push notifications</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifications({...notifications, push: !notifications.push})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            notifications.push ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${notifications.push ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Settings */}
                {activeTab === 'users' && (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">User Management</h3>
                      <p className="mt-2 text-slate-600">Manage system users and access permissions</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                            <div className="h-2 w-2 bg-white rounded-full ml-1"></div>
                            <div className="h-2 w-2 bg-white rounded-full ml-1"></div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-semibold text-amber-900">Feature Coming Soon</h4>
                          <p className="mt-1 text-amber-700">
                            User management functionality will be available in the next release.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Settings */}
                {activeTab === 'system' && (
                  <div className="space-y-8">
                    <div className="pb-6 border-b border-slate-200">
                      <h3 className="text-2xl font-bold text-slate-900">System Settings</h3>
                      <p className="mt-2 text-slate-600">Advanced system configuration and maintenance</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Automatic Backup</h4>
                          <p className="text-sm text-gray-500">Daily database backups</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSystemSettings({...systemSettings, autoBackup: !systemSettings.autoBackup})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            systemSettings.autoBackup ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${systemSettings.autoBackup ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                          <p className="text-sm text-gray-500">Temporarily disable public access</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSystemSettings({...systemSettings, maintenance: !systemSettings.maintenance})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            systemSettings.maintenance ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${systemSettings.maintenance ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
                          <p className="text-sm text-gray-500">Enable detailed error logging</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSystemSettings({...systemSettings, debugMode: !systemSettings.debugMode})}
                          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                            systemSettings.debugMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`${systemSettings.debugMode ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out`}></span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                      <button className="inline-flex items-center rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                        Reset System Settings
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}