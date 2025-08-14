'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/secure-logger';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute, AdvancedSearchBar as SearchBar, DataTable } from '@/components/organisms';
import type { SearchFilter, TableColumn, TableAction } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import { Button } from '@/components/atoms';

export const dynamic = 'force-dynamic';

interface Resident {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  extension_name?: string;
  email?: string;
  mobile_number?: string;
  sex: 'male' | 'female' | '';
  birthdate: string;
  civil_status?: string;
  occupation?: string;
  job_title?: string;
  profession?: string;
  education_level?: string;
  household_code?: string;
  barangay_code: string;
  status?: string;
  created_at: string;
  household?: {
    code: string;
    street_name?: string;
    house_number?: string;
    subdivision?: string;
  };
}

function ResidentsContent() {
  const { user, loading: authLoading, userProfile } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [_searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Note: Advanced filter functionality will be implemented in future version

  // Helper function to load residents via API (bypasses RLS issues)
  const loadResidentsFromAPI = useCallback(
    async (current: number, pageSize: number) => {
      // Get current session to pass auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: current.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/residents?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setResidents(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        current: data.page || current,
        pageSize: data.pageSize || pageSize,
      }));
    },
    [searchTerm]
  );

  const loadResidents = useCallback(async () => {
    try {
      setLoading(true);

      console.log('User profile for residents:', userProfile);
      console.log('Barangay code:', userProfile?.barangay_code);

      if (!userProfile?.barangay_code) {
        console.error('No barangay code available. User profile:', userProfile);
        throw new Error('No barangay code available');
      }

      // Use API endpoint instead of direct Supabase queries to bypass RLS issues
      await loadResidentsFromAPI(pagination.current, pagination.pageSize);
    } catch (err) {
      logError(
        err instanceof Error ? err : new Error('Unknown error loading residents'),
        'RESIDENTS_LOAD'
      );
      setResidents([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [userProfile, searchTerm, loadResidentsFromAPI, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (!authLoading && user && userProfile?.barangay_code) {
      loadResidents();
    }
  }, [user, authLoading, userProfile?.barangay_code, loadResidents]);

  const handleSearch = useCallback((term: string, filters: SearchFilter[]) => {
    setSearchTerm(term);
    setSearchFilters(filters);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handleSelectionChange = (selectedKeys: string[], _selectedRows: Resident[]) => {
    setSelectedResidents(selectedKeys);
  };

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination(prev => ({ ...prev, current: page, pageSize }));
      // Directly load with new pagination values
      loadResidentsFromAPI(page, pageSize);
    },
    [loadResidentsFromAPI]
  );

  const formatFullName = (resident: Resident) => {
    return [resident.first_name, resident.middle_name, resident.last_name, resident.extension_name]
      .filter(Boolean)
      .join(' ');
  };

  const formatAddress = (resident: Resident) => {
    if (!resident.household) return 'No household assigned';
    const parts = [
      resident.household.house_number,
      resident.household.street_name,
      resident.household.subdivision,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age.toString();
  };

  // Define table columns
  const columns: TableColumn<Resident>[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: (record: Resident) => formatFullName(record),
      render: (value: string, record: Resident) => (
        <Link
          href={`/residents/${record.id}`}
          className="font-montserrat text-base font-normal text-gray-600 hover:text-gray-800 hover:underline"
        >
          {value}
        </Link>
      ),
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      render: (value: string) => value || 'No email',
      sortable: true,
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: (record: Resident) => formatAddress(record),
      sortable: false,
    },
    {
      key: 'age',
      title: 'Age',
      dataIndex: (record: Resident) => calculateAge(record.birthdate),
      sortable: true,
    },
    {
      key: 'sex',
      title: 'Sex',
      dataIndex: 'sex',
      render: (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'),
      sortable: true,
    },
    {
      key: 'occupation',
      title: 'Occupation',
      dataIndex: (record: Resident) => record.occupation || record.job_title || 'N/A',
      sortable: true,
    },
  ];

  // Define table actions
  const actions: TableAction<Resident>[] = [
    {
      key: 'view',
      label: 'View',
      href: (record: Resident) => `/residents/${record.id}`,
      variant: 'primary',
    },
    {
      key: 'edit',
      label: 'Edit',
      href: (record: Resident) => `/residents/${record.id}/edit`,
      variant: 'secondary',
    },
  ];

  // Define filter options for search
  const filterOptions = [
    {
      field: 'sex',
      label: 'Sex',
      type: 'select' as const,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
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
        { value: 'separated', label: 'Separated' },
      ],
    },
    {
      field: 'occupation',
      label: 'Occupation',
      type: 'text' as const,
    },
    {
      field: 'email',
      label: 'Email',
      type: 'text' as const,
    },
  ];

  return (
    <DashboardLayout searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm}>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600">Residents</h1>
            <p className="font-montserrat text-sm font-normal text-gray-600">
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
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          selection={{
            selectedRowKeys: selectedResidents,
            onChange: handleSelectionChange,
          }}
          rowKey="id"
          emptyText={
            searchTerm
              ? `No residents found matching "${searchTerm}"`
              : 'No residents found. Click "Add new resident" to register your first resident.'
          }
          size="middle"
        />
      </div>
    </DashboardLayout>
  );
}

export default function ResidentsPage() {
  return (
    <ProtectedRoute requirePermission="residents_view">
      <ResidentsContent />
    </ProtectedRoute>
  );
}
