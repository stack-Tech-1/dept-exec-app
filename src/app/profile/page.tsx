'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Shield, Building, Calendar } from 'lucide-react'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
    } else {
      setUser(currentUser)
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7c3d]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </span>
                  <span className="text-white/80 text-sm">
                    {user.position || 'Executive Member'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#0d7c3d]" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Full Name
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Building className="h-5 w-5 text-[#0d7c3d]" />
                  Department Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Department
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user.department || 'Industrial & Production Engineering'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Role
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className={`font-medium ${
                        user.role === 'ADMIN' ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0d7c3d]" />
                Account Activity
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0d7c3d]/5 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-[#0d7c3d]">15</p>
                  <p className="text-sm text-gray-600">Tasks Assigned</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-gray-600">Tasks Completed</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">12</p>
                  <p className="text-sm text-gray-600">Meetings Attended</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">24</p>
                  <p className="text-sm text-gray-600">Days Active</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => authService.logout()}
                className="px-6 py-2.5 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}