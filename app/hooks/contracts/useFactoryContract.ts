import { useCallback, useState } from 'react';
import { useStellarWallet } from '../useStellarWallet';

interface CreateProjectOptions {
  title: string;
  description: string;
  imageUrl: string;
  daysUntilDeadline: number;
  goalAmount: bigint;
}

export function useFactoryContract() {
  const { wallet } = useStellarWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create a project using the factory contract via API
  const createProject = useCallback(async ({
    title,
    description,
    imageUrl,
    daysUntilDeadline,
    goalAmount
  }: CreateProjectOptions) => {
    if (!wallet?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("=== STARTING PROJECT CREATION ===");
      console.log(`Project: "${title}" by wallet: ${wallet.address}`);
      
      // Prepare the deadline timestamp (current time + days)
      const deadline = Math.floor(Date.now() / 1000) + (daysUntilDeadline * 24 * 60 * 60);
      
      // Call our API endpoint to create the project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          imageSrc: imageUrl || 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3', // Default image
          goalAmount: goalAmount.toString(),
          daysUntilDeadline,
          ownerAddress: wallet.address,
          // Add a flag to indicate this should use the Soroban contract
          useSorobanContract: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const data = await response.json();
      console.log("=== PROJECT CREATION SUCCESSFUL ===");
      console.log("Project created with ID:", data.project.id);
      
      return {
        projectId: data.project.id,
        txHash: data.transactionHash || ''
      };
    } catch (err) {
      console.error("Project creation error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(`Failed to create project: ${errorMessage}`));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  return {
    createProject,
    isLoading,
    error
  };
} 