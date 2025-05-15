'use client';

import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';
import { ReactNode, useEffect, useState } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Get the Privy App ID from environment variables
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Check if we have a valid app ID
  const isValidAppId = PRIVY_APP_ID && PRIVY_APP_ID !== 'your-privy-app-id-here';
  
  // Use useEffect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Log warning if app ID is missing or invalid
    if (!isValidAppId) {
      console.error('Missing or invalid NEXT_PUBLIC_PRIVY_APP_ID environment variable');
    }
  }, [isValidAppId]);
  
  // The app is still mounting, show nothing to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <PrivyAuthProvider
      appId={PRIVY_APP_ID || ''}
      config={{
        // Only support these authentication methods
        loginMethods: ['email', 'google', 'apple', 'twitter', 'discord'],
        appearance: {
          theme: 'light',
          accentColor: '#4F46E5',
          logo: '/logo.png',
        }
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
} 