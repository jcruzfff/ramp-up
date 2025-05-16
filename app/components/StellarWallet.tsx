'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useStellarWallet } from '@/app/hooks/useStellarWallet';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { CheckCircle, Copy, Loader2 } from 'lucide-react';
import { truncateAddress, getStellarAccountExplorerUrl } from '@/app/lib/utils';

export default function StellarWallet() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wallet, isLoading, error, createWallet } = useStellarWallet();
  const [showAddress, setShowAddress] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle copying the address with visual feedback
  const handleCopyAddress = () => {
    if (!wallet) return;
    
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Stellar Wallet</CardTitle>
          <CardDescription>Loading wallet information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Stellar Wallet</CardTitle>
          <CardDescription>Sign in to access your Stellar wallet</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p>You need to sign in before accessing your wallet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Stellar Wallet</CardTitle>
        <CardDescription>
          {wallet 
            ? "Your Stellar wallet is ready to use" 
            : "Create a Stellar wallet to get started"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-500">
              {wallet ? "Updating wallet information..." : "Creating your Stellar wallet..."}
            </p>
          </div>
        )}

        {wallet && !isLoading && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Wallet ID:</span>
              <span className="font-mono text-sm">{wallet.id.substring(0, 8)}...</span>
            </div>
            
            <div className="flex flex-col space-y-2">
              <span className="font-medium">Stellar Address:</span>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <span className="font-mono text-sm truncate flex-1">
                  {showAddress ? wallet.address : truncateAddress(wallet.address)}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddress(!showAddress)}
                >
                  {showAddress ? 'Hide' : 'Show'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyAddress}
                  disabled={copied}
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Network:</span>
              <span className="text-sm">Stellar {wallet.chainType === 'stellar' ? 'Public' : wallet.chainType}</span>
            </div>

            <div className="mt-4">
              <Button
                variant="link"
                className="w-full text-sm text-blue-600 flex items-center justify-center p-0"
                onClick={() => window.open(getStellarAccountExplorerUrl(wallet.address), '_blank')}
              >
                View on Stellar Explorer ↗
              </Button>
            </div>
          </div>
        )}
        
        {!wallet && !isLoading && (
          <div className="text-center p-8 bg-gray-50 rounded-md">
            <p className="mb-4 text-gray-600">You don't have a Stellar wallet yet.</p>
            <p className="text-sm text-gray-500">Clicking the button below will create a wallet for your account.</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {!wallet && !isLoading ? (
          <Button 
            className="w-full" 
            disabled={isLoading}
            onClick={createWallet}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Wallet...
              </>
            ) : 
              'Create Stellar Wallet'
            }
          </Button>
        ) : (
          wallet && !isLoading && (
            <Button variant="outline" className="w-full" onClick={handleCopyAddress} disabled={copied}>
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Address Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Address
                </>
              )}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
} 