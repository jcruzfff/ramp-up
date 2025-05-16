import { useState, useCallback } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface CreateProjectFormData {
  title: string;
  description: string;
  imageUrl: string;
  daysUntilDeadline: number;
}

export function useCreateProject() {
  const { isConnected, connect, createProject } = useStellarClient();
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
      
      // Create the project on the blockchain
      const projectId = await createProject(
        formData.title,
        formData.description,
        formData.imageUrl || '', // Default to empty string if no image
        formData.daysUntilDeadline
      );
      
      // Store the new project ID
      setNewProjectId(projectId);
      
      // Return the project ID for further actions
      return projectId;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, connect, isAuthenticated, createProject]);

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