import { useState, useCallback } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';
import { useAuth } from '@/app/hooks/useAuth';

// Default for XLM token on testnet
const DEFAULT_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

interface FundProjectOptions {
  tokenAddress?: string;
  onSuccess?: (txData: any) => void;
}

export function useFundProject(projectId?: string) {
  const { isConnected, connect, fundProject } = useStellarClient();
  const { isAuthenticated } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const handleFundProject = useCallback(async (
    amount: string, 
    options: FundProjectOptions = {}
  ) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Reset states
    setIsSubmitting(true);
    setError(null);
    setTransactionHash(null);
    
    try {
      // Check if user is authenticated, if not, try to connect
      if (!isConnected) {
        await connect();
      }
      
      // Validate required authentication
      if (!isAuthenticated) {
        throw new Error('Authentication required to fund a project');
      }
      
      // Validate amount
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      // Convert to smallest units (assuming 7 decimals for XLM)
      const amountInSmallestUnits = BigInt(Math.floor(amountNumber * 10_000_000));
      
      // Use default token if not specified
      const tokenAddress = options.tokenAddress || DEFAULT_TOKEN_ADDRESS;
      
      // Fund the project
      const result = await fundProject(
        projectId,
        amountInSmallestUnits,
        tokenAddress
      );
      
      // Store transaction hash if available
      if (result && result.hash) {
        setTransactionHash(result.hash);
      }
      
      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      console.error('Error funding project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [projectId, isConnected, connect, isAuthenticated, fundProject]);

  return {
    handleFundProject,
    isSubmitting,
    error,
    transactionHash,
    isAuthenticated,
    isConnected
  };
} 