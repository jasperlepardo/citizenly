'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/templates'
import { SearchBar, DataTable } from '@/components/organisms'
import type { SearchFilter, TableColumn, TableAction } from '@/components/organisms'
import { Button } from '@/components/atoms'

export const dynamic = 'force-dynamic'

interface Resident {
  id: string
  first_name: string
  middle_name?: string
  last_name: string
  extension_name?: string
  email?: string
  mobile_number?: string
  sex: 'male' | 'female' | ''
  birthdate: string
  civil_status?: string
  occupation?: string
  job_title?: string
  profession?: string
  education_level?: string
  household_code?: string
  barangay_code: string
  status?: string
  created_at: string
  household?: {
    code: string
    street_name?: string
    house_number?: string
    subdivision?: string
  }
}

function ResidentsContent() {
  const { user, loading: authLoading, userProfile } = useAuth()
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([])
  const [selectedResidents, setSelectedResidents] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  useEffect(() => {
    if (!authLoading && user && userProfile?.barangay_code) {
      loadResidents()
    }
  }, [user, authLoading, userProfile, searchTerm, searchFilters, pagination.current, pagination.pageSize])

  const loadResidents = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('residents')
        .select(`
          *,
          household:households!residents_household_code_fkey(
            code,
            street_name,
            house_number,
            subdivision
          )
        `, { count: 'exact' })
        .eq('barangay_code', userProfile?.barangay_code)
        .order('created_at', { ascending: false })
        .range(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize - 1
        )

      // Apply search term
      if (searchTerm.trim()) {
        query = query.or(`first_name.ilike.%${searchTerm}%,middle_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,occupation.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`)
      }

      // Apply advanced filters
      searchFilters.forEach(filter => {
        switch (filter.operator) {
          case 'equals':
            query = query.eq(filter.field, filter.value)
            break
          case 'contains':
            query = query.ilike(filter.field, `%${filter.value}%`)
            break
          case 'starts_with':
            query = query.ilike(filter.field, `${filter.value}%`)
            break
          case 'ends_with':
            query = query.ilike(filter.field, `%${filter.value}`)
            break
          case 'greater_than':
            if (typeof filter.value === 'number') {
              query = query.gt(filter.field, filter.value)
            }
            break
          case 'less_than':
            if (typeof filter.value === 'number') {
              query = query.lt(filter.field, filter.value)
            }
            break
        }
      })

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      setResidents(data || [])
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (err) {
      console.error('Error loading residents:', err)
      setResidents([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((term: string, filters: SearchFilter[]) => {
    setSearchTerm(term)
    setSearchFilters(filters)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  const handleSelectionChange = (selectedKeys: string[], selectedRows: Resident[]) => {
    setSelectedResidents(selectedKeys)
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize, total: pagination.total })
  }

  const formatFullName = (resident: Resident) => {
    return [resident.first_name, resident.middle_name, resident.last_name, resident.extension_name].filter(Boolean).join(' ')
  }

  const formatAddress = (resident: Resident) => {
    if (!resident.household) return 'No household assigned'
    const parts = [resident.household.house_number, resident.household.street_name, resident.household.subdivision].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'No address'
  }

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age.toString()
  }

  // Define table columns
  const columns: TableColumn<Resident>[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: (record: Resident) => formatFullName(record),
      render: (value: string, record: Resident) => (
        <Link 
          href={`/residents/${record.id}`}
          className="font-montserrat font-normal text-base text-blue-600 hover:text-blue-800 hover:underline"
        >
          {value}
        </Link>
      ),
      sortable: true
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      render: (value: string) => value || 'No email',
      sortable: true
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: (record: Resident) => formatAddress(record),
      sortable: false
    },
    {
      key: 'age',
      title: 'Age',
      dataIndex: (record: Resident) => calculateAge(record.birthdate),
      sortable: true
    },
    {
      key: 'sex',
      title: 'Sex',
      dataIndex: 'sex',
      render: (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A',
      sortable: true
    },
    {
      key: 'occupation',
      title: 'Occupation',
      dataIndex: (record: Resident) => record.occupation || record.job_title || 'N/A',
      sortable: true
    }
  ]

  // Define table actions
  const actions: TableAction<Resident>[] = [
    {
      key: 'view',
      label: 'View',
      href: (record: Resident) => `/residents/${record.id}`,
      variant: 'primary'
    },
    {
      key: 'edit',
      label: 'Edit',
      href: (record: Resident) => `/residents/${record.id}/edit`,
      variant: 'secondary'
    }
  ]

  // Define filter options for search
  const filterOptions = [
    {
      field: 'sex',
      label: 'Sex',
      type: 'select' as const,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    },
    {
      field: 'civil_status',
      label: 'Civil Status',
      type: 'select' as const,
      options: [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'separated', label: 'Separated' }
      ]
    },
    {
      field: 'occupation',
      label: 'Occupation',
      type: 'text' as const
    },
    {
      field: 'email',
      label: 'Email',
      type: 'text' as const
    }
  ]

  return (
    <DashboardLayout 
      currentPage="residents"
      searchTerm={globalSearchTerm}
      onSearchChange={setGlobalSearchTerm}
    >
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-montserrat font-semibold text-xl text-primary mb-0.5">Residents</h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              {pagination.total} total residents
            </p>
          </div>
          <Link href="/residents/create">
            <Button variant="primary" size="md">
              Add new resident
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            placeholder="Search residents by name, email, or occupation..."
            onSearch={handleSearch}
            filterOptions={filterOptions}
            showAdvancedFilters={true}
            className="w-full"
          />
        </div>

        {/* Data Table */}
        <DataTable<Resident>
          data={residents}
          columns={columns}
          actions={actions}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          selection={{
            selectedRowKeys: selectedResidents,
            onChange: handleSelectionChange
          }}
          rowKey="id"
          emptyText={searchTerm ? `No residents found matching "${searchTerm}"` : 'No residents found. Click "Add new resident" to register your first resident.'}
          size="middle"
        />
      </div>
    </DashboardLayout>
  )
}

export default function ResidentsPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <ResidentsContent />
    </ProtectedRoute>
  )
}