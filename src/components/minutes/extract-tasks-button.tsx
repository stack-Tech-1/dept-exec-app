// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\minutes\extract-tasks-button.tsx
'use client'

import { useState } from 'react'
import { CheckSquare, Loader2 } from 'lucide-react'
import { minutesService } from '@/services/minutes'
import { tasksService } from '@/services/tasks'

interface ExtractTasksButtonProps {
  minutesId: string
  minutesText: string
  onTasksCreated?: (tasks: any[]) => void
}

export default function ExtractTasksButton({ minutesId, minutesText, onTasksCreated }: ExtractTasksButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleExtractTasks = async () => {
    if (!confirm('Extract action items from minutes and create tasks?')) return
    
    setLoading(true)
    setMessage('')
    
    try {
      // Call backend endpoint to extract and create tasks
      const response = await minutesService.extractTasks(minutesId)
      
      if (response.tasks && response.tasks.length > 0) {
        setMessage(`✅ Created ${response.tasks.length} tasks from action items`)
        if (onTasksCreated) {
          onTasksCreated(response.tasks)
        }
      } else {
        setMessage('No actionable items found in minutes')
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to extract tasks')
    } finally {
      setLoading(false)
    }
  }

  // Check if minutes has enough text for extraction
  const hasEnoughText = minutesText && minutesText.length > 50

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExtractTasks}
        disabled={loading || !hasEnoughText}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          loading || !hasEnoughText
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          <>
            <CheckSquare className="h-4 w-4" />
            Extract Tasks
          </>
        )}
      </button>
      
      {message && (
        <span className="text-sm text-gray-600 animate-pulse">{message}</span>
      )}
      
      {!hasEnoughText && (
        <span className="text-xs text-gray-500">Add more content to extract tasks</span>
      )}
    </div>
  )
}