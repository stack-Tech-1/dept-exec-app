// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\dashboard\users\page.tsx
'use client'

import { useState, useEffect } from 'react'
import InviteModal from '@/components/users/invite-modal'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail,
  Shield,
  Building,
  Briefcase,
  Calendar
} from 'lucide-react'
import { authService } from '@/services/auth'
import API from '@/services/api'

interface User {
  _id: string
  name: string
  email: string
  role: 'ADMIN' | 'EXEC'
  department: string
  position: string
  isActive: boolean
  lastLogin: string
  createdAt: string
}

interface UsersResponse {
  success: boolean;
  count: number;
  users: User[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EXEC'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await API.get('/users')
      const data = response as any as UsersResponse;
      setUsers(data.users || [])
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await API.delete(`/users/${userId}`)
      setUsers(users.filter(user => user._id !== userId))
    } catch (err: any) {
      alert(err.message || 'Failed to delete user')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await API.put(`/users/${userId}`, { isActive: !currentStatus })
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ))
    } catch (err: any) {
      alert(err.message || 'Failed to update user status')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase()) ||
      user.position.toLowerCase().includes(search.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#0d7c3d]"></div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            <span>Department Members</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all department executives and administrators
          </p>
        </div>
        
        {currentUser?.role === 'ADMIN' && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-[#0d7c3d] hover:bg-[#0a5a2d] text-white font-semibold py-2 px-3 sm:py-2.5 sm:px-5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Invite New Member</span>
          </button>
        )}
      </div>

      {/* Stats Cards - Stack on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Members</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Administrators</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
            </div>
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Executives</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'EXEC').length}
              </p>
            </div>
            <Briefcase className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Active</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Stack on mobile */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200 text-sm"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="appearance-none w-full sm:w-48 pl-3 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200 text-sm"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="EXEC">Executives</option>
            </select>
            <Filter className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none w-full sm:w-48 pl-3 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <Filter className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <p className="text-red-600 flex items-center gap-2 text-sm">
            <span className="font-semibold">Error:</span> {error}
            <button 
              onClick={fetchUsers}
              className="ml-auto text-xs sm:text-sm text-red-700 hover:text-red-900 underline"
            >
              Retry
            </button>
          </p>
        </div>
      )}

      {/* Users Table - Scroll horizontally on mobile */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-4 md:px-6 py-8 sm:py-12 text-center">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">No members found</p>
                    {search && (
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 bg-gradient-to-br from-[#0d7c3d]/20 to-[#0a5a2d]/20 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-[#0d7c3d] text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-2 sm:ml-3 md:ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                            {user._id === currentUser?.id && (
                              <span className="ml-1 text-xs text-gray-500">(You)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="space-y-1 sm:space-y-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'ADMIN' ? (
                            <>
                              <Shield className="w-3 h-3 mr-1 hidden sm:inline" />
                              <span className="truncate">Admin</span>
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 mr-1 hidden sm:inline" />
                              <span className="truncate">Executive</span>
                            </>
                          )}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="text-sm text-gray-900 truncate">{user.department}</div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 truncate">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.position}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowUserMenu(showUserMenu === user._id ? null : user._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </button>
                        
                        {showUserMenu === user._id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowUserMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                              <div className="py-1">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Edit Profile
                                </button>
                                
                                <button 
                                  onClick={() => handleToggleStatus(user._id, user.isActive)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${user.isActive ? 'bg-red-500' : 'bg-green-500'}`} />
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                
                                {currentUser?.role === 'ADMIN' && currentUser?.id !== user._id && (
                                  <button 
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Delete User
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                <span className="font-medium">{users.length}</span> members
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg">
                  Previous
                </button>
                <button className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-[#0d7c3d] hover:bg-[#0a5a2d] text-white border border-[#0d7c3d] rounded-lg">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5">
        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Members Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-gray-600">Total Members</p>
            <p className="font-semibold">{users.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Administrators</p>
            <p className="font-semibold">{users.filter(u => u.role === 'ADMIN').length}</p>
          </div>
          <div>
            <p className="text-gray-600">Executives</p>
            <p className="font-semibold">{users.filter(u => u.role === 'EXEC').length}</p>
          </div>
          <div>
            <p className="text-gray-600">Active Members</p>
            <p className="font-semibold">{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
      </div>
      
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          fetchUsers();
          setShowInviteModal(false);
        }}
      />
    </div>
  )
}