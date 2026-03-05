'use client';

import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
        <svg className="w-7 h-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <div>
        <h2 className="text-white font-bold text-lg mb-1">Something went wrong</h2>
        <p className="text-white/40 text-sm max-w-sm">
          {(error instanceof Error ? error.message : null) || 'An unexpected error occurred in this section.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-xl bg-[#0d7c3d] text-white text-sm font-semibold hover:bg-[#0a5a2d] transition-colors"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] transition-colors"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
