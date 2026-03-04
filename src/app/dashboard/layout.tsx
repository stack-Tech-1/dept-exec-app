// src/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import DashboardSidebar from '@/components/layout/dashboard-sidebar'
import DashboardHeader from '@/components/layout/dashboard-header'

/* ─── Animated SVG mesh background ──────────────── */
function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary radial: bottom-left green glow */}
      <motion.div
        className="absolute"
        style={{
          width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,124,61,0.07) 0%, transparent 70%)',
          left: '-10%', bottom: '-15%',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary: top-right whisper */}
      <motion.div
        className="absolute"
        style={{
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,124,61,0.04) 0%, transparent 70%)',
          right: '5%', top: '-10%',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Dot grid texture */}
      <div className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(13,124,61,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-px
        bg-gradient-to-r from-transparent via-[#0d7c3d]/20 to-transparent" />
    </div>
  )
}

/* ─── Auth guard spinner ──────────────────────────── */
function AuthSpinner() {
  return (
    <div className="min-h-screen bg-[#040e07] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for token in cookie or localStorage
    const token = document.cookie.includes('dept_exec_token') ||
      !!localStorage.getItem('dept_exec_token')

    if (!token) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
    }
    setChecking(false)
  }, [router])

  if (checking) return <AuthSpinner />
  if (!isAuthenticated) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif !important; }
      `}</style>

      {/* Dark base */}
      <div className="min-h-screen bg-[#040e07] relative">
        {/* Animated mesh behind everything */}
        <MeshBackground />

        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main area pushed right of sidebar on desktop */}
        <div className="relative z-10 lg:ml-64 flex flex-col min-h-screen">
          {/* Header */}
          <DashboardHeader />

          {/* Page content */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 py-4 px-2 sm:py-5 sm:px-3 md:px-4 lg:px-6"
          >
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </motion.main>

          {/* Bottom fade for mobile command pill clearance */}
          <div className="h-4 lg:hidden" />
        </div>
      </div>
    </>
  )
}