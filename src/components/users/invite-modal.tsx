'use client'
import { EXECUTIVE_POSITIONS, type ExecutivePosition, } from '@/utils/positions'  
import { useState } from 'react'
import { X, Mail, Shield, Send, Briefcase } from 'lucide-react'
import API from '@/services/api'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EXEC'>('EXEC')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [position, setPosition] = useState<ExecutivePosition>('Executive Member')


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
        // ✅ FIX: Include position in the request
        await API.post('/auth/invite', { email, role, position })
        setSuccess(`Invitation sent to ${email} as ${position}. They will receive an email with registration link.`)
        setEmail('')
        onSuccess()
      } catch (err: any) {
        setError(err.message || 'Failed to send invitation')
      } finally {
        setLoading(false)
      }
    }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
              <p className="text-sm text-gray-600">Send an invitation to join the department</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@university.edu"
                  className="w-full pl-11 pr-4 py-2.5 text-black bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                They will receive an email with registration link
              </p>
            </div>

            {/* Role */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Role
            </label>
            <div className="grid grid-cols-2 gap-4">
                <button
                type="button"
                onClick={() => setRole('EXEC')}
                className={`p-5 border-2 rounded-xl flex flex-col items-center gap-3 transition-all duration-200 ${
                    role === 'EXEC'
                    ? 'border-[#0d7c3d] bg-gradient-to-br from-[#0d7c3d]/10 to-[#0d7c3d]/5 shadow-sm'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                >
                <div className={`p-3 rounded-lg ${role === 'EXEC' ? 'bg-[#0d7c3d]/10' : 'bg-gray-100'}`}>
                    <Briefcase className={`w-6 h-6 ${role === 'EXEC' ? 'text-[#0d7c3d]' : 'text-gray-400'}`} />
                </div>
                <span className={`font-semibold ${role === 'EXEC' ? 'text-[#0d7c3d]' : 'text-gray-700'}`}>
                    Executive
                </span>
                <span className="text-xs text-gray-500 text-center">
                    Department Member<br />View & contribute access
                </span>
                {role === 'EXEC' && (
                    <div className="w-4 h-4 rounded-full bg-[#0d7c3d] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                )}
                </button>
                
                <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`p-5 border-2 rounded-xl flex flex-col items-center gap-3 transition-all duration-200 ${
                    role === 'ADMIN'
                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-sm'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                >
                <div className={`p-3 rounded-lg ${role === 'ADMIN' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Shield className={`w-6 h-6 ${role === 'ADMIN' ? 'text-purple-600' : 'text-gray-400'}`} />
                </div>
                <span className={`font-semibold ${role === 'ADMIN' ? 'text-purple-700' : 'text-gray-700'}`}>
                    Administrator
                </span>
                <span className="text-xs text-gray-500 text-center">
                    Full system access<br />Manage users & settings
                </span>
                {role === 'ADMIN' && (
                    <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </div>
                )}
                </button>
            </div>
            
            {/* Selected role indicator */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                Selected: <span className="font-semibold">
                    {role === 'EXEC' ? (
                    <span className="text-[#0d7c3d]">Executive Member</span>
                    ) : (
                    <span className="text-purple-600">Administrator</span>
                    )}
                </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                {role === 'EXEC' 
                    ? 'Can view, create, and update department content' 
                    : 'Full access to all features including user management'}
                </p>
            </div>
            </div>


            {/* Position */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
            </label>

            <select
                value={position}
                onChange={(e) => setPosition(e.target.value as ExecutivePosition)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d]"
                required
            >
                {EXECUTIVE_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                    {pos}
                </option>
                ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
                Assigned organizational responsibility within the department
            </p>
            </div>


            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-1">How it works:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• User receives email with registration link</li>
                <li>• Link expires in 24 hours</li>
                <li>• User completes registration at /register</li>
                <li>• Account is created with selected role</li>
              </ul>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-1 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-semibold py-2.5 px-4 rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}