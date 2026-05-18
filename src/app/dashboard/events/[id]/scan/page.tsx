'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Camera, ScanLine, RefreshCw, AlertTriangle } from 'lucide-react'
import API from '@/services/api'
import { toast } from 'sonner'

/* ── Types ───────────────────────────────────────── */
interface TicketItem { name: string; claimed: boolean; claimedAt?: string }
interface ScannedTicket {
  _id: string
  name: string
  matricNumber?: string
  guestType?: 'NON_STUDENT' | 'EXTERNAL_STUDENT'
  guestDepartment?: string
  isGuest: boolean
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'NOT_REQUIRED'
  checkedIn: boolean
  checkInTime?: string
  items: TicketItem[]
  token: string
  event: { title: string; date: string; time: string; venue: string }
}

type ScanState = 'scanning' | 'loaded' | 'not_found' | 'error'

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const router = useRouter()

  const [scanState, setScanState] = useState<ScanState>('scanning')
  const [ticket, setTicket] = useState<ScannedTicket | null>(null)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [scannerReady, setScannerReady] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scannedRef = useRef(false)

  /* ── Init scanner ────────────────────────────── */
  useEffect(() => {
    if (scanState !== 'scanning') return

    let html5QrCode: any = null
    let stopped = false

    const safeStop = async () => {
      if (!html5QrCode || stopped) return
      stopped = true
      try { await html5QrCode.stop() } catch { /* ignore */ }
    }

    const init = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (stopped) return
        html5QrCode = new Html5Qrcode('qr-reader')
        scannerRef.current = html5QrCode
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          onScanSuccess,
          () => {}
        )
        if (!stopped) setScannerReady(true)
      } catch (err: any) {
        if (!stopped) setScannerError(err?.message || 'Camera permission denied. Please allow camera access and reload.')
      }
    }

    init()
    return () => { safeStop() }
  }, [scanState])

  /* ── Handle scan result ──────────────────────── */
  const onScanSuccess = async (decodedText: string) => {
    if (scannedRef.current) return

    const memberMatch = decodedText.match(/\/picnic\/ticket\/([a-f0-9]{64})/)
    const guestMatch = decodedText.match(/\/events\/guest-ticket\/([a-f0-9]{64})/)
    if (!memberMatch && !guestMatch) return
    scannedRef.current = true

    try { await scannerRef.current?.stop() } catch { /* ignore */ }

    try {
      if (memberMatch) {
        const data = await API.get(`/event-tickets/token/${memberMatch[1]}`) as any
        setTicket({
          _id: data._id,
          name: data.memberName,
          matricNumber: data.matricNumber,
          isGuest: false,
          paymentStatus: data.paymentStatus,
          checkedIn: data.checkedIn,
          checkInTime: data.checkInTime,
          items: data.items,
          token: data.token,
          event: data.event,
        })
      } else if (guestMatch) {
        const data = await API.get(`/guests/token/${guestMatch[1]}`) as any
        setTicket({
          _id: data._id,
          name: data.name,
          guestType: data.type,
          guestDepartment: data.department,
          isGuest: true,
          paymentStatus: data.paymentStatus,
          checkedIn: data.checkedIn,
          checkInTime: data.checkInTime,
          items: data.items,
          token: data.token,
          event: data.event,
        })
      }
      setScanState('loaded')
    } catch (err: any) {
      scannedRef.current = false
      if (err.status === 404) setScanState('not_found')
      else { setScanState('error'); toast.error('Failed to load ticket') }
    }
  }

  /* ── Check In ────────────────────────────────── */
  const handleCheckIn = async () => {
    if (!ticket) return
    setCheckingIn(true)
    try {
      let res: any
      if (ticket.isGuest) {
        res = await API.patch(`/guests/token/${ticket.token}/checkin`, {})
      } else {
        res = await API.put(`/event-tickets/token/${ticket.token}/checkin`, {})
      }
      toast.success(res.message || `✅ ${ticket.name} checked in!`)
      setTicket(prev => prev ? { ...prev, checkedIn: true, checkInTime: new Date().toISOString() } : prev)
    } catch (err: any) {
      if (err.data?.alreadyCheckedIn) {
        toast.info(`${ticket.name} was already checked in`)
        setTicket(prev => prev ? { ...prev, checkedIn: true } : prev)
      } else {
        toast.error(err.message || 'Check-in failed')
      }
    } finally {
      setCheckingIn(false)
    }
  }

  /* ── Redeem Item ─────────────────────────────── */
  const handleRedeem = async (itemName: string) => {
    if (!ticket) return
    setRedeeming(itemName)
    try {
      let res: any
      if (ticket.isGuest) {
        res = await API.patch(`/guests/token/${ticket.token}/redeem`, { itemName })
      } else {
        res = await API.put(`/event-tickets/token/${ticket.token}/redeem`, { itemName })
      }
      toast.success(res.message)
      setTicket(prev => {
        if (!prev) return prev
        return { ...prev, items: prev.items.map(i => i.name === itemName ? { ...i, claimed: true, claimedAt: new Date().toISOString() } : i) }
      })
    } catch (err: any) {
      if (err.data?.alreadyClaimed) {
        toast.info(`${itemName} was already claimed`)
        setTicket(prev => prev ? { ...prev, items: prev.items.map(i => i.name === itemName ? { ...i, claimed: true } : i) } : prev)
      } else {
        toast.error(err.message || `Failed to redeem ${itemName}`)
      }
    } finally {
      setRedeeming(null)
    }
  }

  /* ── Reset scanner ───────────────────────────── */
  const resetScanner = () => {
    scannedRef.current = false
    setTicket(null)
    setScannerReady(false)
    setScannerError('')
    setScanState('scanning')
  }

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="max-w-sm mx-auto space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-black text-white font-display text-lg">QR Scanner</h1>
          <p className="text-white/30 text-xs">Scan member tickets to check in & redeem items</p>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* Scanner view */}
        {scanState === 'scanning' && (
          <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {scannerError ? (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                  <p className="text-white/60 text-sm">{scannerError}</p>
                  <button onClick={resetScanner} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div id="qr-reader" ref={containerRef} className="w-full" />
                    {!scannerReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Camera className="w-8 h-8 text-emerald-400 animate-pulse" />
                          <p className="text-white/50 text-sm">Starting camera…</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-center gap-2 justify-center">
                    <ScanLine className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <p className="text-white/40 text-sm">Point camera at a member or guest ticket QR code</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Ticket loaded */}
        {scanState === 'loaded' && ticket && (
          <motion.div key="ticket" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              {/* Top stripe */}
              <div className={`h-1.5 ${ticket.paymentStatus === 'CONFIRMED' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-amber-500'}`} />

              <div className="p-5 space-y-4">
                {/* Member/Guest info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white font-display">{ticket.name}</h2>
                    {ticket.matricNumber && <p className="text-white/40 text-sm">{ticket.matricNumber}</p>}
                    {ticket.isGuest && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-medium">
                          {ticket.guestType === 'EXTERNAL_STUDENT' ? 'External Student' : 'Guest'}
                        </span>
                        {ticket.guestDepartment && (
                          <span className="text-white/30 text-xs">{ticket.guestDepartment}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {ticket.paymentStatus === 'PENDING' && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                      Unpaid
                    </span>
                  )}
                </div>

                {/* Unpaid warning */}
                {ticket.paymentStatus === 'PENDING' && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-300/70 text-sm">This ticket has not been paid for. Do not allow entry.</p>
                  </div>
                )}

                {/* Check-in (confirmed or not-required = free event) */}
                {(ticket.paymentStatus === 'CONFIRMED' || ticket.paymentStatus === 'NOT_REQUIRED') && (
                  <div>
                    {ticket.checkedIn ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                        <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <div>
                          <p className="text-sky-300 text-sm font-medium">Already Checked In</p>
                          {ticket.checkInTime && (
                            <p className="text-sky-400/50 text-xs">
                              {new Date(ticket.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                        className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        {checkingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Check In
                      </button>
                    )}
                  </div>
                )}

                {/* Items */}
                {(ticket.paymentStatus === 'CONFIRMED' || ticket.paymentStatus === 'NOT_REQUIRED') && ticket.items.length > 0 && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Redeem Items</p>
                    <div className="space-y-2">
                      {ticket.items.map(item => (
                        <div key={item.name}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${item.claimed
                            ? 'bg-white/[0.01] border-white/5'
                            : 'bg-emerald-500/5 border-emerald-500/20'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.claimed ? 'bg-white/5' : 'bg-emerald-500/20'}`}>
                              {item.claimed
                                ? <CheckCircle className="w-3 h-3 text-white/25" />
                                : <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              }
                            </div>
                            <span className={`text-sm font-medium ${item.claimed ? 'text-white/25 line-through' : 'text-white/80'}`}>
                              {item.name}
                            </span>
                          </div>

                          {item.claimed ? (
                            <span className="text-[10px] text-white/20">
                              {item.claimedAt ? new Date(item.claimedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'claimed'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRedeem(item.name)}
                              disabled={redeeming === item.name}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                            >
                              {redeeming === item.name ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                              Give
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan next */}
            <button
              onClick={resetScanner}
              className="w-full mt-3 py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/50 hover:text-white/80 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ScanLine className="w-4 h-4" />
              Scan Next Ticket
            </button>
          </motion.div>
        )}

        {/* Not found */}
        {scanState === 'not_found' && (
          <motion.div key="notfound" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-3">
            <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-white/70 font-semibold">Ticket Not Found</p>
            <p className="text-white/30 text-sm">This QR code doesn't match any ticket.</p>
            <button onClick={resetScanner} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">
              Try Again
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
