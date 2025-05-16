import { useState, useEffect, useCallback } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';

interface ProjectData {
  title: string;
  description: string;
  creator: string;
  imageUrl: string;
  deadline: bigint;
  totalFunded: bigint;
  [key: string]: any;
}

export function useProjectData(projectId?: string) {
  const { getProjectData, getTotalFunded } = useStellarClient();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const projectData = await getProjectData(projectId);
      const totalFunded = await getTotalFunded(projectId);
      
      setProject({
        ...projectData,
        totalFunded
      });
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, getProjectData, getTotalFunded]);

  // Fetch data when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    } else {
      setProject(null);
    }
  }, [projectId, fetchProjectData]);

  // Function to manually refresh data
  const refreshProjectData = useCallback(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  return {
    project,
    isLoading,
    error,
    refreshProjectData
  };
} 