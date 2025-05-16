'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStellarWallet } from './useStellarWallet';
import { useAuth } from './useAuth';
import * as StellarSdk from '@stellar/stellar-sdk';

// Get network configuration from environment variables or use defaults
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';

// Define a type for assembled Stellar transactions
type StellarTransaction = StellarSdk.Transaction | StellarSdk.FeeBumpTransaction;

export function useStellarClient() {
  const { wallet, signTransaction, createWallet: createStellarWallet, isLoading: walletLoading } = useStellarWallet();
  const { isAuthenticated, userId } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [server, setServer] = useState<StellarSdk.Horizon.Server | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const serverInitialized = useRef(false);

  // Initialize the Stellar server on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !serverInitialized.current) {
      // Only initialize in browser environment
      try {
        const stellarServer = new StellarSdk.Horizon.Server(HORIZON_URL);
        setServer(stellarServer);
        serverInitialized.current = true;
        console.log('Stellar server initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Stellar server:', error);
      }
    }
  }, []);
  
  // New method to ensure wallet exists
  const getWalletStatus = useCallback(async () => {
    console.log('Checking wallet status...');
    
    // If we already have a wallet, return it immediately
    if (wallet?.address) {
      console.log('Existing wallet found:', wallet.address);
      return wallet;
    }
    
    console.log('Wallet exists:', !!wallet);
    console.log('Auth status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('User ID:', userId || 'Not available');
    console.log('Wallet loading:', walletLoading ? 'Loading' : 'Not loading');
    
    // Cannot create wallet if not authenticated
    if (!isAuthenticated || !userId) {
      console.log('User not authenticated or missing userId');
      return null;
    }
    
    try {
      console.log('Attempting to create wallet...');
      // Let any in-progress creation complete
      if (walletLoading) {
        console.log('Wallet creation is already in progress, waiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (wallet?.address) {
          console.log('Wallet is now available after waiting:', wallet.address);
          return wallet;
        }
      }
      
      const newWallet = await createStellarWallet();
      
      if (newWallet) {
        console.log('Wallet creation successful:', newWallet.address);
        // Return the newly created wallet
        return newWallet;
      } else {
        console.log('Wallet creation failed, no wallet returned');
        return null;
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  }, [wallet, isAuthenticated, userId, walletLoading, createStellarWallet]);

  // Check if a wallet address is valid
  const isValidStellarAddress = useCallback((address: string | undefined | null) => {
    if (!address) {
      console.log('No address provided for validation');
      return false;
    }
    
    try {
      // Log the address for debugging
      console.log('Validating Stellar address:', address);
      
      // Check if the address is a valid Ed25519 public key
      const isValid = StellarSdk.StrKey.isValidEd25519PublicKey(address);
      console.log('Address validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error validating Stellar address:', error);
      return false;
    }
  }, []);

  // Fund the account using Friendbot via our API
  const fundAccountWithFriendbot = useCallback(async (address: string) => {
    console.log('Attempting to fund account with Friendbot:', address);
    
    if (!address) {
      throw new Error('No address provided for funding');
    }
    
    if (!isValidStellarAddress(address)) {
      throw new Error('Invalid Stellar address');
    }

    try {
      // Use our API endpoint to fund the account
      const response = await fetch('/api/stellar-wallet/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fund account');
      }
      
      const result = await response.json();
      console.log('Funded account with Friendbot successfully:', result);
      return result;
    } catch (error) {
      console.error('Error funding account with Friendbot:', error);
      throw error;
    }
  }, [isValidStellarAddress]);

  // Connect to Stellar network
  const connect = useCallback(async () => {
    // Prevent multiple connection attempts
    if (isConnecting) {
      console.log('Connection already in progress, waiting...');
      return isConnected;
    }
    
    // If already connected, return immediately
    if (isConnected && wallet?.address) {
      console.log('Already connected to Stellar network with wallet:', wallet.address);
      return true;
    }
    
    setIsConnecting(true);
    
    try {
      // Ensure server is initialized
      if (!server) {
        console.log('Initializing Stellar server...');
        if (!serverInitialized.current) {
          const stellarServer = new StellarSdk.Horizon.Server(HORIZON_URL);
          setServer(stellarServer);
          serverInitialized.current = true;
          
          // Wait briefly for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Check if server is still not initialized - this would be a hard failure
      if (!server && !serverInitialized.current) {
        throw new Error('Failed to initialize Stellar server');
      }
      
      // Get or create a wallet
      let currentWallet = wallet;
      
      if (!currentWallet?.address) {
        console.log('No wallet available to connect, attempting to initialize one...');
        const walletStatus = await getWalletStatus();
        
        if (walletStatus) {
          console.log('Wallet initialized successfully:', walletStatus.address);
          currentWallet = walletStatus;
          
          // If the wallet state hasn't updated in the component yet, wait a moment
          if (!wallet?.address) {
            console.log('Wallet initialized, waiting for state update...');
            // Wait briefly for state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // If still no wallet after waiting, use the one we got from getWalletStatus
            if (!wallet?.address) {
              console.log('Wallet state still not updated, using wallet from status check');
              currentWallet = walletStatus;
            } else {
              currentWallet = wallet;
            }
          }
        } else {
          console.log('Wallet initialization failed, cannot connect');
          return false;
        }
      }
      
      // Ensure we have a wallet to use for connection
      if (!currentWallet?.address) {
        console.log('No wallet available after initialization attempts');
        return false;
      }
      
      // Check if the account exists and is active
      if (!server) {
        throw new Error('Stellar server is not initialized');
      }
      
      console.log('Connecting to Stellar network with wallet:', currentWallet.address);
      
      try {
        // This will throw if the account doesn't exist
        await server.loadAccount(currentWallet.address);
        console.log('Account found on Stellar network:', currentWallet.address);
        setIsConnected(true);
      } catch {
        // Empty catch block without parameters
        console.log('Account not found on Stellar network:', currentWallet.address);
        console.log('Attempting to fund with Friendbot (testnet)');
        
        // Fund the account with Friendbot if on testnet
        await fundAccountWithFriendbot(currentWallet.address);
        
        // Retry loading account
        await server.loadAccount(currentWallet.address);
        console.log('Account successfully funded and activated:', currentWallet.address);
        setIsConnected(true);
      }
      
      // Return connection status
      return true;
    } catch (error) {
      console.error('Error connecting to Stellar network:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [wallet, isConnected, server, fundAccountWithFriendbot, getWalletStatus, isConnecting]);

  // Automatically try to connect when wallet changes
  useEffect(() => {
    if (wallet?.address && !isConnected && !isConnecting && serverInitialized.current) {
      connect().catch(err => {
        console.error("Auto-connect failed:", err);
      });
    }
  }, [wallet, isConnected, isConnecting, connect]);

  // Get the account balance using our API
  const getAccountBalance = useCallback(async () => {
    // Extract and log wallet address
    const address = wallet?.address;
    console.log('Wallet address in getAccountBalance:', address);
    
    if (!address) {
      console.log('No wallet address available');
      return 0;
    }

    // Validate the address format first
    if (!isValidStellarAddress(address)) {
      console.error('Invalid Stellar address format:', address);
      return 0;
    }

    try {
      // Use our API endpoint to check account status
      const response = await fetch(`/api/stellar-wallet/status?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching account status:', errorText);
        return 0;
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Account status:', data);
        return data.balance || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return 0;
    }
  }, [wallet, isValidStellarAddress]);

  // Create a new project
  const createProject = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    daysUntilDeadline: number,
    goalAmount?: number,
    categories?: string[]
  ) => {
    if (!wallet?.address) {
      throw new Error('Wallet not connected');
    }

    if (!server) {
      throw new Error('Stellar server is not initialized');
    }

    try {
      // Log the start of project creation
      console.log("=== STARTING PROJECT CREATION TRANSACTION ===");
      console.log(`Project: "${title}" by wallet: ${wallet.address}`);
      console.log(`Details: ${description}`);
      console.log(`Duration: ${daysUntilDeadline} days, Goal: ${goalAmount}`);
      console.log(`Categories: ${categories?.join(', ') || 'None'}`);
      
      // 1. Validate wallet is funded and active on Stellar
      const account = await server.loadAccount(wallet.address);
      console.log("Account loaded successfully:", account.accountId);
      console.log("Account sequence:", account.sequenceNumber());

      // 2. Create a unique asset ID for the project
      const assetCode = `PROJ${Math.floor(1000 + Math.random() * 9000)}`;
      console.log("Generated project ID:", assetCode);
      
      // 3. Create a transaction with manageData operation for the project
      // Note: This is a classic Stellar transaction, not a Soroban transaction
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(StellarSdk.Operation.manageData({
          name: `project_${assetCode}`, 
          value: title.substring(0, 64) // Limit to 64 bytes for managaData
        }))
        // Add additional manageData operations for metadata
        .addOperation(StellarSdk.Operation.manageData({
          name: `project_${assetCode}_desc`,
          value: description.substring(0, 64)
        }))
        .addOperation(StellarSdk.Operation.manageData({
          name: `project_${assetCode}_deadline`,
          value: daysUntilDeadline.toString()
        }))
        .setTimeout(180)
        .build();
      
      console.log("Transaction built successfully");
      console.log("Operations:", transaction.operations.length);
      console.log("Fee:", transaction.fee);
      
      // 4. Sign the transaction with the wallet
      if (signTransaction) {
        try {
          console.log("Signing transaction...");
          // Use the proper type for the transaction
          const signedTransaction = await signTransaction(transaction);
          console.log("Transaction signed successfully");
          
          // 5. Submit the transaction to the Stellar network
          console.log("Submitting transaction to the Stellar network...");
          
          // For classic Stellar transactions, we should use the horizon server
          // This is different from Soroban transactions that use the RPC server
          const txResult = await server.submitTransaction(signedTransaction as unknown as StellarTransaction);
          
          // Get the transaction hash
          const txHash = txResult.hash;
          const network = NETWORK_PASSPHRASE.includes('Test') ? 'testnet' : 'public';
          const explorerUrl = `https://stellar.expert/explorer/${network}/tx/${txHash}`;
          
          // Log transaction success details
          console.log("=== TRANSACTION SUCCESSFUL ===");
          console.log("Project Transaction Hash:", txHash);
          console.log("View in explorer:", explorerUrl);
          console.log("Transaction details:", {
            successful: txResult.successful,
            ledger: txResult.ledger,
            resultMetaXdr: txResult.result_meta_xdr?.substring(0, 100) + '...' // Truncate for readability
          });
          
          // Log the project creation success
          console.log("Project successfully created on blockchain");
        } catch (error) {
          console.error("Transaction signing or submission failed:", error);
          throw new Error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        throw new Error("Transaction signing function not available");
      }

      // 6. Store the project in our API database
      console.log("Storing complete project metadata in API database...");
      const projectData = {
        title,
        description,
        imageSrc: imageUrl || 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3', // Default image
        goalAmount: goalAmount || 1000,
        daysUntilDeadline,
        categories: categories || ['Other'],
        ownerAddress: wallet.address
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to save project metadata to API');
      }

      const data = await response.json();
      console.log("Project creation complete. Project ID:", data.project.id);
      return data.project.id;

    } catch (error) {
      console.error("=== PROJECT CREATION FAILED ===");
      console.error("Error details:", error);
      
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
      throw error;
    }
  }, [wallet, server, signTransaction]);

  return {
    isConnected,
    connect,
    getAccountBalance,
    fundAccountWithFriendbot,
    isValidStellarAddress,
    getWalletStatus,
    networkPassphrase: NETWORK_PASSPHRASE,
    horizonUrl: HORIZON_URL,
    createProject,
    wallet,
    isConnecting
  };
}