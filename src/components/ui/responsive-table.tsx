// Create a responsive table component
// C:\Users\SMC\Documents\GitHub\dept-exec-app\src\components\ui\responsive-table.tsx
'use client'

import { ReactNode } from 'react'

interface ResponsiveTableProps {
  headers: { key: string; label: string; mobileLabel?: string; className?: string }[]
  data: any[]
  renderRow: (item: any) => ReactNode
  emptyMessage?: string
}

export default function ResponsiveTable({ headers, data, renderRow, emptyMessage }: ResponsiveTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`py-4 px-6 text-left text-xs font-semibold text-gray-900 uppercase ${header.className || ''}`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map(renderRow)
            ) : (
              <tr>
                <td colSpan={headers.length} className="py-8 px-6 text-center">
                  <p className="text-gray-500">{emptyMessage || 'No data found'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {data.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50/50">
                <div className="space-y-3">
                  {headers.map((header) => {
                    const cellContent = renderRow(item);
                    if (!cellContent || typeof cellContent !== 'object') return null;
                    
                    // Extract the cell for this header from the row
                    const cell = (cellContent as any).props.children?.find(
                      (child: any) => child.key === header.key
                    );
                    
                    if (!cell) return null;
                    
                    return (
                      <div key={header.key} className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500">
                          {header.mobileLabel || header.label}
                        </span>
                        <div className="mt-1">
                          {cell.props.children}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">{emptyMessage || 'No data found'}</p>
          </div>
        )}
      </div>
    </div>
  )
}