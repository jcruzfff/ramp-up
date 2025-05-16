'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { signTransaction as passkeySignTransaction } from '@/app/lib/passkeyClient';
import * as StellarSdk from '@stellar/stellar-sdk';

// Define the wallet interface based on the API response
interface StellarWallet {
  id: string;
  address: string;
  chainType: string;
}

// Define a type for Stellar transactions
type StellarTransaction = StellarSdk.Transaction | StellarSdk.FeeBumpTransaction;

export function useStellarWallet() {
  const { isAuthenticated, userId } = useAuth();
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use an additional ref to track creation state across renders
  const [creationAttempted, setCreationAttempted] = useState(false);

  // Function to create a Stellar wallet
  const createStellarWallet = useCallback(async () => {
    // If we already have a wallet, return it immediately
    if (wallet) {
      console.log('Reusing existing wallet:', wallet.address);
      return wallet;
    }

    if (!isAuthenticated || !userId) {
      setError('User must be authenticated');
      return null;
    }

    // Prevent multiple simultaneous creation attempts
    if (isLoading) {
      console.log('Wallet creation already in progress, waiting...');
      // Return a promise that resolves when wallet creation is complete
      return new Promise<StellarWallet | null>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(wallet);
          }
        }, 500);
      });
    }

    setIsLoading(true);
    setError(null);
    setCreationAttempted(true);

    try {
      console.log('Creating new Stellar wallet for user:', userId);
      
      // Check local storage first to see if we already have a wallet
      const storedWallet = localStorage.getItem(`stellar-wallet-${userId}`);
      if (storedWallet) {
        try {
          const parsedWallet = JSON.parse(storedWallet);
          console.log('Found existing wallet in storage:', parsedWallet.address);
          setWallet(parsedWallet);
          return parsedWallet;
        } catch (e) {
          console.error('Error parsing stored wallet:', e);
          // Continue with wallet creation if storage parsing fails
        }
      }
      
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
      console.log('Wallet created successfully:', data.wallet);
      
      // Store the wallet in localStorage for future use
      localStorage.setItem(`stellar-wallet-${userId}`, JSON.stringify(data.wallet));
      
      setWallet(data.wallet);
      return data.wallet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Wallet creation error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, wallet, isLoading]);

  // Check if user has a wallet on login - only once per session
  useEffect(() => {
    const checkForWallet = async () => {
      if (isAuthenticated && userId && !wallet && !isLoading && !creationAttempted) {
        await createStellarWallet();
      }
    };

    checkForWallet();
  }, [isAuthenticated, userId, wallet, isLoading, creationAttempted, createStellarWallet]);

  // Sign a transaction using PasskeyKit
  const signTransaction = useCallback(async (transaction: StellarTransaction) => {
    if (!wallet) {
      throw new Error('No wallet available to sign transaction');
    }
    
    try {
      console.log('Signing transaction with wallet:', wallet.id, wallet.address);
      
      // Convert transaction to XDR if needed
      const txToSign = transaction;
      if (typeof transaction.toXDR === 'function') {
        console.log("Using transaction object's own toXDR method");
      }
      
      // Use the real PasskeyKit implementation for signing
      const signedTransaction = await passkeySignTransaction(txToSign);
      
      console.log('Transaction signed successfully');
      return signedTransaction;
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