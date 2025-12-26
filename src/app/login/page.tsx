// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\app\login\page.tsx
import LoginForm from '@/components/auth/login-form'
import { Shield, Users, Target, Calendar } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-white order-2 lg:order-1">
        <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-3 sm:space-y-4">
            {/* Department Logo Section */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg sm:text-xl">IPE</div>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Industrial & Production Engineering</h1>
                <p className="text-xs sm:text-sm text-gray-600">Department Executive Portal</p>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Executive Management System
              </h2>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">
                Secure platform for department leadership coordination
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 md:p-8 shadow-lg">
            <LoginForm />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 px-2 sm:px-4">
            Access restricted to authorized department executives only
          </p>
        </div>
      </div>

      {/* Right side - Preview - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:order-2 flex-col justify-center p-8 sm:p-12 bg-gradient-to-br from-[#0d7c3d]/10 via-white to-[#0d7c3d]/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-[#0d7c3d]/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        <div className="relative space-y-6 sm:space-y-8 md:space-y-10 max-w-lg mx-auto">
          {/* Feature Card 1 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Goal Management</h3>
                <p className="text-xs sm:text-sm text-gray-600">Track department objectives</p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0d7c3d] w-3/4"></div>
              </div>
              <p className="text-xs text-gray-500">75% of quarterly goals completed</p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="mb-3 sm:mb-4">
              <div className="text-xs sm:text-sm font-medium text-white/80 mb-1">MEETING MANAGEMENT</div>
              <h3 className="text-lg sm:text-xl font-bold">Professional Documentation</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                <span className="text-xs sm:text-sm">Meeting minutes with recordings</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                <span className="text-xs sm:text-sm">Zoom integration</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                <span className="text-xs sm:text-sm">Action item tracking</span>
              </li>
            </ul>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Team Accountability</h3>
                <p className="text-xs sm:text-sm text-gray-600">Track executive performance</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-600">Active Executives</span>
              <span className="font-bold text-[#0d7c3d]">15 members</span>
            </div>
          </div>

          {/* Department Quote */}
          <div className="text-center p-4 sm:p-6 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200">
            <p className="text-base sm:text-lg text-gray-800 italic">
              "Engineering For Higher Productivity and Efficiency"
            </p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">— Department of Industrial & Production Engineering</p>
          </div>
        </div>
      </div>
    </div>
  )
}