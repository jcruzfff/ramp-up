'use client';

import { useAuth } from '@/app/hooks/useAuth';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) {
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
      onClick={() => login()}
      className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors ${className}`}
    >
      Sign In
    </button>
  );
} 