'use client'

/**
 * Residents Page
 * Comprehensive resident management with search, filtering, and registration
 */

import React, { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'


// Mock data for residents
const mockResidents = [
  {
    id: 1,
    name: 'Juan dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 912 345 6789',
    address: 'Barangay San Antonio, Makati City',
    status: 'Active',
    registeredDate: '2024-01-15',
    avatar: null,
    age: 34,
    gender: 'Male'
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 917 234 5678',
    address: 'Barangay Poblacion, Quezon City',
    status: 'Active',
    registeredDate: '2024-01-10',
    avatar: null,
    age: 28,
    gender: 'Female'
  },
  {
    id: 3,
    name: 'Pedro Reyes',
    email: 'pedro.reyes@email.com',
    phone: '+63 920 345 6789',
    address: 'Barangay Central, Manila',
    status: 'Pending',
    registeredDate: '2024-01-12',
    avatar: null,
    age: 45,
    gender: 'Male'
  },
  {
    id: 4,
    name: 'Ana Garcia',
    email: 'ana.garcia@email.com',
    phone: '+63 915 456 7890',
    address: 'Barangay East, Pasig City',
    status: 'Active',
    registeredDate: '2024-01-08',
    avatar: null,
    age: 31,
    gender: 'Female'
  }
]

export default function ResidentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredResidents = mockResidents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || resident.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = [
    { name: 'Total Residents', value: '1,247', change: '+12%', changeType: 'increase' },
    { name: 'Active', value: '1,180', change: '+8%', changeType: 'increase' },
    { name: 'Pending Review', value: '67', change: '+4', changeType: 'increase' },
    { name: 'This Month', value: '+23', change: '+15%', changeType: 'increase' },
  ]

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/60">
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Residents
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Manage and monitor all registered residents in your barangay
              </p>
            </div>
            <div className="mt-6 flex gap-4 md:ml-4 md:mt-0">
              <button
                type="button"
                className="inline-flex items-center rounded-2xl bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg ring-1 ring-inset ring-slate-300/50 hover:bg-white hover:shadow-xl transition-all duration-200"
              >
                Filter
              </button>
              <Link
                href="/residents/new"
                className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200"
              >
                New Resident
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <div key={item.name} className="group overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/60 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <div className="flex flex-col h-full">
                <dt className="text-sm font-semibold text-slate-600 mb-3">{item.name}</dt>
                <dd className="flex flex-col flex-grow">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {item.value}
                    </span>
                    <span className="ml-2 text-sm font-medium text-slate-500">residents</span>
                  </div>
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 w-fit">
                    {item.change}
                  </div>
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <div className="h-5 w-5 text-slate-400">
                <div className="h-4 w-4 rounded-full border border-current"></div>
                <div className="absolute top-3 left-3 h-2 w-0.5 bg-current rotate-45"></div>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search residents..."
              className="block w-full rounded-2xl border-0 py-3 pl-12 pr-4 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="rounded-2xl border-0 py-3 pl-4 pr-10 text-slate-900 bg-slate-50 shadow-inner ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Residents Table */}
        <div className="bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
          <div className="p-8">
            <div className="border-b border-slate-200 pb-6 mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                Resident Directory
              </h3>
              <p className="mt-2 text-slate-600">
                A list of all residents including their contact information and status.
              </p>
            </div>
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-0">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Contact
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Address
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-sm font-semibold text-slate-900">
                          Registered
                        </th>
                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredResidents.map((resident) => (
                        <tr key={resident.id} className="hover:bg-slate-50 transition-colors duration-200">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                  <span className="text-sm font-bold text-white">
                                    {resident.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="font-semibold text-slate-900">{resident.name}</div>
                                <div className="text-slate-500 text-sm">{resident.age} years old • {resident.gender}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            <div className="font-medium">{resident.email}</div>
                            <div className="text-slate-500">{resident.phone}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {resident.address}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                              resident.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                                : resident.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                                : 'bg-slate-50 text-slate-700 ring-slate-600/20'
                            }`}>
                              {resident.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                            {new Date(resident.registeredDate).toLocaleDateString()}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200">
                              <div className="flex flex-col space-y-1">
                                <div className="h-1 w-1 bg-current rounded-full"></div>
                                <div className="h-1 w-1 bg-current rounded-full"></div>
                                <div className="h-1 w-1 bg-current rounded-full"></div>
                              </div>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State (when no results) */}
        {filteredResidents.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-slate-200/60 rounded-2xl">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center mb-6">
              <div className="h-8 w-8 bg-white rounded-2xl opacity-90"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No residents found</h3>
            <p className="text-slate-600 mb-8">
              Try adjusting your search criteria or add a new resident.
            </p>
            <Link
              href="/residents/new"
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              New Resident
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  )
}