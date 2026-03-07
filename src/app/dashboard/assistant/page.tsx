// src/app/dashboard/assistant/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, Send, Trash2, Users, AlertCircle, LifeBuoy, CalendarDays } from 'lucide-react'
import Image from 'next/image'
import { assistantService, type ChatMessage, type AssistantSuggestions } from '@/services/assistant'

/* ─── Simple markdown renderer ───────────────────── */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br />')
}

/* ─── Typing indicator ───────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-4">
      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
        <Image src="/icon.png" alt="IESA" width={28} height={28} className="w-full h-full object-cover" />
      </div>
      <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-white/[0.04] border border-white/[0.07]">
        <div className="flex items-center gap-1.5 h-4">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Stat chip ──────────────────────────────────── */
function StatChip({ icon: Icon, label, value, color, onClick }: {
  icon: React.ElementType; label: string; value: number; color: string; onClick: () => void
}) {
  return (
    <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#06100a] border border-white/[0.06]
        hover:border-emerald-500/25 transition-colors text-left">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + '18', border: `1px solid ${color}28` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-black leading-none" style={{ fontFamily: 'Syne, sans-serif', color }}>{value}</p>
        <p className="text-[10px] text-white/30 font-bold tracking-[0.12em] uppercase mt-0.5">{label}</p>
      </div>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════ ROOT ═══ */
export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<AssistantSuggestions | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    assistantService.getSuggestions().then(setSuggestions).catch(console.error)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    try {
      const reply = await assistantService.chat(content, messages)
      setMessages(prev => [...prev, reply])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const stats = suggestions?.stats
  const statChips = stats ? [
    { icon: Users,       label: 'Total Members',   value: stats.memberCount,    color: '#e5e7eb', q: 'How many members do we have and what are their roles?' },
    { icon: AlertCircle, label: 'Overdue Tasks',   value: stats.overdueTasks,   color: '#f87171', q: 'Which tasks are overdue and who is responsible?' },
    { icon: LifeBuoy,    label: 'Open Tickets',    value: stats.openTickets,    color: '#f59e0b', q: 'What are the open welfare tickets and their status?' },
    { icon: CalendarDays,label: 'Upcoming Events', value: stats.upcomingEvents, color: '#60a5fa', q: 'What events are coming up in the next two weeks?' },
  ] : []

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto space-y-4 pb-4">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
              flex items-center justify-center shadow-[0_4px_16px_rgba(13,124,61,0.4)]">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  IESA Assistant
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                  bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  <Sparkles className="w-2.5 h-2.5" />Gemini AI
                </span>
              </div>
              <p className="text-xs text-white/30">Ask anything about IESA department operations</p>
            </div>
          </div>
          {messages.length > 0 && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setMessages([])}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08]
                text-white/35 text-xs font-semibold hover:text-white/60 hover:border-white/18 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Clear
            </motion.button>
          )}
        </motion.div>

        {/* ── Stats chips ── */}
        {statChips.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {statChips.map(c => (
              <StatChip key={c.label} icon={c.icon} label={c.label} value={c.value} color={c.color}
                onClick={() => { setInput(c.q); textareaRef.current?.focus() }} />
            ))}
          </motion.div>
        )}

        {/* ── Chat area ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex-1 overflow-y-auto rounded-2xl bg-[#06100a] border border-white/[0.06] p-4 min-h-0"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>

          {/* Empty state — suggested prompts */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-[#0d7c3d]/10
                border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white/50 text-sm font-semibold mb-1">How can I help you today?</p>
                <p className="text-white/20 text-xs">Ask about tasks, members, events, or department stats</p>
              </div>
              {suggestions?.suggestions && suggestions.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestions.suggestions.map((s, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => send(s)}
                      className="px-3.5 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]
                        text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition-colors">
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-end gap-2.5 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                    <Image src="/icon.png" alt="IESA" width={28} height={28} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className={`max-w-[78%] ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d] text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm shadow-[0_4px_16px_rgba(13,124,61,0.3)]'
                  : 'bg-white/[0.04] border border-white/[0.07] text-white/80 rounded-2xl rounded-bl-sm px-4 py-3 text-sm'
                }`}>
                  <p className="leading-relaxed break-words"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/45 text-right' : 'text-white/25'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </motion.div>

        {/* ── Input bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-[#06100a] border border-white/[0.06] p-3"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>
          <div className="flex items-end gap-3">
            <textarea ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about tasks, members, meetings, welfare tickets…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-white text-sm placeholder:text-white/20
                outline-none py-2 px-1 max-h-[120px] leading-relaxed"
              style={{ minHeight: '36px' }}
            />
            <div className="flex items-center gap-2 shrink-0">
              {input.length > 0 && (
                <span className="text-[10px] text-white/20">{input.length}</span>
              )}
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0d7c3d] to-[#0a5a2d]
                  flex items-center justify-center text-white
                  shadow-[0_4px_14px_rgba(13,124,61,0.4)] disabled:opacity-40 disabled:cursor-not-allowed
                  transition-opacity">
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-[10px] text-white/15 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
        </motion.div>
      </div>
    </>
  )
}
