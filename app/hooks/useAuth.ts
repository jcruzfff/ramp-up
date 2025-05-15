import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import { 
  hasWallet, 
  createWalletForPrivyUser, 
  connectWalletForPrivyUser,
  getWalletInfo
} from '../lib/passkeyClient';

// Define wallet type
interface StellarWallet {
  passkeyId: string;
  contractId: string | null;
  address: string | null;
}

export function useAuth() {
  const privy = usePrivy();
  const [stellarWallet, setStellarWallet] = useState<StellarWallet | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're running on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check for existing wallet when user is authenticated
  useEffect(() => {
    if (!isClient) return;
    
    if (privy.authenticated && privy.user?.id) {
      const walletInfo = getWalletInfo(privy.user.id);
      if (walletInfo) {
        setStellarWallet(walletInfo);
      }
    } else {
      setStellarWallet(null);
    }
  }, [privy.authenticated, privy.user?.id, isClient]);
  
  // Create a Stellar wallet for the Privy user
  const createStellarWallet = async () => {
    if (!isClient) {
      throw new Error('Wallet operations can only be performed on the client side'); 
    }
    
    if (!privy.authenticated || !privy.user?.id) {
      throw new Error('User must be authenticated to create a wallet');
    }
    
    if (stellarWallet) {
      return stellarWallet; // Already has a wallet
    }
    
    try {
      setIsCreatingWallet(true);
      const wallet = await createWalletForPrivyUser(privy.user.id);
      setStellarWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('Failed to create Stellar wallet:', error);
      throw error;
    } finally {
      setIsCreatingWallet(false);
    }
  };
  
  // Connect to an existing Stellar wallet
  const connectStellarWallet = async () => {
    if (!isClient) {
      throw new Error('Wallet operations can only be performed on the client side');
    }
    
    if (!privy.authenticated || !privy.user?.id) {
      throw new Error('User must be authenticated to connect a wallet');
    }
    
    if (stellarWallet) {
      return stellarWallet; // Already connected
    }
    
    try {
      setIsConnectingWallet(true);
      const wallet = await connectWalletForPrivyUser(privy.user.id);
      setStellarWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('Failed to connect Stellar wallet:', error);
      throw error;
    } finally {
      setIsConnectingWallet(false);
    }
  };
  
  // Check if user has a Stellar wallet
  const hasStellarWallet = () => {
    if (!isClient || !privy.authenticated || !privy.user?.id) {
      return false;
    }
    return hasWallet(privy.user.id);
  };
  
  return {
    // Authentication state
    isAuthenticated: privy.authenticated,
    isLoading: privy.ready ? false : true, // Change from privy.loading which doesn't exist
    user: privy.user,
    
    // Authentication methods
    login: privy.login,
    logout: privy.logout,
    
    // User data
    getUserEmail: () => {
      if (!privy.user) return null;
      
      const email = privy.user.email?.address;
      return email || null;
    },
    
    getUserName: () => {
      if (!privy.user) return null;
      
      // Try to get the name from various sources
      return (
        privy.user.twitter?.username ||
        privy.user.farcaster?.username ||
        privy.user.email?.address?.split('@')[0] ||
        'Anonymous User'
      );
    },
    
    getUserAvatar: () => {
      if (!privy.user) return null;
      
      return (
        privy.user.twitter?.profilePictureUrl || 
        privy.user.farcaster?.pfp ||
        null
      );
    },
    
    // Stellar wallet integration
    stellarWallet,
    isCreatingWallet,
    isConnectingWallet,
    createStellarWallet,
    connectStellarWallet,
    hasStellarWallet,
    
    // Raw Privy instance for advanced usage
    privy,
  };
} 