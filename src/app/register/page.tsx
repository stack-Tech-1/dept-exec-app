import { Suspense } from 'react';
import RegisterClient from './RegisterClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0d7c3d]/20 to-[#0a5a2d]/20 mx-auto flex items-center justify-center shadow-lg">
              <Loader2 className="w-10 h-10 text-[#0d7c3d] animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Registration</h2>
          <p className="text-gray-600">Please wait while we load the registration page...</p>
        </div>
      </div>
    }>
      <RegisterClient />
    </Suspense>
  );
}