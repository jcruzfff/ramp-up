'use client';

import { useAuth } from '@/app/hooks/useAuth';
import LoginButton from '@/app/components/auth/LoginButton';

export default function Projects() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Projects</h1>
      
      {isAuthenticated ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">
            Project swiping feature coming soon!
          </p>
          <p className="text-gray-500 mb-8">
            In the future, you&apos;ll be able to swipe through projects and fund them with a simple gesture.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Sign in to discover projects</h2>
          <p className="text-gray-500 mb-6">
            You need to be signed in to view and fund projects.
          </p>
          <LoginButton className="px-6 py-3 text-lg" />
        </div>
      )}
    </div>
  );
} 