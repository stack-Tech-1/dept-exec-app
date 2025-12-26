// Create: src/components/debug/DebugRouter.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function DebugRouter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('=== ROUTER DEBUG ===');
    console.log('Current path:', pathname);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('Full URL:', window.location.href);
    console.log('===================');
  }, [pathname, searchParams]);

  return null;
}