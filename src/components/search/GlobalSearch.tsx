// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\search\GlobalSearch.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, CheckSquare, Calendar, Users, Loader2 } from 'lucide-react'
import { searchService, SearchResult } from '@/services/search'
import { useRouter } from 'next/navigation'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true)
        try {
          const data = await searchService.globalSearch(query)
          setResults(data.results)
          setIsOpen(true)
        } catch (error) {
          console.error('Search failed:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setIsOpen(false)
    setQuery('')
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'task': return <CheckSquare className="h-4 w-4" />
      case 'minutes': return <FileText className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      case 'user': return <Users className="h-4 w-4" />
      default: return null
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'task': return 'bg-blue-100 text-blue-700'
      case 'minutes': return 'bg-emerald-100 text-emerald-700'
      case 'meeting': return 'bg-purple-100 text-purple-700'
      case 'user': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, minutes, meetings, users..."
          className="pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0d7c3d]/20 focus:border-[#0d7c3d] focus:bg-white w-64 transition-all duration-200"
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Search Results ({results.length})
              </span>
              <span className="text-xs text-gray-500">
                Press ESC to close
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                    {result.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {result.date && (
                        <span>{new Date(result.date).toLocaleDateString()}</span>
                      )}
                      {result.assignedTo && (
                        <span>Assigned to: {result.assignedTo}</span>
                      )}
                      {result.status && (
                        <span className="capitalize">{result.status}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-8 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No results found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try different keywords
          </p>
        </div>
      )}
    </div>
  )
}