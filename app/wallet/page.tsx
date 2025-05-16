"use client"

import { redirect } from "next/navigation"
import { useAuth } from '@/app/hooks/useAuth'

export default function WalletPage() {
  const { isAuthenticated } = useAuth();
  
  // Wallet content is now in the UserMenu slide panel
  // Redirect to home page when accessed directly
  if (isAuthenticated) {
    redirect('/home');
  } else {
    // Redirect unauthenticated users to home page
    redirect('/home');
  }
  
  return null;
} 