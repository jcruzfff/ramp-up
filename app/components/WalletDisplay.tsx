'use client';

import { useWallet } from '../hooks/useWallet';
import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';
import { formatBalance } from '@/lib/stellar/balance';

interface Balance {
  asset: string;
  balance: string;
}

export default function WalletDisplay() {
  const { wallet, loading, error, createWallet, refreshWalletData } = useWallet();
  const { authenticated, login, getAccessToken } = usePrivy();
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    try {
      await createWallet();
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleRefresh = () => {
    refreshWalletData();
    if (wallet) {
      fetchBalance(wallet.address);
    }
  };

  // Function to fetch balance
  const fetchBalance = useCallback(async (address: string) => {
    setBalanceLoading(true); 
    setBalanceError(null);
    
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/wallet/balance?address=${address}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch balance');
      }
      
      const data = await response.json();
      setBalances(data.balances);
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, [getAccessToken]);
  
  // Fetch balance when wallet is available
  useEffect(() => {
    if (wallet) {
      fetchBalance(wallet.address);
    }
  }, [wallet, fetchBalance]);

  if (!authenticated) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Stellar Wallet</h2>
        <p className="mb-4">Sign in to access your Stellar wallet</p>
        <button
          onClick={() => login()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Stellar Wallet</h2>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Stellar Wallet</h2>
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Stellar Wallet</h2>
        <p className="mb-4">You don&apos;t have a Stellar wallet yet. Would you like to create one?</p>
        <button
          onClick={handleCreateWallet}
          disabled={creatingWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {creatingWallet ? 'Creating...' : 'Create Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Stellar Wallet</h2>
      
      <div className="mb-4">
        <div className="font-medium text-gray-700">Wallet Address:</div>
        <div className="bg-gray-50 p-2 rounded-md break-all">
          {wallet.address}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="font-medium text-gray-700">Chain Type:</div>
        <div className="bg-gray-50 p-2 rounded-md">
          {wallet.chainType === 'stellar' ? 'Stellar' : wallet.chainType}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="font-medium text-gray-700">Balance:</div>
        {balanceLoading ? (
          <div className="flex items-center bg-gray-50 p-2 rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading balance...
          </div>
        ) : balanceError ? (
          <div className="bg-gray-50 p-2 rounded-md text-red-500">
            Error loading balance: {balanceError}
          </div>
        ) : balances.length > 0 ? (
          <div className="space-y-2">
            {balances.map((balance, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md flex justify-between">
                <span>{balance.asset}:</span>
                <span className="font-medium">{formatBalance(balance.balance)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-2 rounded-md">
            No assets found
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
        
        {/* Placeholder for additional wallet actions like sending XLM */}
        <button
          className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
        >
          Send XLM
        </button>
      </div>
    </div>
  );
} 