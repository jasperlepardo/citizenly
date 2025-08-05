'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/templates'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/atoms'

export const dynamic = 'force-dynamic'

interface UserRequest {
  id: string
  email: string
  first_name: string
  last_name: string
  mobile_number: string
  barangay_code: string
  barangay_name?: string
  city_municipality_name?: string
  province_name?: string
  status: string
  created_at: string
  barangay_account_status?: string
  role_name?: string
}

function UsersManagementContent() {
  const [pendingUsers, setPendingUsers] = useState<UserRequest[]>([])
  const [activeUsers, setActiveUsers] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Load users with their barangay information
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select(`
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
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedUsers: UserRequest[] = users.map(user => {
        const barangay = user.psgc_barangays
        const city = barangay?.psgc_cities_municipalities
        const province = city?.psgc_provinces
        
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
          role_name: user.barangay_accounts[0]?.roles?.name
        }
      })

      setPendingUsers(formattedUsers.filter(u => u.status === 'pending_approval'))
      setActiveUsers(formattedUsers.filter(u => u.status === 'active'))
      
    } catch (error: any) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(userId)
      
      // Update user profile status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({ 
          status: 'active',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (accountError) throw accountError

      // Refresh users list
      await loadUsers()
      
      // TODO: Send approval email notification
      console.log(`User ${userEmail} approved successfully`)
      
    } catch (error: any) {
      console.error('Error approving user:', error)
      alert('Failed to approve user. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to reject the registration for ${userEmail}?`)) {
      return
    }

    try {
      setActionLoading(userId)
      
      // Update user profile status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (accountError) throw accountError

      // Refresh users list
      await loadUsers()
      
      // TODO: Send rejection email notification
      console.log(`User ${userEmail} rejected`)
      
    } catch (error: any) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const suspendUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to suspend ${userEmail}?`)) {
      return
    }

    try {
      setActionLoading(userId)
      
      // Update user profile status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Update barangay account status
      const { error: accountError } = await supabase
        .from('barangay_accounts')
        .update({ 
          status: 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (accountError) throw accountError

      // Refresh users list
      await loadUsers()
      
      console.log(`User ${userEmail} suspended`)
      
    } catch (error: any) {
      console.error('Error suspending user:', error)
      alert('Failed to suspend user. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const UserCard = ({ user, showActions = true }: { user: UserRequest, showActions?: boolean }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-secondary">{user.email}</p>
          <p className="text-sm text-secondary">{user.mobile_number}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            user.status === 'active' ? 'bg-green-100 text-green-800' :
            user.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
            user.status === 'suspended' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-secondary">
          <span className="font-medium mr-2">Barangay:</span>
          <span>
            {user.barangay_name}, {user.city_municipality_name}, {user.province_name}
          </span>
        </div>
        <div className="flex items-center text-sm text-secondary">
          <span className="font-medium mr-2">Role:</span>
          <span>{user.role_name || 'resident'}</span>
        </div>
        <div className="flex items-center text-sm text-secondary">
          <span className="font-medium mr-2">Registered:</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
      </div>

      {showActions && user.status === 'pending_approval' && (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => approveUser(user.id, user.email)}
            disabled={actionLoading === user.id}
          >
            {actionLoading === user.id ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => rejectUser(user.id, user.email)}
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
            onClick={() => suspendUser(user.id, user.email)}
            disabled={actionLoading === user.id}
          >
            {actionLoading === user.id ? 'Processing...' : 'Suspend'}
          </Button>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout 
        currentPage="admin"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-sm text-secondary">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      currentPage="admin"
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      <div className="p-6">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-row gap-4 items-start justify-between w-full">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-montserrat font-semibold text-xl text-primary">
              User Management
            </h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              Manage user registrations and permissions
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={loadUsers}
            disabled={loading}
          >
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted hover:text-gray-700 hover:border-gray-300'
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted hover:text-gray-700 hover:border-gray-300'
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
                <div className="text-center py-12">
                  <div className="text-muted mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">No Pending Registrations</h3>
                  <p className="text-muted">All user registrations have been processed.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingUsers.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'active' && (
            <>
              {activeUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">No Active Users</h3>
                  <p className="text-muted">No users have been approved yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeUsers.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}

export default function UsersManagementPage() {
  return (
    <ProtectedRoute requirePermission="manage_users">
      <UsersManagementContent />
    </ProtectedRoute>
  )
}