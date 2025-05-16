'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

// Define the wallet interface based on the API response
interface StellarWallet {
  id: string;
  address: string;
  chainType: string;
}

export function useStellarWallet() {
  const { isAuthenticated, userId } = useAuth();
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to create a Stellar wallet
  const createStellarWallet = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setError('User must be authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stellar-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Stellar wallet');
      }

      const data = await response.json();
      setWallet(data.wallet);
      return data.wallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  // Check if user has a wallet on login
  useEffect(() => {
    const checkForWallet = async () => {
      if (isAuthenticated && userId && !wallet && !isLoading) {
        await createStellarWallet();
      }
    };

    checkForWallet();
  }, [isAuthenticated, userId, wallet, isLoading, createStellarWallet]);

  // Sign a transaction (placeholder - would need implementation with PasskeyKit)
  const signTransaction = useCallback(async (transaction: any) => {
    if (!wallet) {
      throw new Error('No wallet available to sign transaction');
    }
    
    try {
      // In a real implementation, we would use PasskeyKit to sign the transaction
      console.log('Would sign transaction with wallet', wallet.id);
      return transaction;
    } catch (err) {
      console.error('Error signing transaction:', err);
      throw err;
    }
  }, [wallet]);

  return {
    wallet,
    isLoading,
    error,
    createWallet: createStellarWallet,
    signTransaction,
    // Helper function to get explorer URL
    getExplorerUrl: wallet ? `https://stellar.expert/explorer/public/account/${wallet.address}` : ''
  };
} 