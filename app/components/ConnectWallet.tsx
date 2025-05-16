'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { Button } from '@/app/components/ui/button';
import { Loader2, Wallet, LogIn, LogOut } from 'lucide-react';
import { truncateAddress } from '@/app/lib/utils';

export default function ConnectWallet() {
  const { isAuthenticated, isLoading, login, logout, createAccount, contractAddress } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createAccount();
    } catch (error) {
      console.error('Account creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while initializing auth
  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Show connected state with address and disconnect button
  if (isAuthenticated && contractAddress) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          <Wallet className="mr-2 h-4 w-4" />
          {truncateAddress(contractAddress)}
        </Button>
        <Button variant="ghost" onClick={handleDisconnect}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Show options to create or connect wallet
  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleConnect}
        disabled={isConnecting || isCreating}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
      
      <Button 
        variant="outline"
        onClick={handleCreate}
        disabled={isConnecting || isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Wallet...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Create New Wallet
          </>
        )}
      </Button>
    </div>
  );
} 