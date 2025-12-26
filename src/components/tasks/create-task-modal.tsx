'use client'

import { useState } from 'react'
import { X, Calendar, User, Target, FileText } from 'lucide-react'
import { format } from 'date-fns'

const executives = [
  { id: 1, name: 'Treasurer', initials: 'TR', color: 'bg-blue-500' },
  { id: 2, name: 'Secretary', initials: 'SC', color: 'bg-emerald-500' },
  { id: 3, name: 'PRO', initials: 'PR', color: 'bg-purple-500' },
  { id: 4, name: 'Social Media Head', initials: 'SM', color: 'bg-pink-500' },
  { id: 5, name: 'Academic Head', initials: 'AH', color: 'bg-amber-500' },
]

const goals = [
  { id: 1, title: 'Department Orientation 2024' },
  { id: 2, title: 'Faculty Accreditation' },
  { id: 3, title: 'Alumni Networking Event' },
]

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (taskData: any) => void
}

export default function CreateTaskModal({ isOpen, onClose, onCreateTask }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    goalId: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.assignedTo) {
      alert('Please assign the task to an executive')
      return
    }

    const selectedExecutive = executives.find(e => e.name === formData.assignedTo)
    
    const newTask = {
      id: Date.now(), // Temporary ID
      title: formData.title,
      description: formData.description,
      assignedTo: selectedExecutive || executives[0],
      dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
      priority: formData.priority,
      status: 'pending',
      progress: 0,
    }

    console.log('Creating task:', newTask)
    onCreateTask(newTask)
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      goalId: '',
    })
    
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <p className="text-sm text-gray-600">Assign tasks to department executives</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Prepare budget proposal for faculty board"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task details, expectations, and deliverables..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee - Enhanced */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Assign To Executive *
  </label>
  <div className="relative">
    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
    <select
      name="assignedTo"
      value={formData.assignedTo}
      onChange={handleChange}
      className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] bg-white text-gray-900 appearance-none cursor-pointer"
      required
    >
      <option value="" className="text-gray-500">Select executive</option>
      {executives.map(exec => (
        <option key={exec.id} value={exec.name} className="text-gray-900">
          {exec.name}
        </option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>

{/* Due Date */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Due Date *
  </label>
  <div className="relative">
    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
    <input
      type="date"
      name="dueDate"
      value={formData.dueDate}
      onChange={handleChange}
      min={format(new Date(), 'yyyy-MM-dd')}
      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] text-gray-900 bg-white"
      required
    />
  </div>
</div>

{/* Priority - Enhanced */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Priority
  </label>
  <div className="relative">
    <select
      name="priority"
      value={formData.priority}
      onChange={handleChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] bg-white text-gray-900 appearance-none cursor-pointer pr-10"
    >
      <option value="low" className="text-gray-900">Low</option>
      <option value="medium" className="text-gray-900">Medium</option>
      <option value="high" className="text-gray-900">High</option>
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>

{/* Related Goal - Enhanced */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Related Goal (Optional)
  </label>
  <div className="relative">
    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
    <select
      name="goalId"
      value={formData.goalId}
      onChange={handleChange}
      className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] bg-white text-gray-900 appearance-none cursor-pointer"
    >
      <option value="" className="text-gray-500">Select goal (optional)</option>
      {goals.map(goal => (
        <option key={goal.id} value={goal.id} className="text-gray-900">
          {goal.title}
        </option>
      ))}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-[#0d7c3d] to-[#0a5a2d] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#0d7c3d]/20 transition-all"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}