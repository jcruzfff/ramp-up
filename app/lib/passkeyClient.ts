import { PasskeyKit } from "passkey-kit";
import { Server } from "@stellar/stellar-sdk/rpc";
import { SACClient } from "passkey-kit";
import { Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";

// Create PasskeyKit instance for client-side operations
export const passkeyKit = new PasskeyKit({
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  factoryContractId: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || "",
});

// Configure RPC server for network interaction
export const rpc = new Server(
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org"
);

// Configure SAC client for native XLM asset interaction
const sac = new SACClient({
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
});

// Export native XLM client if the contract address is available
export const native = process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS
  ? sac.getSACClient(process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS)
  : null;

// Helper functions for wallet operations
export async function createWallet(rpName: string, userId: string) {
  try {
    const wallet = await passkeyKit.createWallet(rpName, userId);
    return wallet;
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
}

export async function connectWallet(userId: string) {
  try {
    const wallet = await passkeyKit.connectWallet(userId);
    return wallet;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

// LocalStorage keys
const STORAGE_KEY_PASSKEY_ID = 'stellar-swipe:passkeyId';
const STORAGE_KEY_CONTRACT_ID = 'stellar-swipe:contractId';

// Create a function to initialize the account to ensure it only runs on the client side
let accountInstance: PasskeyKit | null = null;

function getAccount() {
  if (typeof window === 'undefined') {
    return null; // Return null during server-side rendering
  }
  
  if (!accountInstance) {
    // Get the domain for WebAuthn registration
    const domain = window.location.hostname;
    console.log("Domain for WebAuthn:", domain);
    
    // In development, we use localhost or 127.0.0.1
    const validDomain = domain === 'localhost' || domain === '127.0.0.1' ? domain : domain;
    
    accountInstance = new PasskeyKit({
      rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
      networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
      walletWasmHash: process.env.NEXT_PUBLIC_WALLET_WASM_HASH || '', // Required for wallet creation
      // Only use supported parameters based on the PasskeyKit type
    });
    
    console.log("Initialized PasskeyKit with domain:", validDomain);
  }
  
  return accountInstance;
}

// Safer account access with null checking
export function account() {
  const acc = getAccount();
  return acc;
}

/**
 * Function to get contract ID from the passkey ID (used for login)
 */
export const getContractId = async (passkeyId: string): Promise<string | undefined> => {
  try {
    // This would typically call the Mercury reverse-lookup service
    // For now, use a simplified approach with localStorage
    return localStorage.getItem(`${passkeyId}:contractId`) || undefined;
  } catch (error) {
    console.error("Error getting contract ID:", error);
    return undefined;
  }
};

/**
 * Create a wallet for a user who has logged in with Privy
 * @param privyUserId The Privy user ID to associate with the wallet
 */
export const createWalletForPrivyUser = async (privyUserId: string) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    console.log("Original privyUserId:", privyUserId);
    console.log("Original privyUserId length:", privyUserId.length);
    
    // WebAuthn requires a userId that's 1-64 bytes, not characters
    // Create a reproducible short ID using a simple hash function
    const userId = String(Math.abs(hashCode(privyUserId)));
    
    console.log("Hashed userId:", userId);
    console.log("Hashed userId length:", userId.length);
    
    // Get the current domain
    const domain = window.location.hostname;
    
    // Fetch proper WebAuthn credential creation options from our API
    const response = await fetch('/api/webauthn/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        domain: domain,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WebAuthn options: ${response.status}`);
    }
    
    const { options } = await response.json();
    console.log('Got WebAuthn options from API:', options);
    
    // Create a real wallet - no fallback to mock wallet
    console.log("Creating real wallet...");
    const wallet = await passkeyKit.createWallet(
      options.rp.name,
      userId
    );
    
    if (!wallet) {
      throw new Error('Failed to create wallet: no wallet returned');
    }
    
    // Store the mapping in localStorage
    localStorage.setItem(STORAGE_KEY_PASSKEY_ID, wallet.keyIdBase64);
    localStorage.setItem(STORAGE_KEY_CONTRACT_ID, wallet.contractId);
    localStorage.setItem(`${privyUserId}:passkeyId`, wallet.keyIdBase64);
    localStorage.setItem(`${wallet.keyIdBase64}:contractId`, wallet.contractId);
    
    return {
      passkeyId: wallet.keyIdBase64,
      contractId: wallet.contractId,
      address: wallet.contractId,
    };
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Simple string hash function
 * Converts any string to a number that can be used as a WebAuthn user ID
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
 * Connect an existing wallet for a Privy user
 * @param privyUserId The Privy user ID to look up
 */
export const connectWalletForPrivyUser = async (privyUserId: string) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    // Get the passkey ID associated with this Privy user
    const passkeyId = localStorage.getItem(`${privyUserId}:passkeyId`);
    
    if (!passkeyId) {
      throw new Error("No wallet found for this user");
    }
    
    // Connect the wallet using the PasskeyKit
    const { keyIdBase64, contractId } = await passkeyKit.connectWallet({
      keyId: passkeyId,
      getContractId
    });
    
    return {
      passkeyId: keyIdBase64,
      contractId,
      address: contractId,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check if a Privy user has a wallet
 * @param privyUserId The Privy user ID to check
 */
export const hasWallet = (privyUserId: string): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(`${privyUserId}:passkeyId`);
};

/**
 * Get wallet info for a Privy user
 * @param privyUserId The Privy user ID to check
 */
export const getWalletInfo = (privyUserId: string) => {
  if (typeof window === 'undefined') return null;
  
  const passkeyId = localStorage.getItem(`${privyUserId}:passkeyId`);
  
  if (!passkeyId) {
    return null;
  }
  
  const contractId = localStorage.getItem(`${passkeyId}:contractId`);
  
  return {
    passkeyId,
    contractId,
    address: contractId,
  };
};

/**
 * Check the balance of a wallet
 * @param contractId The wallet's contract ID/address
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
 * Prepare a transaction to send XLM
 * @param fromAddress Sender wallet address
 * @param toAddress Recipient wallet address
 * @param amount Amount to send in stroops (1 XLM = 10,000,000 stroops)
 */
export const prepareTransaction = async (fromAddress: string, toAddress: string, amount: string) => {
  try {
    if (!native) {
      throw new Error("Native asset contract address not configured");
    }
    
    // Create transaction to transfer XLM
    const tx = await native.transfer({
      from: fromAddress,
      to: toAddress,
      amount: BigInt(amount), // Convert string to BigInt
    });
    
    return tx;
  } catch (error) {
    console.error("Error preparing transaction:", error);
    throw error;
  }
};

// Define a more specific type for passkey-kit transactions, as precise as we can without the exact type
interface PasskeyTransaction {
  [key: string]: unknown;
}

/**
 * Sign a transaction using the user's passkey
 * @param tx The transaction to sign
 */
export const signTransaction = async (tx: PasskeyTransaction) => {
  try {
    const passkeyKit = account();
    if (!passkeyKit) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    const signedTx = await passkeyKit.sign(tx);
    return signedTx;
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
};

/**
 * Submit a signed transaction to the Stellar network
 * @param signedTx The signed transaction
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