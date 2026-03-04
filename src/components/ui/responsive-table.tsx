// src/components/ui/responsive-table.tsx
'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Header {
  key: string
  label: string
  mobileLabel?: string
  className?: string
}

interface ResponsiveTableProps {
  headers: Header[]
  data: any[]
  renderRow: (item: any) => ReactNode
  emptyMessage?: string
  emptyIcon?: ReactNode
}

export default function ResponsiveTable({
  headers, data, renderRow, emptyMessage, emptyIcon
}: ResponsiveTableProps) {

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-[#06100a] border border-white/[0.06] py-16 flex flex-col items-center gap-3"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
        {emptyIcon && <div className="text-white/10">{emptyIcon}</div>}
        <p className="text-white/22 text-sm">{emptyMessage || 'No data found'}</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="hidden lg:block rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {headers.map(h => (
                  <th key={h.key}
                    className={`py-3 px-4 text-left text-[10px] font-black text-white/18 tracking-[0.18em] uppercase first:pl-5 last:pr-5 ${h.className || ''}`}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <motion.tr key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.045 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.022] transition-colors duration-200">
                  {renderRow(item) as any}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Mobile cards ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="lg:hidden rounded-2xl bg-[#06100a] border border-white/[0.06] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}>
        <div className="divide-y divide-white/[0.04]">
          {data.map((item, i) => {
            const cells = renderRow(item) as any

            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 + i * 0.045 }}
                className="p-4 hover:bg-white/[0.022] transition-colors">
                <div className="space-y-3">
                  {headers.map(header => {
                    if (!cells || typeof cells !== 'object') return null

                    const children = Array.isArray(cells.props?.children)
                      ? cells.props.children
                      : cells.props?.children
                        ? [cells.props.children]
                        : []

                    const cell = children.find?.((c: any) => c?.key === header.key)
                    if (!cell) return null

                    return (
                      <div key={header.key} className="flex flex-col gap-1">
                        <span className="text-[10px] font-black tracking-[0.14em] uppercase text-white/22">
                          {header.mobileLabel || header.label}
                        </span>
                        <div className="text-sm">{cell.props?.children}</div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}