'use client';

import { Button } from '@/components/ui/button';
import { useStellarClient } from '@/app/hooks/useStellarClient';
import { useAuth } from '@/app/hooks/useAuth';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { formatAddress } from '@/src/contracts/contracts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WalletConnectButton() {
  const { connect, disconnect, isConnected, isConnecting } = useStellarClient();
  const { wallet } = useAuth();
  
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (isConnecting) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Connecting...
      </Button>
    );
  }

  if (isConnected && wallet?.address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Wallet className="h-4 w-4" />
            {formatAddress(wallet.address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="gap-2 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(wallet.address)}
          >
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="gap-2 text-red-600 cursor-pointer"
            onClick={disconnect}
          >
            <LogOut className="h-4 w-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      <Wallet className="h-4 w-4" /> Connect Wallet
    </Button>
  );
} 