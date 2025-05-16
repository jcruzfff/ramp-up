'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a redirect page to maintain backward compatibility
export default function WalletRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new wallet page location
    router.replace('/wallet');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to wallet...</p>
      </div>
    </div>
  );
} 