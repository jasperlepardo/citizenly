'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/organisms';
import { SearchBar } from '@/components/molecules';
import type { TableColumn, TableAction } from '@/components/organisms';
import { useAuth } from '@/contexts/AuthContext';

interface Household {
  code: string;
  name?: string;
  house_number?: string;
  street_name?: string;
  subdivision?: string;
  barangay_code: string;
  region_code?: string;
  province_code?: string;
  city_municipality_code?: string;
  created_at: string;
  head_resident?: {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
  member_count?: number;
  // Geographic information for display
  region_info?: {
    code: string;
    name: string;
  };
  province_info?: {
    code: string;
    name: string;
  };
  city_municipality_info?: {
    code: string;
    name: string;
    type: string;
  };
  barangay_info?: {
    code: string;
    name: string;
  };
}

interface HouseholdsApiResponse {
  data: Household[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

export default function HouseholdsContent() {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { session } = useAuth();
  const router = useRouter();

  const columns: TableColumn<Household>[] = [
    {
      key: 'code',
      title: 'Household Code',
      render: (household: Household) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">{household.code}</span>
      ),
    },
    {
      key: 'head_resident',
      title: 'Household Head',
      render: (household: Household) => {
        if (household.head_resident) {
          const fullName = [
            household.head_resident.first_name,
            household.head_resident.middle_name,
            household.head_resident.last_name,
          ]
            .filter(Boolean)
            .join(' ');
          return <span>{fullName}</span>;
        }
        return <span className="text-gray-500 dark:text-gray-500">No head assigned</span>;
      },
    },
    {
      key: 'address',
      title: 'Address',
      render: (household: Household) => {
        const addressParts = [
          household.house_number,
          household.street_name,
          household.subdivision,
        ].filter(Boolean);
        return <span>{addressParts.length > 0 ? addressParts.join(', ') : 'N/A'}</span>;
      },
    },
    {
      key: 'member_count',
      title: 'Members',
      render: (household: Household) => <span>{household.member_count || 0}</span>,
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (household: Household) => (
        <span>{new Date(household.created_at).toLocaleDateString()}</span>
      ),
    },
  ];

  const actions: TableAction<Household>[] = [
    {
      key: 'view',
      label: 'View Details',
      onClick: (household: Household) => {
        router.push(`/households/${household.code}`);
      },
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: (household: Household) => {
        router.push(`/households/${household.code}/edit`);
      },
    },
  ];

  const fetchHouseholds = async (query = '', pageNum = 1) => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(query && { search: query }),
      });

      const response = await fetch(`/api/households?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch households: ${response.status}`);
      }

      const data: HouseholdsApiResponse = await response.json();
      setHouseholds(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching households:', err);
      setError(err instanceof Error ? err.message : 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds(searchQuery, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, searchQuery, page]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading households...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-xs">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800">Error Loading Households</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => fetchHouseholds(searchQuery, page)}
            className="mt-4 rounded-sm bg-red-600 px-4 py-2 text-white dark:text-black hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-400">Households Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-600">
          Manage and view household information ({households.length} of{' '}
          {totalPages > 1 ? `${(page - 1) * 10 + households.length}` : households.length} total)
        </p>
      </div>

      <SearchBar 
        onSearch={handleSearch} 
        placeholder="Search households by code or head name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <DataTable<Household>
        data={households}
        columns={columns}
        actions={actions}
        pagination={{
          current: page,
          pageSize: 10,
          total: totalPages * 10,
          onChange: pageNum => setPage(pageNum),
        }}
        rowKey="code"
      />
    </div>
  );
}
