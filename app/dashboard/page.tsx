'use client';

import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useAuth } from '@/app/hooks/useAuth';
import StellarWallet from '@/app/components/wallet/StellarWallet';

export default function Dashboard() {
  const { getUserName, getUserEmail } = useAuth();
  const userName = getUserName();
  const email = getUserEmail();

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Your Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {userName}</p>
              {email && <p><span className="font-medium">Email:</span> {email}</p>}
            </div>
          </div>

          <StellarWallet />
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Your Funded Projects</h2>
          <p className="text-gray-500">You haven&apos;t funded any projects yet.</p>
          <a
            href="/projects"
            className="mt-3 sm:mt-4 inline-block px-3 py-2 sm:px-4 sm:py-2 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto text-center"
          >
            Discover Projects
          </a>
        </div>
      </div>
    </ProtectedRoute>
  );
} 