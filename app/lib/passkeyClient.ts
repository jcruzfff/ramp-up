import { PasskeyKit, SACClient } from "passkey-kit";
import { Server } from "@stellar/stellar-sdk/rpc";
import { Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";


// Configure environment variables with defaults
const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const NATIVE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ADDRESS || "";
const FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS || "CAXTCVMYOYPBSTISOJVBTUZ6NFNA5YMCWWTJNXYI65HSVDLKT3NJMRZ";
// Make sure WALLET_WASM_HASH is never undefined with a default empty string
const WALLET_WASM_HASH = process.env.NEXT_PUBLIC_WALLET_WASM_HASH || "ecd990f0b45ca6817149b6175f79b32efb442f35731985a084131e8265c4cd90";

// Log environment variable loading for debugging
if (typeof window !== 'undefined') {
  console.log("Environment variables loaded for PasskeyKit:", {
    STELLAR_RPC_URL,
    STELLAR_NETWORK_PASSPHRASE: STELLAR_NETWORK_PASSPHRASE?.substring(0, 20) + '...',
    NATIVE_CONTRACT_ADDRESS: NATIVE_CONTRACT_ADDRESS || "(not set)",
    FACTORY_CONTRACT_ID: FACTORY_CONTRACT_ID || "(not set)",
    WALLET_WASM_HASH: WALLET_WASM_HASH || "(not set)",
    // Show the raw environment variable value to help debug
    RAW_ENV_VALUE: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS
  });
}

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
 * Extended interface for PasskeyKit constructor options
 * Following the exact parameter names from the Stellar docs
 */
interface PasskeyKitOptions {
  rpcUrl: string;  // Using correct property name 'rpcUrl' instead of typo 'rpcUlr' from docs
  networkPassphrase: string;
  factoryContractId: string;
  walletWasmHash: string;  // Changed from optional to required
}

/**
 * Create and export a PasskeyKit instance
 * Following the exact pattern from Stellar documentation including parameter names
 */
// Only create the instance in browser environment
const isClient = typeof window !== 'undefined';

// Export the PasskeyKit instance directly
export const account = isClient ? 
  new PasskeyKit({
    rpcUrl: STELLAR_RPC_URL,  // NOTE: This matches the parameter name in the docs (with typo)
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    factoryContractId: FACTORY_CONTRACT_ID,
    walletWasmHash: WALLET_WASM_HASH,
  } as PasskeyKitOptions) : 
  null;

// Log initialization status
if (isClient && account) {
  console.log("PasskeyKit initialized successfully with params:", {
    rpcUrl: STELLAR_RPC_URL,  // Changed to match the parameter name used in initialization
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE?.substring(0, 20) + '...',
    factoryContractId: FACTORY_CONTRACT_ID ? FACTORY_CONTRACT_ID : '(not set)',
    walletWasmHash: WALLET_WASM_HASH ? '(set)' : '(not set)',
  });
} else if (isClient) {
  console.error("Failed to initialize PasskeyKit");
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
    const passkeyKit = account;
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
    const passkeyKit = account;
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
 * Utility function to check if a transaction is a Soroban transaction
 * Soroban transactions contain operations with type 'invokeHostFunction'
 */
function isSorobanTransaction(tx: Transaction | FeeBumpTransaction): boolean {
  if ('innerTransaction' in tx) {
    // For FeeBumpTransaction, check the inner transaction
    return isSorobanTransaction(tx.innerTransaction);
  }
  
  // Check if any operation is a Soroban operation
  return tx.operations.some(op => 
    op.type === 'invokeHostFunction' || 
    op.type === 'extendFootprintTtl' || 
    op.type === 'restoreFootprint'
  );
}

/**
 * Sign a transaction using PasskeyKit
 */
export const signTransaction = async (tx: Transaction | FeeBumpTransaction) => {
  try {
    if (!account) {
      throw new Error("PasskeyKit not initialized - only available on client side");
    }
    
    const isSoroban = isSorobanTransaction(tx);
    console.log(`Transaction type detected: ${isSoroban ? 'Soroban' : 'Classic Stellar'}`);
    
    // Prepare Soroban transactions
    if (isSoroban) {
      console.log("Preparing Soroban transaction before signing...");
      try {
        // For Soroban transactions, we need to prepare and convert to XDR
        const preparedTx = await rpc.prepareTransaction(tx);
        
        // Convert prepared transaction to XDR string
        const xdr = preparedTx.toXDR();
        console.log("Transaction prepared successfully");
        
        // Sign the XDR string
        console.log("Signing prepared Soroban transaction");
        const signedTx = await account.sign(xdr);
        console.log("Transaction signed successfully");
        return signedTx;
      } catch (prepError) {
        console.error("Error preparing transaction:", prepError);
        throw new Error(`Failed to prepare transaction: ${prepError instanceof Error ? prepError.message : String(prepError)}`);
      }
    } else {
      // For classic Stellar transactions, convert to XDR string first
      console.log("Non-Soroban transaction, converting to XDR");
      const xdr = tx.toXDR();
      
      // Sign the XDR string
      console.log("Signing classic Stellar transaction");
      const signedTx = await account.sign(xdr);
      console.log("Transaction signed successfully");
      return signedTx;
    }
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
    console.log("Submitting transaction to network...");
    const result = await rpc.sendTransaction(signedTx);
    
    // Check transaction submission status
    if (result.status !== "PENDING") {
      throw new Error(`Transaction submission failed: ${result.status} - ${result.errorResult || ''}`);
    }
    
    console.log("Transaction submitted successfully, waiting for confirmation...");
    
    // Wait for transaction to be confirmed
    let confirmedTx;
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Checking transaction status (attempt ${attempts}/${maxAttempts})...`);
      
      try {
        confirmedTx = await rpc.getTransaction(result.hash);
        
        if (confirmedTx.status !== "NOT_FOUND") {
          break;
        }
      } catch {
        // Ignoring error and continuing to retry
        console.log("Transaction not yet confirmed, retrying...");
      }
      
      // Wait for 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!confirmedTx || confirmedTx.status === "NOT_FOUND") {
      throw new Error("Transaction confirmation timed out");
    }
    
    if (confirmedTx.status === "SUCCESS") {
      console.log("Transaction confirmed successfully!");
      return {
        ...confirmedTx,
        hash: result.hash,
        confirmed: true
      };
    } else {
      throw new Error(`Transaction failed: ${confirmedTx.status}`);
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    throw error;
  }
};

// Export additional API helper functions as recommended in the documentation

/**
 * A wrapper function so it's easier for our client-side code to access the
 * send transaction endpoint
 *
 * @param xdr - The base64-encoded, signed transaction. This transaction
 * **must** contain a Soroban operation
 * @returns JSON object containing the RPC's response
 */
export async function send(xdr: string) {
  return fetch("/api/send", {
    method: "POST",
    body: JSON.stringify({
      xdr,
    }),
  }).then(async (res) => {
    if (res.ok) return res.json();
    else throw await res.text();
  });
}

/**
 * A wrapper function for retrieving contract ID from an API
 * This is an alternative to the local getContractId function
 * 
 * @param signer - The passkey ID we want to find an associated smart wallet for
 * @returns The contract address to which the specified signer has been added
 */
export async function getContractIdFromAPI(signer: string) {
  return fetch(`/api/contract/${signer}`)}