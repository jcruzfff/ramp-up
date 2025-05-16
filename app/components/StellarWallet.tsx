'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useStellarWallet } from '@/app/hooks/useStellarWallet';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { CheckCircle, Copy, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { truncateAddress, getStellarAccountExplorerUrl } from '@/app/lib/utils';
import { useStellarClient } from '@/app/hooks/useStellarClient';

export default function StellarWallet() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wallet, isLoading, error, createWallet } = useStellarWallet();
  const { getAccountBalance, fundAccountWithFriendbot, isValidStellarAddress } = useStellarClient();
  const [showAddress, setShowAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);

  // Handle copying the address with visual feedback
  const handleCopyAddress = () => {
    if (!wallet) return;
    
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch account balance - wrapped in useCallback to avoid recreating on every render
  const fetchBalance = useCallback(async () => {
    if (!wallet?.address || !isValidStellarAddress(wallet.address)) return;
    
    try {
      setLoadingBalance(true);
      const accountBalance = await getAccountBalance();
      setBalance(accountBalance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    } finally {
      setLoadingBalance(false);
    }
  }, [wallet, isValidStellarAddress, getAccountBalance]);

  // Fund account with friendbot
  const handleFundAccount = async () => {
    if (!wallet?.address) return;
    
    try {
      setIsFunding(true);
      setFundingError(null);
      
      // Validate wallet address
      if (!isValidStellarAddress(wallet.address)) {
        setFundingError('Invalid wallet address format');
        return;
      }
      
      await fundAccountWithFriendbot(wallet.address);
      
      // Wait a moment before refreshing balance
      setTimeout(() => {
        fetchBalance();
      }, 5000);
    } catch (err) {
      console.error('Error funding account:', err);
      setFundingError(`Funding failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsFunding(false);
    }
  };

  // Log wallet details for debugging
  useEffect(() => {
    console.log('Wallet in StellarWallet component:', wallet);
    if (wallet) console.log('Address validity:', isValidStellarAddress(wallet.address));
  }, [wallet, isValidStellarAddress]);

  // Load balance when wallet is available
  useEffect(() => {
    if (wallet?.address) {
      fetchBalance();
    }
  }, [wallet, fetchBalance]);

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
        {/* Error messages */}
        {(error || fundingError) && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {error || fundingError}
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
            {/* Wallet ID */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Wallet ID:</span>
              <span className="font-mono text-sm">{wallet.id.substring(0, 8)}...</span>
            </div>
            
            {/* Wallet Address */}
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

            {/* Balance */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Balance:</span>
              {loadingBalance ? (
                <span className="flex items-center text-sm">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Loading...
                </span>
              ) : (
                <span className="text-sm font-mono">
                  {typeof balance === 'number' ? `${balance} XLM` : 'Not available'}
                </span>
              )}
            </div>

            {/* Network */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Network:</span>
              <span className="text-sm">Stellar Testnet</span>
            </div>

            {/* Fund Account Button */}
            {balance === 0 && !isFunding && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-700 mb-2">
                  Your account doesn&apos;t appear to be funded on the Stellar testnet.
                </p>
                <Button
                  onClick={handleFundAccount}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  disabled={isFunding}
                >
                  {isFunding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting funds...
                    </>
                  ) : (
                    'Fund with Testnet XLM'
                  )}
                </Button>
              </div>
            )}

            {/* Explorer Link */}
            <div className="mt-4">
              <Button
                variant="link"
                className="w-full text-sm text-blue-600 flex items-center justify-center p-0"
                onClick={() => window.open(getStellarAccountExplorerUrl(wallet.address), '_blank')}
              >
                View on Stellar Expert <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            {/* Debug Info */}
            <div className="mt-4 p-2 bg-gray-50 rounded border border-gray-100 text-xs">
              <p className="font-mono text-gray-500">Address valid: {isValidStellarAddress(wallet.address) ? 'Yes' : 'No'}</p>
              <p className="font-mono text-gray-500 truncate">Full address: {wallet.address}</p>
            </div>
          </div>
        )}
        
        {!wallet && !isLoading && (
          <div className="text-center p-8 bg-gray-50 rounded-md">
            <p className="mb-4 text-gray-600">You don&apos;t have a Stellar wallet yet.</p>
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
            <div className="w-full flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopyAddress} disabled={copied}>
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="flex-1" onClick={fetchBalance}>
                <Loader2 className={`mr-2 h-4 w-4 ${loadingBalance ? 'animate-spin' : ''}`} />
                Refresh Balance
              </Button>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  );
} 