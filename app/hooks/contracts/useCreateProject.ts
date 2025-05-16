import { useState, useCallback } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useFactoryContract } from './useFactoryContract';

interface CreateProjectFormData {
  title: string;
  description: string;
  imageUrl: string;
  daysUntilDeadline: number;
  goalAmount?: number;
  categories?: string[];
  websiteUrl?: string;
}

interface ProjectMetadata extends CreateProjectFormData {
  projectId: string;
}

export function useCreateProject() {
  const { isConnected, connect } = useStellarClient();
  const { createProject: createContractProject } = useFactoryContract();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);

  const handleCreateProject = useCallback(async (formData: CreateProjectFormData) => {
    // Reset states
    setIsSubmitting(true);
    setError(null);
    setNewProjectId(null);
    
    try {
      // Check if user is authenticated, if not, try to connect
      if (!isConnected) {
        await connect();
      }
      
      // Validate required authentication
      if (!isAuthenticated) {
        throw new Error('Authentication required to create a project');
      }
      
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error('Project title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Project description is required');
      }
      
      if (formData.daysUntilDeadline <= 0) {
        throw new Error('Project deadline must be in the future');
      }
      
      // Create the project using the factory contract - this will generate a Soroban transaction
      const { projectId } = await createContractProject({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || '',
        daysUntilDeadline: formData.daysUntilDeadline,
        goalAmount: BigInt(formData.goalAmount || 1000) 
      });
      
      // Store the new project ID
      setNewProjectId(projectId);
      
      // Save additional project metadata through API
      await saveProjectMetadata({
        projectId,
        ...formData
      });
      
      // Return the project ID for further actions
      return projectId;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, connect, isAuthenticated, createContractProject]);

  // Function to save additional project metadata via API
  const saveProjectMetadata = async (data: ProjectMetadata) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save project metadata to API');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving project metadata:', error);
      // We don't want to fail the whole creation if just the metadata fails
      // so we log the error but don't rethrow it
    }
  };

  // Function to navigate to the newly created project
  const navigateToProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, [router]);

  return {
    handleCreateProject,
    navigateToProject,
    isSubmitting,
    error,
    newProjectId,
    isAuthenticated,
    isConnected
  };
} 