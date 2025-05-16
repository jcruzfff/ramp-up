'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useState } from 'react';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { isAuthenticated, login, logout, isLoading } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      // Reset after a short delay
      setTimeout(() => setIsLoggingIn(false), 1000);
    }
  };
  
  if (isLoading || isLoggingIn) {
    return (
      <button 
        className={`px-4 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed ${className}`}
        disabled
      >
        Loading...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={() => logout()}
        className={`px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors ${className}`}
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors ${className}`}
    >
      Sign In
    </button>
  );
} 