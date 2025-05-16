import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { StellarWallet } from '../lib/stellar-wallet';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    ...context,
    
    // Check if the current user has a wallet
    hasWallet: () => {
      return !!context.wallet && !!context.wallet.address;
    },
    
    // Get the current wallet address
    getAddress: () => {
      return context.wallet?.address || null;
    }
  };
}

// Define the shape of the auth context for TypeScript
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  wallet: StellarWallet | null;
  login: (method: string) => Promise<void>;
  logout: () => Promise<void>;
  setWallet: (wallet: StellarWallet | null) => void;
} 