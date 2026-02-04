// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\users\profile-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Building, Briefcase, Save } from 'lucide-react'
import { userService, type User as UserType } from '@/services/user'
import { authService } from '@/services/auth'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
  onUpdate: () => void
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    bio: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const currentUser = authService.getCurrentUser()
  const isOwnProfile = currentUser?.id === user?.id

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        position: user.position || '',
        department: user.department || '',
        bio: user.bio || '',
        phone: user.phone || ''
      })
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isOwnProfile) {
        // Update own profile
        await userService.updateProfile(formData)
        setSuccess('Profile updated successfully')
        
        // Update auth service user data
        const updatedUser = { ...currentUser, ...formData }
        if (typeof window !== 'undefined') {
          localStorage.setItem('dept_exec_user', JSON.stringify(updatedUser))
        }
      } else if (currentUser?.role === 'ADMIN') {
        // Admin updating another user
        await userService.updateUser(user.id, formData)
        setSuccess('User profile updated successfully')
      }

      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isOwnProfile ? 'Edit Your Profile' : `Edit ${user.name}'s Profile`}
              </h2>
              <p className="text-sm text-gray-600">Update profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    required
                    disabled={!isOwnProfile} // Only users can change their own email
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Position
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Department
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm h-32"
                placeholder="Tell us about yourself, your role in the department, etc."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                placeholder="+234 800 000 0000"
              />
            </div>

            {/* User Role (Admin only) */}
            {currentUser?.role === 'ADMIN' && !isOwnProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  User Role
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {/* Handle role change */}}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Administrator
                  </button>
                  <button
                    type="button"
                    onClick={() => {/* Handle role change */}}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      user.role === 'EXEC'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Executive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}