'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components';
import type { TableColumn, TableAction } from '@/components';
import { SearchBar } from '@/components';
import { Button } from '@/components';
import { useResidents, useResidentFilterFields, type Resident, type AdvancedFilters } from '@/hooks/crud/useResidents';
import { ErrorRecovery } from '@/components/molecules/ErrorBoundary/ErrorRecovery';
import { AdvancedFilters as AdvancedFiltersComponent } from '@/components/molecules/AdvancedFilters/AdvancedFilters';


interface SearchFilter {
  field: string;
  label: string;
  type: 'select' | 'input' | 'date';
  options?: { value: string; label: string }[];
}


function ResidentsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [_searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Get filter field definitions
  const filterFields = useResidentFilterFields();

  // Use React Query for data fetching with enhanced error handling
  const { 
    residents, 
    total, 
    isLoading, 
    isFetching, 
    error,
    prefetchNextPage,
    retryManually,
    clearError,
    errorDetails
  } = useResidents({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
    filters: advancedFilters,
  });

  // Note: Advanced filter functionality will be implemented in future version

  // Prefetch next page when scrolling near bottom
  useEffect(() => {
    if (!isLoading && !isFetching) {
      prefetchNextPage();
    }
  }, [pagination.current, prefetchNextPage, isLoading, isFetching]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handleFiltersChange = useCallback((filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handleSelectionChange = (selectedKeys: string[], _selectedRows: Resident[]) => {
    setSelectedResidents(selectedKeys);
  };

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination({ current: page, pageSize });
    },
    []
  );

  const formatFullName = (resident: Resident) => {
    return [resident.first_name, resident.middle_name, resident.last_name, resident.extension_name]
      .filter(Boolean)
      .join(' ');
  };

  const formatAddress = (resident: Resident) => {
    if (!resident.households) return 'No household assigned';
    const parts = [
      resident.households.house_number,
      // Note: street_name and subdivision would need to be fetched separately from geo_streets and geo_subdivisions
      // For now, just show house number
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
          className="font-montserrat text-base font-normal text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:text-gray-200 dark:text-gray-800 hover:underline"
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
      dataIndex: (record: Resident) => record.occupation_code || 'N/A',
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
      href: (record: Resident) => `/residents/${record.id}`,
      variant: 'secondary',
    },
    {
      key: 'delete',
      label: 'Delete',
      onClick: async (record: Resident) => {
        if (window.confirm(`Are you sure you want to delete ${record.first_name} ${record.last_name}?`)) {
          try {
            const response = await fetch(`/api/residents/${record.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });
            
            if (response.ok) {
              // Refresh the residents list
              window.location.reload();
            } else {
              alert('Failed to delete resident');
            }
          } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting resident');
          }
        }
      },
      variant: 'danger',
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

  // Show error recovery component if there's an error
  if (error && !isLoading) {
    return (
      <div className="p-6">
        <ErrorRecovery
          error={error}
          errorDetails={errorDetails}
          onRetry={retryManually}
          onClearError={clearError}
          title="Failed to load residents"
          showDetails={process.env.NODE_ENV === 'development'}
          className="max-w-2xl mx-auto mt-8"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600 dark:text-gray-400">Residents</h1>
            <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400 dark:text-gray-600">
              {total} total residents
              {isFetching && !isLoading && (
                <span className="ml-2 text-blue-600">
                  <svg className="inline w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Updating...
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {error && (
              <Button
                variant="secondary"
                size="md"
                onClick={retryManually}
                disabled={isLoading}
              >
                {isLoading ? 'Retrying...' : 'Retry'}
              </Button>
            )}
            <Link href="/residents/create">
              <Button variant="primary" size="md">
                Add new resident
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar
            placeholder="Search residents by name, email, or occupation..."
            onSearch={handleSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            disabled={isLoading && !residents.length}
          />
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
          <AdvancedFiltersComponent
            fields={filterFields}
            values={advancedFilters}
            onChange={handleFiltersChange}
            loading={isLoading}
            compact={true}
            className="shadow-sm"
          />
        </div>

        {/* Error banner for non-blocking errors */}
        {error && residents.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  Showing cached data - {errorDetails.isNetworkError ? 'connection' : 'server'} issue detected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={retryManually}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                  disabled={isLoading}
                >
                  Retry
                </button>
                <button
                  onClick={clearError}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable<Resident>
          data={residents}
          columns={columns}
          actions={actions}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
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
  );
}

export default function ResidentsPage() {
  return <ResidentsContent />;
}
