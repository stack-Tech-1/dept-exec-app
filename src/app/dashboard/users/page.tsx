// src/app/dashboard/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Search, ChevronDown, MoreVertical,
  Edit, Trash2, Mail, Shield, Building, Briefcase, Calendar, X, AlertCircle
} from 'lucide-react'
import InviteModal from '@/components/users/invite-modal'
import ProfileModal from '@/components/users/profile-modal'
import { authService } from '@/services/auth'
import API from '@/services/api'

interface User {
  id: string; _id: string; name: string; email: string
  role: 'ADMIN' | 'EXEC'; department: string; position: string
  isActive: boolean; lastLogin: string; createdAt: string; updatedAt: string
}

/* ─── Count-up number ────────────────────────────── */
function CountUp({ value, color }: { value: number; color: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0; const steps = 24; const inc = value / steps
    const t = setInterval(() => { i += inc; if (i >= value) { setCount(value); clearInterval(t) } else setCount(Math.floor(i)) }, 42)
    return () => clearInterval(t)
  }, [value])
  return <span style={{ color }}>{count}</span>
}

/* ─── Avatar with initials ───────────────────────── */
function Avatar({ name, color, size = 9 }: { name: string; color: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-full flex items-center justify-center font-black text-sm shrink-0`}
      style={{ background: color + '22', border: `1.5px solid ${color}38`, color, width: size * 4, height: size * 4, fontSize: size < 10 ? 12 : 14 }}>
      {initials}
    </div>
  )
}

/* ─── Role chip ──────────────────────────────────── */
function RoleChip({ role }: { role: string }) {
  return role === 'ADMIN'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-violet-400/10 text-violet-400 border border-violet-400/20">
        <Shield className="w-2.5 h-2.5" />Admin
      </span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-400/10 text-sky-400 border border-sky-400/20">
        <Briefcase className="w-2.5 h-2.5" />Executive
      </span>
}

/* ─── Active status chip ─────────────────────────── */
function StatusChip({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border
      ${isActive ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-white/[0.04] text-white/30 border-white/[0.07]'}`}>
      <span className="relative flex w-1.5 h-1.5">
        {isActive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`} />
      </span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

const AVATAR_COLORS = ['#3b82f6','#10b981','#a78bfa','#f472b6','#f59e0b','#34d399','#60a5fa','#f87171']
const getUserColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'EXEC'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [positionFilter, setPositionFilter] = useState('ALL')
  const [showUserMenu, setShowUserMenu] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null)

  const currentUser = authService.getCurrentUser()
  const positions = Array.from(new Set(users.map(u => u.position).filter(Boolean))).sort()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true); setError('')
      const response = await API.get('/users') as any
      const transformed = response.users?.map((u: any) => ({ ...u, id: u._id })) || []
      setUsers(transformed)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await API.delete(`/users/${userId}`)
      setUsers(users.filter(u => u._id !== userId))
    } catch (err: any) { alert(err.message || 'Failed to delete user') }
  }

  const handleToggleStatus = async (userId: string, current: boolean) => {
    try {
      await API.put(`/users/${userId}`, { isActive: !current })
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !current } : u))
    } catch (err: any) { alert(err.message || 'Failed to update status') }
  }

  const handleEditProfile = (user: User) => {
    setSelectedUserForEdit(user)
    setShowProfileModal(true)
    setShowUserMenu(null)
  }

  const filteredUsers = users.filter(u => {
    const ms = search === '' || [u.name, u.email, u.department, u.position].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    const mr = roleFilter === 'ALL' || u.role === roleFilter
    const mst = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive)
    const mp = positionFilter === 'ALL' || u.position === positionFilter
    return ms && mr && mst && mp
  })

  const statCards = [
    { value: users.length, label: 'Total Members', color: '#e5e7eb', Icon: Users },
    { value: users.filter(u => u.role === 'ADMIN').length, label: 'Administrators', color: '#a78bfa', Icon: Shield },
    { value: users.filter(u => u.role === 'EXEC').length, label: 'Executives', color: '#60a5fa', Icon: Briefcase },
    { value: users.filter(u => u.isActive).length, label: 'Active Now', color: '#10b981', Icon: Building },
  ]

  const selCls = `appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
    text-white/60 text-sm outline-none focus:border-emerald-500/40 transition-all cursor-pointer`

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div className="w-10 h-10 rounded-full border-2 border-[#0d7c3d]/20 border-t-[#0d7c3d]"
          animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>
      <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSuccess={() => { fetchUsers(); setShowInviteModal(false) }} />
      <ProfileModal isOpen={showProfileModal} onClose={() => { setShowProfileModal(false); setSelectedUserForEdit(null) }} user={selectedUserForEdit} onUpdate={fetchUsers} />

      <div className="space-y-5 pb-24 lg:pb-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] text-emerald-400/65 font-bold tracking-[0.22em] uppercase mb-1">Administration</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Department Members
            </h1>
            <p className="text-sm text-white/30 mt-1">Manage all executives and administrators</p>
          </div>
          {currentUser?.role === 'ADMIN' && (
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowInviteModal(true)}
              className="relative overflow-hidden inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl
                bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-bold text-sm self-start sm:self-auto
                shadow-[0_8px_24px_rgba(13,124,61,0.35)]">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
              <UserPlus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Invite Member</span>
            </motion.button>
          )}
        </motion.div>

        {/* ── Stat Chips ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[#06100a] border border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black leading-none mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
                  <CountUp value={s.value} color={s.color} />
                </p>
                <p className="text-[11px] text-white/30 font-bold tracking-[0.12em] uppercase">{s.label}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '14', border: `1px solid ${s.color}22` }}>
                <s.Icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#06100a] border border-white/[0.06]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400/45" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search members by name, email…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]
                text-white text-sm placeholder:text-white/18 outline-none
                focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {[
            { val: roleFilter,     set: (v: any) => setRoleFilter(v),   opts: [['ALL','All Roles'],['ADMIN','Admins'],['EXEC','Executives']] },
            { val: positionFilter, set: setPositionFilter,              opts: [['ALL','All Positions'], ...positions.map(p => [p, p])] },
            { val: statusFilter,   set: (v: any) => setStatusFilter(v), opts: [['ALL','All Status'],['ACTIVE','Active'],['INACTIVE','Inactive']] },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.val} onChange={e => sel.set(e.target.value)} className={selCls}>
                {sel.opts.map(([v, l]) => <option key={v} value={v} className="bg-[#06100a] text-white">{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* ── Error ── */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-rose-400 text-sm flex-1">{error}</p>
            <button onClick={fetchUsers} className="text-xs text-rose-400/70 hover:text-rose-400 underline shrink-0">Retry</button>
          </motion.div>
        )}

        {/* ── Table ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Member','Role & Status','Department','Last Active','Actions'].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Users className="w-10 h-10 text-white/8 mx-auto mb-3" />
                      <p className="text-white/22 text-sm">No members found</p>
                    </td>
                  </tr>
                ) : filteredUsers.map((user, i) => {
                  const color = getUserColor(user.name)
                  return (
                    <motion.tr key={user._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                      className="group border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors duration-200">

                      {/* Member */}
                      <td className="py-4 pl-5 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} color={color} size={9} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-white/82 group-hover:text-white transition-colors truncate">
                                {user.name}
                              </p>
                              {user._id === currentUser?.id && (
                                <span className="text-[10px] text-emerald-400/60 font-bold">(You)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-white/28 mt-0.5">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px]">{user.email}</span>
                            </div>
                            <p className="text-[10px] text-white/20 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <RoleChip role={user.role} />
                          <StatusChip isActive={user.isActive} />
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-4">
                        <p className="text-sm text-white/60 truncate">{user.department}</p>
                        <div className="flex items-center gap-1 text-[11px] text-white/28 mt-0.5">
                          <Building className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{user.position}</span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/38">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400/35" />
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-5 pl-4">
                        <div className="relative">
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => setShowUserMenu(showUserMenu === user._id ? null : user._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg
                              bg-white/[0.05] border border-white/[0.08] flex items-center justify-center
                              text-white/35 hover:text-white/70 hover:bg-white/[0.08]">
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>

                          <AnimatePresence>
                            {showUserMenu === user._id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -6 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 mt-1 w-44 rounded-2xl overflow-hidden z-50"
                                  style={{
                                    background: 'linear-gradient(145deg, #0a1c11, #061510)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(13,124,61,0.1)',
                                  }}>
                                  <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                                  <div className="py-1.5">
                                    <button onClick={() => handleEditProfile(user)}
                                      className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
                                      <Edit className="w-3.5 h-3.5 text-emerald-400/60" />Edit Profile
                                    </button>
                                    <button onClick={() => handleToggleStatus(user._id, user.isActive)}
                                      className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
                                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                      {user.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    {currentUser?.role === 'ADMIN' && currentUser?.id !== user._id && (
                                      <>
                                        <div className="mx-3 my-1 h-px bg-white/[0.06]" />
                                        <button onClick={() => handleDeleteUser(user._id)}
                                          className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-colors">
                                          <Trash2 className="w-3.5 h-3.5" />Delete User
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-white/[0.05]">
              <span className="text-xs text-white/25">Showing <span className="text-white/50 font-semibold">{filteredUsers.length}</span> of <span className="text-white/50 font-semibold">{users.length}</span> members</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white/65 transition-colors">Previous</button>
                <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0d7c3d]/80 border border-[#0d7c3d]/40 text-white hover:bg-[#0d7c3d] transition-colors">Next</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}