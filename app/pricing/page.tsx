'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PricingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to contact page
    router.replace('/contact');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-lg text-gray-900">Redirecting to Contact page...</p>
      </div>
    </div>
  );
}
