import { PasskeyKit, SACClient } from "passkey-kit";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";

// Configure environment variables with defaults
const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const NATIVE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS || "";

// Create RPC Server instance
export const rpc = new Server(STELLAR_RPC_URL);

// Create SAC client for asset operations
const sac = new SACClient({
  rpcUrl: STELLAR_RPC_URL,
  networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
});

// Export native XLM client if the contract address is available
export const native = NATIVE_CONTRACT_ADDRESS ? sac.getSACClient(NATIVE_CONTRACT_ADDRESS) : null;

// LocalStorage keys for persistence
const STORAGE_KEY_PASSKEY_ID = 'stellar-swipe:passkeyId';
const STORAGE_KEY_CONTRACT_ID = 'stellar-swipe:contractId';

/**
 * Create and return a PasskeyKit instance
 * This follows the pattern from Stellar documentation where we export a function
 * that returns the PasskeyKit instance, ensuring it only runs on the client side
 */
let passkeyKitInstance: PasskeyKit | null = null;

export function account() {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  if (!passkeyKitInstance) {
    try {
      passkeyKitInstance = new PasskeyKit({
        rpcUrl: STELLAR_RPC_URL,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        // Configure appropriate options and remove unsupported ones
        walletWasmHash: process.env.NEXT_PUBLIC_WALLET_WASM_HASH || '', 
      });
      console.log("PasskeyKit initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PasskeyKit:", error);
      return null;
    }
  }
  
  return passkeyKitInstance;
}

/**
 * Function to look up contract ID from passkey ID
 * Used during wallet connection
 */
export const getContractId = async (passkeyId: string): Promise<string | undefined> => {
  try {
    if (typeof window === 'undefined') return undefined;
    
    // First check local storage
    const contractId = localStorage.getItem(`${passkeyId}:contractId`);
    if (contractId) return contractId;
    
    // In production, you would call your Mercury API endpoint
    // return fetch(`/api/contract/${passkeyId}`).then(res => res.text());
    
    return undefined;
  } catch (error) {
    console.error("Error getting contract ID:", error);
    return undefined;
  }
};

/**
 * Create a wallet for a user using PasskeyKit
 * @param userId - The user ID for the wallet
 * @param rpName - The relying party name for WebAuthn
 */
export const createWallet = async (userId: string, rpName: string) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }

    // Normalize userId if needed (WebAuthn requires 1-64 bytes)
    const normalizedUserId = userId.length > 64 ? String(Math.abs(hashCode(userId))) : userId;
    
    // Create the wallet
    console.log("Creating wallet with rpName:", rpName, "and userId:", normalizedUserId);
    const wallet = await passkeyKit.createWallet(rpName, normalizedUserId);
    
    if (!wallet) {
      throw new Error('Failed to create wallet: no wallet returned');
    }
    
    // Store the mapping in localStorage
    localStorage.setItem(STORAGE_KEY_PASSKEY_ID, wallet.keyIdBase64);
    localStorage.setItem(STORAGE_KEY_CONTRACT_ID, wallet.contractId);
    localStorage.setItem(`${userId}:passkeyId`, wallet.keyIdBase64);
    localStorage.setItem(`${wallet.keyIdBase64}:contractId`, wallet.contractId);
    
    return {
      passkeyId: wallet.keyIdBase64,
      contractId: wallet.contractId,
      address: wallet.contractId
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Connect to an existing wallet using PasskeyKit
 * @param options - Connection options including keyId
 */
export const connectWallet = async (options: {
  keyId?: string;
  rpId?: string;
}) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    // Connect to the existing wallet
    const wallet = await passkeyKit.connectWallet({
      ...options,
      getContractId
    });
    
    return wallet;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Connect a wallet for a specific user
 * @param userId - The user ID to look up the passkey for
 */
export const connectWalletForUser = async (userId: string) => {
  try {
    // Get the passkey ID associated with this user
    const passkeyId = localStorage.getItem(`${userId}:passkeyId`);
    
    if (!passkeyId) {
      throw new Error("No wallet found for this user");
    }
    
    // Use our standard connectWallet function
    return connectWallet({ keyId: passkeyId });
  } catch (error) {
    console.error("Error connecting wallet for user:", error);
    throw error;
  }
};

/**
 * Check if a user has a wallet
 * @param userId - The user ID to check
 */
export const hasWallet = (userId: string): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(`${userId}:passkeyId`);
};

/**
 * Get stored wallet info for a user
 * @param userId - The user ID to check
 */
export const getWalletInfo = (userId: string) => {
  if (typeof window === 'undefined') return null;
  
  const passkeyId = localStorage.getItem(`${userId}:passkeyId`);
  if (!passkeyId) return null;
  
  const contractId = localStorage.getItem(`${passkeyId}:contractId`);
  
  return {
    passkeyId,
    contractId,
    address: contractId,
  };
};

/**
 * Get balance for a wallet
 * @param contractId - The wallet's contract ID
 */
export const getBalance = async (contractId: string) => {
  try {
    if (!native) {
      throw new Error("Native asset contract address not configured");
    }
    
    const balance = await native.balance({ id: contractId });
    return balance;
  } catch (error) {
    console.error("Error getting balance:", error);
    throw error;
  }
};

/**
 * Simple string hash function for WebAuthn user IDs
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Sign a transaction using PasskeyKit
 */
export const signTransaction = async (tx: any) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    // Sign the transaction
    const signedTx = await passkeyKit.sign(tx);
    return signedTx;
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
};

/**
 * Submit a transaction to the Stellar network
 */
export const submitTransaction = async (signedTx: Transaction | FeeBumpTransaction) => {
  try {
    const result = await rpc.sendTransaction(signedTx);
    return result;
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw error;
  }
}; 