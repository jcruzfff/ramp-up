import { useState, useCallback, useEffect } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';
import { useAuth } from '@/app/hooks/useAuth';
import { useProjectData } from './useProjectData';

export function useWithdrawFunds(projectId?: string) {
  const { isConnected, connect, withdrawFunds, getProjectData } = useStellarClient();
  const { isAuthenticated, getAddress } = useAuth();
  const { project } = useProjectData(projectId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(false);

  // Check if current user is project creator and if deadline has passed
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!projectId || !isAuthenticated) {
        setIsCreator(false);
        return;
      }

      try {
        // Get user's wallet address
        const userAddress = getAddress();
        
        if (!userAddress) {
          setIsCreator(false);
          return;
        }
        
        // If project data is already loaded via useProjectData
        if (project) {
          setIsCreator(project.creator === userAddress);
          
          // Check if deadline has passed
          const deadlineTimestamp = Number(project.deadline);
          const currentTimestamp = Math.floor(Date.now() / 1000);
          setIsDeadlinePassed(currentTimestamp > deadlineTimestamp);
          return;
        }
        
        // Otherwise fetch project data manually
        const projectData = await getProjectData(projectId);
        setIsCreator(projectData.creator === userAddress);
        
        // Check if deadline has passed
        const deadlineTimestamp = Number(projectData.deadline);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        setIsDeadlinePassed(currentTimestamp > deadlineTimestamp);
      } catch (err) {
        console.error('Error checking creator status:', err);
        setIsCreator(false);
      }
    };

    checkCreatorStatus();
  }, [projectId, isAuthenticated, getAddress, project, getProjectData]);

  const handleWithdrawFunds = useCallback(async () => {
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
        throw new Error('Authentication required to withdraw funds');
      }
      
      // Validate creator status
      if (!isCreator) {
        throw new Error('Only the project creator can withdraw funds');
      }
      
      // Validate deadline has passed
      if (!isDeadlinePassed) {
        throw new Error('Funds can only be withdrawn after the project deadline');
      }
      
      // Withdraw funds
      const result = await withdrawFunds(projectId);
      
      // Store transaction hash if available
      if (result && result.hash) {
        setTransactionHash(result.hash);
      }
      
      return result;
    } catch (err) {
      console.error('Error withdrawing funds:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    projectId, 
    isConnected, 
    connect, 
    isAuthenticated, 
    isCreator, 
    isDeadlinePassed, 
    withdrawFunds
  ]);

  return {
    handleWithdrawFunds,
    isSubmitting,
    error,
    transactionHash,
    isAuthenticated,
    isConnected,
    isCreator,
    isDeadlinePassed,
    canWithdraw: isCreator && isDeadlinePassed
  };
} 