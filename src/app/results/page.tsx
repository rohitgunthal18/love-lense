'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResultsRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get('key');

  useEffect(() => {
    router.replace(key ? `/report?key=${key}` : '/report');
  }, [key, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResultsRedirect />
    </Suspense>
  );
}
