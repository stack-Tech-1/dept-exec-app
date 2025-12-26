export const dynamic = 'force-dynamic';
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth';
import { Lock, User, Mail, Loader2, Crown } from 'lucide-react';
import API from '@/services/api';

interface InviteData {
  email: string;
  role: string;
  position: string;
  expiresAt: string;
}

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');


  // Get position badge color
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      'President': 'bg-purple-100 text-purple-800',
      'Vice President': 'bg-blue-100 text-blue-800',
      'General Secretary': 'bg-green-100 text-green-800',
      'Assistant General Secretary': 'bg-emerald-100 text-emerald-800',
      'Treasurer': 'bg-yellow-100 text-yellow-800',
      'Financial Secretary': 'bg-amber-100 text-amber-800',
      'Public Relations Officer': 'bg-pink-100 text-pink-800',
      'Sports Director': 'bg-red-100 text-red-800',
      'Assistant Sports Director': 'bg-orange-100 text-orange-800',
      'Social Director': 'bg-indigo-100 text-indigo-800',
      'Executive Member': 'bg-gray-100 text-gray-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };



  useEffect(() => {
    // Clear any existing auth cookies/tokens when accessing register page
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dept_exec_token');
      localStorage.removeItem('dept_exec_user');
      
      // Also clear cookies
      document.cookie = 'dept_exec_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'dept_exec_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing invitation token.');
        setInviteValid(false);
        setValidating(false);
        return;
      }

      try {
        console.log('Validating token:', token);
        // Call backend to validate token
        const response = await API.get(`/auth/validate-invite/${token}`);
        console.log('Validation response:', response);
        
        // Use type assertion since we know the response structure
        const data = response as any;
        
        if (data.success) {
          setInviteValid(true);
          setInviteData({
            email: data.email,
            role: data.role,
            position: data.position,
            expiresAt: data.expiresAt
          });
        } else {
          setError(data.message || 'Invalid invitation token');
          setInviteValid(false);
        }
      } catch (err: any) {
        console.error('Token validation error:', err);
        setError(err.message || 'Failed to validate invitation. The token may be invalid or expired.');
        setInviteValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invitation token is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration with token:', token);
      await authService.registerWithInvite({
        token,
        name: name.trim(),
        password
      });
      
      alert('Registration successful! You can now login.');
      router.push('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d7c3d]/20 to-[#0a5a2d]/20 mx-auto flex items-center justify-center shadow-lg">
              <Loader2 className="w-10 h-10 text-[#0d7c3d] animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Validating Invitation</h2>
          <p className="text-gray-600">Please wait while we verify your invitation link...</p>
        </div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 mx-auto flex items-center justify-center shadow-lg">
              <div className="text-white font-bold text-xl">!</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-4">{error || 'This invitation link is invalid or has expired.'}</p>
          <p className="text-gray-600">Please contact your department admin for a new invitation.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 text-sm text-[#0d7c3d] hover:text-[#0a5a2d] font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-8 lg:p-12 xl:p-16 bg-white">
      <div className="mx-auto w-full max-w-md space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-lg">
              <div className="text-white font-bold text-xl">IPE</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Registration</h1>
              <p className="text-sm text-gray-600">Create your account</p>
            </div>
          </div>
          
          {/* Invite Information */}
          {inviteData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-800 mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{inviteData.email}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${inviteData.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-[#0d7c3d]/10 text-[#0d7c3d]'}`}>
                  {inviteData.role === 'ADMIN' ? 'Administrator' : 'Executive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPositionColor(inviteData.position)}`}>
                  {inviteData.position}
                </span>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                <p>You're joining as the <strong>{inviteData.position}</strong></p>
              </div>
            </div>
          )}
        </div>

         {/* Registration Form */}
         <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d]"
                  placeholder="John Doe"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be displayed as your official name in the system
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d]"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-black rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d]"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Register as {inviteData?.position}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 px-4">
          By registering, you agree to the department's executive guidelines and responsibilities as {inviteData?.position}
        </p>
      </div>
    </div>
  );
}