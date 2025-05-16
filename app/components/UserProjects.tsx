'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useStellarWallet } from '@/app/hooks/useStellarWallet';
import { ProjectCard } from '@/app/components/project-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Loader2, PlusCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  goalAmount: number;
  currentAmount: number;
  category: string;
  sponsorBoosted?: boolean;
  donorCount?: number;
  daysLeft?: number;
  ownerAddress?: string;
}

export default function UserProjects() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wallet } = useStellarWallet();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user projects
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!wallet?.address) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch projects from API with owner filter
        const response = await fetch(`/api/projects?ownerAddress=${encodeURIComponent(wallet.address)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Error fetching user projects:', err);
        setError('Failed to load your projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (wallet?.address) {
      fetchUserProjects();
    } else {
      setIsLoading(false);
    }
  }, [wallet]);

  // Handle creating a new project
  const handleCreateProject = () => {
    router.push('/create');
  };

  // Handle viewing a project
  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Loading state
  if (authLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Loading your projects...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Sign in to view your projects</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p>You need to sign in to see your projects.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            Projects you&apos;ve created on Stellar Swipe
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-sm text-gray-500">Loading your projects...</p>
            </div>
          )}

          {/* Projects list */}
          {!isLoading && projects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => handleViewProject(project.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && projects.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="mb-4 text-gray-600">You haven&apos;t created any projects yet.</p>
              <p className="text-sm text-gray-500 mb-6">Create your first project to get started!</p>
              <Button onClick={handleCreateProject} className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create new project button */}
      {!isLoading && projects.length > 0 && (
        <Button 
          onClick={handleCreateProject} 
          className="w-full flex items-center justify-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      )}
    </div>
  );
} 