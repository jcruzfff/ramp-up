import { Server } from '@stellar/stellar-sdk';

// Get Stellar network settings from environment variables
const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://rpc-testnet.stellar.org:443';

/**
 * Fetch the balance of a Stellar account
 * 
 * @param {string} address - The Stellar account address
 * @returns {Promise<{asset: string, balance: string}[]>} Array of balances by asset
 */
export async function getStellarBalance(address: string): Promise<{asset: string, balance: string}[]> {
  try {
    // Initialize Stellar server connection
    const server = new Server(STELLAR_RPC_URL);
    
    // Fetch account information from Stellar network
    const account = await server.loadAccount(address);
    
    // Extract balances
    return account.balances.map((balance: any) => {
      if (balance.asset_type === 'native') {
        // Native XLM asset
        return {
          asset: 'XLM',
          balance: balance.balance
        };
      } else {
        // Other assets (tokens)
        return {
          asset: `${balance.asset_code}:${balance.asset_issuer}`,
          balance: balance.balance
        };
      }
    });
  } catch (error) {
    console.error('Error fetching Stellar balance:', error);
    
    // If the account doesn't exist yet, return 0 XLM
    if (error instanceof Error && 
        error.message.includes('status code 404') || 
        error.message.includes('not found')) {
      return [{ asset: 'XLM', balance: '0' }];
    }
    
    throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Format balance for display
 * 
 * @param {string} balance - The balance amount as string
 * @param {number} decimals - Number of decimal places to display
 * @returns {string} Formatted balance string
 */
export function formatBalance(balance: string, decimals: number = 7): string {
  try {
    // Parse the balance as a float and fix to specified decimal places
    const formattedBalance = parseFloat(balance).toFixed(decimals);
    
    // Remove trailing zeros after the decimal point
    return formattedBalance.replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
} 