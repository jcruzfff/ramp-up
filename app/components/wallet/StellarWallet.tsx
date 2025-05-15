'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface StellarWalletProps {
  className?: string;
}

export default function StellarWallet({ className = '' }: StellarWalletProps) {
  const { 
    isAuthenticated, 
    stellarWallet, 
    hasStellarWallet, 
    createStellarWallet,
    isCreatingWallet
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle wallet creation
  const handleCreateWallet = async () => {
    try {
      setError(null);
      await createStellarWallet();
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError('Failed to create your Stellar wallet. Please try again.');
    }
  };

  if (!isClient) {
    // Return loading state during server-side rendering
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Loading Wallet...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Stellar Wallet</h2>
        <p className="text-gray-500">
          Please sign in to view or create your Stellar wallet.
        </p>
      </div>
    );
  }

  // User is authenticated but doesn't have a wallet yet
  if (!hasStellarWallet()) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4">Create Your Stellar Wallet</h2>
        <p className="text-gray-600 mb-4">
          Create a Stellar wallet secured by your device's passkey. This wallet will be used for all
          transactions on the platform.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button
          onClick={handleCreateWallet}
          disabled={isCreatingWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {isCreatingWallet ? 'Creating Wallet...' : 'Create Stellar Wallet'}
        </button>
        
        <p className="mt-3 text-sm text-gray-500">
          Your wallet will be secured by your device's biometrics or PIN.
        </p>
      </div>
    );
  }

  // User has a wallet
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Your Stellar Wallet</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Wallet Address:</p>
          <p className="font-mono text-sm break-all">
            {stellarWallet?.address || 'Loading...'}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Status:</p>
          <p className="text-green-500 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Connected
          </p>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${stellarWallet?.address}`, '_blank')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            View on Explorer
          </button>
        </div>
      </div>
    </div>
  );
} 