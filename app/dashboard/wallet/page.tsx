'use client';

import WalletDisplay from '@/app/components/WalletDisplay';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WalletPage() {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stellar Wallet Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <WalletDisplay />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">What You Can Do</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Create a Stellar wallet with one click</li>
            <li>View your wallet address and balance</li>
            <li>Refresh your balance to see the latest updates</li>
            <li>Send XLM to other users (coming soon)</li>
            <li>Receive XLM from other users (use your wallet address)</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-700 mb-2">Need Test XLM?</h3>
            <p className="text-blue-600 mb-2">
              You can get test XLM from the Stellar Testnet Friendbot to try out features:
            </p>
            <a 
              href="https://laboratory.stellar.org/#account-creator?network=test" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Get Test XLM from Friendbot
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <p className="text-gray-600">
          Transaction history feature coming soon. This will show your recent transactions on the Stellar network.
        </p>
      </div>
    </div>
  );
} 