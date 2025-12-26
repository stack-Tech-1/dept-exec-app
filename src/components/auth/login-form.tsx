'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const result = await authService.login({ email, password })
      
      // Store in cookies instead of localStorage
      document.cookie = `dept_exec_token=${result.token}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `dept_exec_user=${JSON.stringify(result.user)}; path=/; max-age=86400; SameSite=Strict`;
      
      // Also keep in localStorage for backward compatibility with your components
      localStorage.setItem('dept_exec_token', result.token)
      localStorage.setItem('dept_exec_user', JSON.stringify(result.user))
      
      if (rememberMe) {
        localStorage.setItem('dept_exec_remember', 'true')
      }
      
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Department Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="executive@university.edu"
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-[#0d7c3d] hover:text-[#0a5a2d] flex items-center gap-1"
          >
            {showPassword ? (
              <>
                <EyeOff className="w-3 h-3" />
                Hide
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Show
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 bg-white border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all duration-200"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}


      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-[#0d7c3d] border-gray-300 rounded focus:ring-[#0d7c3d]/20"
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => {
            // In a real app, this would trigger a password reset flow
            alert('Please contact department admin for password reset')
          }}
          className="text-sm text-[#0d7c3d] hover:text-[#0a5a2d] font-medium"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-semibold py-3.5 px-4 rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            Access Executive Portal
          </>
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            Department of Industrial & Production Engineering
          </span>
        </div>
      </div>
      </form>
  )
  }