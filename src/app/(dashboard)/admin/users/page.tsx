'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib';
import { Button } from '@/components';
import { logger, logError } from '@/lib';

export const dynamic = 'force-dynamic';

interface UserRequest {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  barangay_code: string;
  barangay_name?: string;
  city_municipality_name?: string;
  province_name?: string;
  status: string;
  created_at: string;
  barangay_account_status?: string;
  role_name?: string;
}

interface UserCardProps {
  user: UserRequest;
  showActions?: boolean;
  actionLoading: string | null;
  onApprove: (userId: string, userEmail: string) => void;
  onReject: (userId: string, userEmail: string) => void;
  onSuspend: (userId: string, userEmail: string) => void;
}

function UserCard({
  user,
  showActions = true,
  actionLoading,
  onApprove,
  onReject,
  onSuspend,
}: Readonly<UserCardProps>) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'pending_approval') return 'bg-yellow-100 text-yellow-800';
    if (status === 'suspended') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.mobile_number}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}
          >
            {user.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-2 font-medium">Barangay:</span>
          <span>
            {user.barangay_name}, {user.city_municipality_name}, {user.province_name}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-2 font-medium">Role:</span>
          <span>{user.role_name || 'resident'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="mr-2 font-medium">Registered:</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
      </div>

      {showActions && user.status === 'pending_approval' && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(user.id, user.email)}
            disabled={actionLoading === user.id}
          >
            {actionLoading === user.id ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(user.id, user.email)}
            disabled={actionLoading === user.id}
          >
            Reject
          </Button>
        </div>
      )}

      {showActions && user.status === 'active' && (
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onSuspend(user.id, user.email)}
            disabled={actionLoading === user.id}
          >
            {actionLoading === user.id ? 'Processing...' : 'Suspend'}
          </Button>
        </div>
      )}
    </div>
  );
}

function UsersManagementContent() {
  const [pendingUsers, setPendingUsers] = useState<UserRequest[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Load users with their barangay information
      const { data: users, error } = await supabase
        .from('auth_user_profiles')
        .select(
          `
          *,
          barangay_accounts!inner (
            status,
            role_id,
            roles (
              name
            )
          ),
          psgc_barangays!left (
            name,
            psgc_cities_municipalities!inner (
              name,
              psgc_provinces!inner (
                name
              )
            )
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: UserRequest[] = users.map(user => {
        const barangay = user.psgc_barangays;
        const city = barangay?.psgc_cities_municipalities;
        const province = city?.psgc_provinces;

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          mobile_number: user.mobile_number,
          barangay_code: user.barangay_code,
          barangay_name: barangay?.name,
          city_municipality_name: city?.name,
          province_name: province?.name,
          status: user.status,
          created_at: user.created_at,
          barangay_account_status: user.barangay_accounts[0]?.status,
          role_name: user.barangay_accounts[0]?.roles?.name,
        };
      });

      setPendingUsers(formattedUsers.filter(u => u.status === 'pending_approval'));
      setActiveUsers(formattedUsers.filter(u => u.status === 'active'));
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to load users'),
        'USERS_LOAD_ERROR'
      );
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(userId);

      // Update user profile status
      const { error: profileError } = await supabase
        .from('auth_user_profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (accountError) throw accountError;

      // Refresh users list
      await loadUsers();

      // Feature: Email notification on approval (tracked in issue #email-notifications)
      logger.info('User approved successfully', {
        userId,
        userEmail,
        context: 'user_approval',
      });
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to approve user'),
        'USER_APPROVAL_ERROR'
      );
      logger.error('User approval failed', { userId, userEmail });
      alert('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to reject the registration for ${userEmail}?`)) {
      return;
    }

    try {
      setActionLoading(userId);

      // Update user profile status
      const { error: profileError } = await supabase
        .from('auth_user_profiles')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (accountError) throw accountError;

      // Refresh users list
      await loadUsers();

      // Feature: Email notification on rejection (tracked in issue #email-notifications)
      logger.info('User rejected', {
        userId,
        userEmail,
        context: 'user_rejection',
      });
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to reject user'),
        'USER_REJECTION_ERROR'
      );
      logger.error('User rejection failed', { userId, userEmail });
      alert('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const suspendUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to suspend ${userEmail}?`)) {
      return;
    }

    try {
      setActionLoading(userId);

      // Update user profile status
      const { error: profileError } = await supabase
        .from('auth_user_profiles')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (accountError) throw accountError;

      // Refresh users list
      await loadUsers();

      logger.info('User suspended', {
        userId,
        userEmail,
        context: 'user_suspension',
      });
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to suspend user'),
        'USER_SUSPENSION_ERROR'
      );
      logger.error('User suspension failed', { userId, userEmail });
      alert('Failed to suspend user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex w-full flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="font-montserrat text-xl font-semibold text-gray-600 dark:text-gray-400">
                User Management
              </h1>
              <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
                Manage user registrations and permissions
              </p>
            </div>
            <Button variant="primary" size="md" onClick={loadUsers} disabled={loading}>
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <Button
                onClick={() => setActiveTab('pending')}
                variant="ghost"
                size="sm"
                className={`rounded-none border-b-2 ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-gray-600 dark:text-gray-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Pending Approvals ({pendingUsers.length})
              </Button>
              <Button
                onClick={() => setActiveTab('active')}
                variant="ghost"
                size="sm"
                className={`rounded-none border-b-2 ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-gray-600 dark:text-gray-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Active Users ({activeUsers.length})
              </Button>
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'pending' && (
              <>
                {pendingUsers.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <svg
                        className="mx-auto size-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                      No Pending Registrations
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">All user registrations have been processed.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingUsers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        actionLoading={actionLoading}
                        onApprove={approveUser}
                        onReject={rejectUser}
                        onSuspend={suspendUser}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'active' && (
              <>
                {activeUsers.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      <svg
                        className="mx-auto size-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">No Active Users</h3>
                    <p className="text-gray-500 dark:text-gray-400">No users have been approved yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeUsers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        actionLoading={actionLoading}
                        onApprove={approveUser}
                        onReject={rejectUser}
                        onSuspend={suspendUser}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
  );
}

export default function UsersManagementPage() {
  return (
    <UsersManagementContent />
  );
}
