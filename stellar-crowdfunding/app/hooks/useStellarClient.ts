import { useState, useEffect, useCallback } from 'react';
import { StellarClient, TransactionInfo, TransactionStatus } from '@/app/services/wallet-service';
import { useAuth } from './useAuth';

export function useStellarClient() {
  const { setWallet } = useAuth();
  const [client] = useState<StellarClient>(() => StellarClient.getInstance());
  const [isConnected, setIsConnected] = useState<boolean>(client.isConnected());
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>(client.getTransactions());
  
  // Initialize event listeners
  useEffect(() => {
    const handleConnectionChange = () => {
      setIsConnected(client.isConnected());
      if (client.isConnected()) {
        const wallet = client.getWallet();
        if (wallet) {
          setWallet(wallet);
        }
      }
    };

    const handleTransactionUpdated = (transaction: TransactionInfo) => {
      setTransactions((prevTxs) => {
        const txIndex = prevTxs.findIndex(tx => tx.id === transaction.id);
        if (txIndex >= 0) {
          const newTxs = [...prevTxs];
          newTxs[txIndex] = transaction;
          return newTxs;
        } else {
          return [...prevTxs, transaction];
        }
      });
    };

    // Subscribe to events
    client.on('connected', handleConnectionChange);
    client.on('disconnected', handleConnectionChange);
    client.on('transactionUpdated', handleTransactionUpdated);

    // Initial state
    setIsConnected(client.isConnected());
    setTransactions(client.getTransactions());

    // Cleanup
    return () => {
      client.removeListener('connected', handleConnectionChange);
      client.removeListener('disconnected', handleConnectionChange);
      client.removeListener('transactionUpdated', handleTransactionUpdated);
    };
  }, [client, setWallet]);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const wallet = await client.connect();
      setWallet(wallet);
      return wallet;
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, client, setWallet]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    client.disconnect();
  }, [client]);

  // Get pending transactions
  const getPendingTransactions = useCallback(() => {
    return transactions.filter(tx => 
      tx.status === TransactionStatus.PENDING || 
      tx.status === TransactionStatus.SUBMITTED
    );
  }, [transactions]);

  // Get contract methods (wrapped with error handling)
  const getProjects = useCallback(async () => {
    try {
      return await client.getProjects();
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }, [client]);

  const createProject = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    daysUntilDeadline: number
  ) => {
    try {
      return await client.createProject(title, description, imageUrl, daysUntilDeadline);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, [client]);

  const getProjectData = useCallback(async (projectId: string) => {
    try {
      return await client.getProjectData(projectId);
    } catch (error) {
      console.error('Failed to get project data:', error);
      throw error;
    }
  }, [client]);

  const fundProject = useCallback(async (
    projectId: string, 
    amount: bigint, 
    tokenAddress: string
  ) => {
    try {
      return await client.fundProject(projectId, amount, tokenAddress);
    } catch (error) {
      console.error('Failed to fund project:', error);
      throw error;
    }
  }, [client]);

  const withdrawFunds = useCallback(async (projectId: string) => {
    try {
      return await client.withdrawFunds(projectId);
    } catch (error) {
      console.error('Failed to withdraw funds:', error);
      throw error;
    }
  }, [client]);

  const getTotalFunded = useCallback(async (projectId: string) => {
    try {
      return await client.getTotalFunded(projectId);
    } catch (error) {
      console.error('Failed to get total funded:', error);
      throw error;
    }
  }, [client]);

  const getContribution = useCallback(async (
    projectId: string, 
    funderAddress: string
  ) => {
    try {
      return await client.getContribution(projectId, funderAddress);
    } catch (error) {
      console.error('Failed to get contribution:', error);
      throw error;
    }
  }, [client]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Connection methods
    connect,
    disconnect,
    
    // Transaction state
    transactions,
    pendingTransactions: getPendingTransactions(),
    
    // Contract methods
    getProjects,
    createProject,
    getProjectData,
    fundProject,
    withdrawFunds,
    getTotalFunded,
    getContribution,
  };
} 