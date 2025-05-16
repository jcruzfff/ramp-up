import { useState, useCallback } from 'react';
import { getFactoryClient, getProjectClient } from '@/src/contracts/contracts';
import { useAuth } from './useAuth';

export interface ProjectData {
  title: string;
  description: string;
  imageUrl: string;
  creator: string;
  deadline: number;
}

export function useContracts() {
  const { wallet } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all projects from the factory contract
  const getProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const factoryClient = getFactoryClient();
      const projects = await factoryClient.getProjects();
      return projects;
    } catch (err) {
      setError(`Failed to get projects: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new project
  const createProject = useCallback(async (
    title: string, 
    description: string, 
    imageUrl: string, 
    daysUntilDeadline: number
  ) => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const factoryClient = getFactoryClient();
      
      // Calculate deadline timestamp (current time + days in seconds)
      const deadline = Math.floor(Date.now() / 1000) + (daysUntilDeadline * 86400);
      
      // Sign and send transaction to create project
      const result = await factoryClient.createProject({
        creator: wallet.address,
        title: title,
        description: description,
        image_url: imageUrl,
        deadline: BigInt(deadline)
      });
      
      return result;
    } catch (err) {
      setError(`Failed to create project: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  // Get project data
  const getProjectData = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectClient = getProjectClient(projectId);
      const data = await projectClient.getProjectData();
      return data;
    } catch (err) {
      setError(`Failed to get project data: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Contribute funds to a project
  const fundProject = useCallback(async (projectId: string, amount: bigint, tokenAddress: string) => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    try {
      const projectClient = getProjectClient(projectId);
      
      // Set token if not already set
      try {
        await projectClient.setToken({ token_id: tokenAddress });
      } catch (err) {
        // Ignore errors here as the token might already be set
        console.log("Token might already be set, continuing...");
      }
      
      // Fund the project
      const result = await projectClient.fund({
        from: wallet.address,
        amount: amount
      });
      
      return result;
    } catch (err) {
      setError(`Failed to fund project: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  // Withdraw funds from a project (only project creator)
  const withdrawFunds = useCallback(async (projectId: string) => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    try {
      const projectClient = getProjectClient(projectId);
      const result = await projectClient.withdraw();
      return result;
    } catch (err) {
      setError(`Failed to withdraw funds: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  // Get total funded amount for a project
  const getTotalFunded = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectClient = getProjectClient(projectId);
      const totalFunded = await projectClient.getTotalFunded();
      return totalFunded;
    } catch (err) {
      setError(`Failed to get total funded: ${err instanceof Error ? err.message : String(err)}`);
      return BigInt(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user's contribution to a project
  const getUserContribution = useCallback(async (projectId: string, address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const projectClient = getProjectClient(projectId);
      const contribution = await projectClient.getContribution({ funder: address });
      return contribution;
    } catch (err) {
      setError(`Failed to get contribution: ${err instanceof Error ? err.message : String(err)}`);
      return BigInt(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getProjects,
    createProject,
    getProjectData,
    fundProject,
    withdrawFunds,
    getTotalFunded,
    getUserContribution,
  };
} 