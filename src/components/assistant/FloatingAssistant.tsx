// src/components/assistant/FloatingAssistant.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { assistantService, type ChatMessage } from '@/services/assistant'

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
    <div className="flex items-end gap-2 mb-3">
      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
        <Image src="/icon.png" alt="IESA" width={24} height={24} className="w-full h-full object-cover" />
      </div>
      <div className="rounded-xl rounded-bl-sm px-3 py-2 bg-white/[0.05] border border-white/[0.07]">
        <div className="flex items-center gap-1 h-3.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-emerald-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.13 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [mounted, setMounted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isOpen])

  const open = () => { setIsOpen(true); setHasUnread(false) }
  const close = () => setIsOpen(false)

  const send = async () => {
    const content = input.trim()
    if (!content || loading) return
    const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    try {
      const reply = await assistantService.chat(content, messages)
      setMessages(prev => [...prev, reply])
      if (!isOpen) setHasUnread(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop to close on outside click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9997]" onClick={close} />
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-6 z-[9998] w-[380px] h-[500px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #07150f 0%, #0a1c11 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(13,124,61,0.1)',
            }}>

            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent shrink-0" />

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl overflow-hidden">
                  <Image src="/icon.png" alt="IESA" width={28} height={28} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
                    IESA Assistant
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400/70 font-bold tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini AI
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link href="/dashboard/assistant"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-400/70
                    hover:text-emerald-400 hover:bg-emerald-400/[0.07] transition-colors">
                  Full chat <ArrowUpRight className="w-3 h-3" />
                </Link>
                <button onClick={close}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center
                    text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/10 border border-emerald-500/20
                    flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-white/30 text-xs leading-relaxed px-4">
                    Ask me about tasks, members, events, or any department question
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-end gap-2 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        <Image src="/icon.png" alt="IESA" width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`max-w-[82%] rounded-xl text-xs leading-relaxed break-words px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-[#0d7c3d] text-white rounded-br-sm shadow-[0_2px_10px_rgba(13,124,61,0.3)]'
                        : 'bg-white/[0.05] border border-white/[0.07] text-white/75 rounded-bl-sm'
                    }`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-white/[0.05] shrink-0">
              <div className="flex items-end gap-2 rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-2">
                <textarea ref={textareaRef}
                  value={input} onChange={handleInput} onKeyDown={handleKeyDown}
                  placeholder="Ask anything…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-white text-xs placeholder:text-white/20
                    outline-none leading-relaxed max-h-[80px]"
                  style={{ minHeight: '22px' }}
                />
                <motion.button whileTap={{ scale: 0.9 }} onClick={send}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-[#0d7c3d] flex items-center justify-center text-white
                    shadow-[0_2px_8px_rgba(13,124,61,0.35)] disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
        onClick={open}
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full
          bg-gradient-to-br from-emerald-400 to-[#0a5a2d]
          flex items-center justify-center
          shadow-[0_8px_28px_rgba(13,124,61,0.55)]"
      >
        <Sparkles className="w-6 h-6 text-white" />

        {/* Unread indicator */}
        <AnimatePresence>
          {hasUnread && !isOpen && (
            <motion.span key="dot"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400
                border-2 border-[#040e07] flex items-center justify-center">
              <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-60" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>,
    document.body
  )
}
