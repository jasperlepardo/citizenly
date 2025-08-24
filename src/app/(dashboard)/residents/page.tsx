'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components';
import type { TableColumn, TableAction } from '@/components';
import { SearchBar } from '@/components';
import { Button } from '@/components';
import { useResidents, type Resident } from '@/hooks/crud/useResidents';


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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Use React Query for data fetching
  const { 
    residents, 
    total, 
    isLoading, 
    isFetching, 
    error,
    prefetchNextPage 
  } = useResidents({
    page: pagination.current,
    pageSize: pagination.pageSize,
    searchTerm,
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
    <div className="p-6">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-montserrat mb-0.5 text-xl font-semibold text-gray-600 dark:text-gray-400">Residents</h1>
            <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400 dark:text-gray-600">
              {total} total residents
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

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
