'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  // Dashboard content is now in the UserMenu slide panel
  // Redirect to home page when accessed directly
  if (isAuthenticated) {
    redirect('/home');
  }
  
  // Use ProtectedRoute to handle unauthenticated state
  return (
    <ProtectedRoute>
      <div>Redirecting...</div>
    </ProtectedRoute>
  );
} 