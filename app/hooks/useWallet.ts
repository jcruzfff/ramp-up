'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface Wallet {
  id: string;
  address: string;
  chainType: string;
}

interface UseWalletReturn {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  createWallet: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
}

// Local storage key for wallet ID
const WALLET_ID_KEY = 'stellar_swipe_wallet_id';

export function useWallet(): UseWalletReturn {
  const { authenticated, getAccessToken } = usePrivy();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to create a new wallet
  const createWallet = useCallback(async () => { 
    if (!authenticated) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create wallet');
      }
      
      const data = await response.json();
      setWallet(data.wallet);
      
      // Store the wallet ID in local storage
      localStorage.setItem(WALLET_ID_KEY, data.wallet.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  // Function to fetch wallet data
  const fetchWalletData = useCallback(async (walletId: string) => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      
      const response = await fetch(`/api/wallet?walletId=${walletId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If the wallet isn't found, clear the stored wallet ID
        if (response.status === 404) {
          localStorage.removeItem(WALLET_ID_KEY);
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve wallet');
      }
      
      const data = await response.json();
      setWallet(data.wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  // Function to refresh wallet data
  const refreshWalletData = useCallback(async () => {
    const walletId = localStorage.getItem(WALLET_ID_KEY);
    
    if (walletId) {
      await fetchWalletData(walletId);
    } else {
      setLoading(false);
    }
  }, [fetchWalletData]);

  // Initialize wallet data
  useEffect(() => {
    if (authenticated) {
      const walletId = localStorage.getItem(WALLET_ID_KEY);
      
      if (walletId) {
        fetchWalletData(walletId);
      } else {
        setLoading(false);
      }
    } else {
      setWallet(null);
      setLoading(false);
    }
  }, [authenticated, fetchWalletData]);

  return {
    wallet,
    loading,
    error,
    createWallet,
    refreshWalletData
  };
} 