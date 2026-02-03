// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\goals\create-goal-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Target, Flag, Tag, Users, DollarSign, BarChart, FileText, Plus, Minus } from 'lucide-react'
import { userService, type User } from '@/services/user'

interface CreateGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGoal: (data: any) => Promise<void>
}

export default function CreateGoalModal({ isOpen, onClose, onCreateGoal }: CreateGoalModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('administrative')
  const [targetDate, setTargetDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [department, setDepartment] = useState('IPE Department')
  const [assignedTo, setAssignedTo] = useState<string[]>([])
  const [kpis, setKpis] = useState<Array<{ name: string; target: number; unit: string }>>([])
  const [budget, setBudget] = useState({ allocated: 0, currency: 'NGN' })
  const [milestones, setMilestones] = useState<Array<{ title: string; description: string; targetDate: string }>>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [executives, setExecutives] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingExecutives, setLoadingExecutives] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchExecutives()
    }
  }, [isOpen])

  const fetchExecutives = async () => {
    try {
      setLoadingExecutives(true)
      const data = await userService.getAllUsers()
      const execs = data.filter(user => user.role === 'EXEC' && user.isActive)
      setExecutives(execs)
    } catch (error) {
      console.error('Failed to fetch executives:', error)
    } finally {
      setLoadingExecutives(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !targetDate) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const goalData = {
        title,
        description,
        category,
        targetDate,
        priority,
        department,
        assignedTo,
        kpis: kpis.filter(kpi => kpi.name && kpi.target > 0),
        budget,
        milestones: milestones.filter(m => m.title && m.targetDate),
        tags
      }

      await onCreateGoal(goalData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('Failed to create goal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('administrative')
    setTargetDate('')
    setPriority('medium')
    setDepartment('IPE Department')
    setAssignedTo([])
    setKpis([])
    setBudget({ allocated: 0, currency: 'NGN' })
    setMilestones([])
    setTags([])
    setTagInput('')
  }

  const handleAddKpi = () => {
    setKpis([...kpis, { name: '', target: 0, unit: '' }])
  }

  const handleUpdateKpi = (index: number, field: string, value: string | number) => {
    const updatedKpis = [...kpis]
    updatedKpis[index] = { ...updatedKpis[index], [field]: value }
    setKpis(updatedKpis)
  }

  const handleRemoveKpi = (index: number) => {
    setKpis(kpis.filter((_, i) => i !== index))
  }

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', targetDate: '' }])
  }

  const handleUpdateMilestone = (index: number, field: string, value: string) => {
    const updatedMilestones = [...milestones]
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value }
    setMilestones(updatedMilestones)
  }

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const toggleAssignee = (userId: string) => {
    if (assignedTo.includes(userId)) {
      setAssignedTo(assignedTo.filter(id => id !== userId))
    } else {
      setAssignedTo([...assignedTo, userId])
    }
  }

  const categories = [
    { value: 'academic', label: 'Academic', color: 'bg-purple-100 text-purple-700' },
    { value: 'administrative', label: 'Administrative', color: 'bg-blue-100 text-blue-700' },
    { value: 'social', label: 'Social', color: 'bg-pink-100 text-pink-700' },
    { value: 'infrastructure', label: 'Infrastructure', color: 'bg-amber-100 text-amber-700' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
    { value: 'critical', label: 'Critical', color: 'bg-rose-100 text-rose-700' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
            <p className="text-sm text-gray-600 mt-1">Define a new department objective</p>
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
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#0d7c3d]" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    placeholder="e.g., Department Orientation 2025"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Target Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          category === cat.value 
                            ? cat.color 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((prio) => (
                      <button
                        key={prio.value}
                        type="button"
                        onClick={() => setPriority(prio.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                          priority === prio.value 
                            ? prio.color 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Flag className="h-3 w-3" />
                        {prio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm h-32"
                    placeholder="Describe the goal, its purpose, and expected outcomes..."
                  />
                </div>
              </div>
            </div>

            {/* Assignees */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0d7c3d]" />
                Assignees
              </h3>
              
              {loadingExecutives ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0d7c3d] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading executives...</p>
                </div>
              ) : executives.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No executives found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {executives.map((exec) => (
                    <div
                      key={exec.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                        assignedTo.includes(exec.id)
                          ? 'border-[#0d7c3d] bg-[#0d7c3d]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleAssignee(exec.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] flex items-center justify-center text-white font-bold">
                          {exec.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{exec.name}</div>
                          <div className="text-sm text-gray-600">{exec.position}</div>
                        </div>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          assignedTo.includes(exec.id)
                            ? 'bg-[#0d7c3d] border-[#0d7c3d]'
                            : 'bg-white border-gray-300'
                        }`}>
                          {assignedTo.includes(exec.id) && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Performance Indicators (KPIs) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-[#0d7c3d]" />
                Key Performance Indicators
              </h3>
              
              <div className="space-y-3">
                {kpis.map((kpi, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={kpi.name}
                        onChange={(e) => handleUpdateKpi(index, 'name', e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                        placeholder="KPI Name"
                      />
                      <input
                        type="number"
                        value={kpi.target}
                        onChange={(e) => handleUpdateKpi(index, 'target', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                        placeholder="Target Value"
                      />
                      <input
                        type="text"
                        value={kpi.unit}
                        onChange={(e) => handleUpdateKpi(index, 'unit', e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                        placeholder="Unit (e.g., %, NGN, students)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKpi(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddKpi}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-[#0d7c3d] hover:border-[#0d7c3d]/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add KPI
                </button>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#0d7c3d]" />
                Budget
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Allocated Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={budget.allocated}
                      onChange={(e) => setBudget({ ...budget, allocated: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Currency
                  </label>
                  <select
                    value={budget.currency}
                    onChange={(e) => setBudget({ ...budget, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                  >
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0d7c3d]" />
                Milestones
              </h3>
              
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={milestone.title}
                          onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                          placeholder="Milestone Title"
                        />
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="date"
                            value={milestone.targetDate}
                            onChange={(e) => handleUpdateMilestone(index, 'targetDate', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        className="p-2 text-gray-400 hover:text-red-600 ml-2"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => handleUpdateMilestone(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                      placeholder="Milestone description..."
                      rows={2}
                    />
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-[#0d7c3d] hover:border-[#0d7c3d]/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Milestone
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#0d7c3d]" />
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-sm"
                    placeholder="Add a tag (e.g., orientation, accreditation, social)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2.5 bg-[#0d7c3d] text-white font-medium rounded-xl hover:bg-[#0d7c3d]/90 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0d7c3d]/10 text-[#0d7c3d] rounded-lg text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-[#0d7c3d] hover:text-[#0a5a2d]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

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
              className="px-6 py-2.5 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}