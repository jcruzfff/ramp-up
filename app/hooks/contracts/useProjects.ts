import { useState, useEffect, useCallback } from 'react';
import { useStellarClient } from '@/app/hooks/useStellarClient';

export function useProjects() {
  const { getProjects, getProjectData } = useStellarClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all project IDs from factory contract
      const projectIds = await getProjects();
      
      if (!projectIds || projectIds.length === 0) {
        setProjects([]);
        return [];
      }
      
      // Fetch detailed data for each project
      const projectsData = await Promise.all(
        projectIds.map(async (id) => {
          try {
            const data = await getProjectData(id);
            return {
              id,
              ...data
            };
          } catch (err) {
            console.error(`Error fetching data for project ${id}:`, err);
            // Return partial data with error flag
            return {
              id,
              error: true,
              errorMessage: err instanceof Error ? err.message : String(err)
            };
          }
        })
      );
      
      // Filter out any projects that failed to load completely
      const validProjects = projectsData.filter(p => !p.error);
      setProjects(validProjects);
      return validProjects;
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getProjects, getProjectData]);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Function to manually refresh projects
  const refreshProjects = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refreshProjects
  };
} 