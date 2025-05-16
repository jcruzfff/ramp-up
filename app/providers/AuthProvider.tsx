'use client';

import { ReactNode, useEffect, useState, useRef, createContext, useContext } from 'react';
import { createWallet, connectWallet, hasWallet } from '@/app/lib/passkeyClient';

// Define the shape of our auth context
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  createAccount: () => Promise<void>;
  contractAddress: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  userName: null,
  userEmail: null,
  login: async () => {},
  logout: async () => {},
  createAccount: async () => {},
  contractAddress: null,
});

// Export the hook for components to use
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const initRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  // Handle client-side mounting once
  useEffect(() => {
    if (!initRef.current) {
      setMounted(true);
      initRef.current = true;
      
      // Check for existing session
      const storedUserId = localStorage.getItem('auth:userId');
      const storedUserName = localStorage.getItem('auth:userName');
      const storedUserEmail = localStorage.getItem('auth:userEmail');
      const storedContractAddress = localStorage.getItem('auth:contractAddress');
      
      if (storedUserId) {
        setUserId(storedUserId);
        setUserName(storedUserName);
        setUserEmail(storedUserEmail);
        setContractAddress(storedContractAddress);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    }
    
    return () => {
      // Clean up logic if needed
    };
  }, []);

  // Log authentication errors for debugging
  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);

      // Auto-clear error after 10 seconds
      const timer = setTimeout(() => setAuthError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Create a new PasskeyKit wallet and account
  const createAccount = async () => {
    try {
      setIsLoading(true);
      
      // Generate a new unique user ID
      const generatedUserId = `user_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
      const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Stellar Swipe';
      
      console.log("Creating wallet with PasskeyKit...");
      const wallet = await createWallet(generatedUserId, siteName);
      
      if (!wallet || !wallet.contractId) {
        throw new Error("Failed to create wallet");
      }
      
      console.log("Wallet created successfully:", wallet);
      
      // Store auth info
      localStorage.setItem('auth:userId', generatedUserId);
      localStorage.setItem('auth:userName', 'New User');
      localStorage.setItem('auth:userEmail', '');
      localStorage.setItem('auth:contractAddress', wallet.contractId);
      
      // Update state
      setUserId(generatedUserId);
      setUserName('New User');
      setUserEmail('');
      setContractAddress(wallet.contractId);
      setIsAuthenticated(true);
      
    } catch (error) {
      setAuthError(`Account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with existing PasskeyKit wallet
  const login = async () => {
    try {
      setIsLoading(true);
      
      // First check local storage for the most recently used user ID
      const lastUserId = localStorage.getItem('auth:lastUserId');
      
      if (!lastUserId) {
        // No previous user, suggest creating an account instead
        setAuthError('No existing account found. Please create a new account instead.');
        return;
      }
      
      // Check if this user has a wallet
      if (!hasWallet(lastUserId)) {
        setAuthError('No wallet found for this user. Please create a new account.');
        return;
      }
      
      // Connect to the existing wallet
      const wallet = await connectWallet({ 
        keyId: localStorage.getItem(`${lastUserId}:passkeyId`) || undefined
      });
      
      if (!wallet || !wallet.contractId) {
        throw new Error("Failed to connect wallet");
      }
      
      console.log("Connected to wallet:", wallet);
      
      // Retrieve user information from local storage
      const storedUserName = localStorage.getItem('auth:userName') || 'User';
      const storedUserEmail = localStorage.getItem('auth:userEmail') || '';
      
      // Store auth info
      localStorage.setItem('auth:userId', lastUserId);
      localStorage.setItem('auth:contractAddress', wallet.contractId);
      
      // Update state
      setUserId(lastUserId);
      setUserName(storedUserName);
      setUserEmail(storedUserEmail);
      setContractAddress(wallet.contractId);
      setIsAuthenticated(true);
      
    } catch (error) {
      setAuthError(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout by clearing session data
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Remember this user ID for next login
      if (userId) {
        localStorage.setItem('auth:lastUserId', userId);
      }
      
      // Clear current session info
      localStorage.removeItem('auth:userId');
      localStorage.removeItem('auth:userName');
      localStorage.removeItem('auth:userEmail');
      localStorage.removeItem('auth:contractAddress');
      
      // Update state
      setUserId(null);
      setUserName(null);
      setUserEmail(null);
      setContractAddress(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      setAuthError(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for client-side rendering
  if (!mounted) return null;

  return (
    <>
      <AuthContext.Provider 
        value={{
          isAuthenticated,
          isLoading,
          userId,
          userName,
          userEmail,
          login,
          logout,
          createAccount,
          contractAddress,
        }}
      >
        {authError && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded z-50" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{authError}</span>
            <button 
              onClick={() => setAuthError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}
        {children}
      </AuthContext.Provider>
    </>
  );
} 