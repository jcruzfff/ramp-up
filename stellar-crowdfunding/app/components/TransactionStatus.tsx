'use client';

import { useStellarClient } from '@/app/hooks/useStellarClient';
import { TransactionStatus as TxStatus } from '@/app/services/wallet-service';
import { formatAddress } from '@/src/contracts/contracts';
import { AlertTriangle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TransactionStatus() {
  const { transactions } = useStellarClient();
  const [visible, setVisible] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<typeof transactions>([]);

  // Filter for recent transactions (last 5 minutes)
  useEffect(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recents = transactions.filter(tx => {
      // Extract timestamp from ID (format: timestamp-random)
      const txTimestamp = parseInt(tx.id.split('-')[0]);
      return !isNaN(txTimestamp) && txTimestamp > fiveMinutesAgo;
    }).slice(0, 5); // Show max 5 recent transactions
    
    setRecentTransactions(recents);
    setVisible(recents.length > 0);
  }, [transactions]);

  // Auto-hide after 10 seconds of inactivity
  useEffect(() => {
    if (recentTransactions.length === 0) return;
    
    const timer = setTimeout(() => {
      const hasActiveTx = recentTransactions.some(
        tx => tx.status === TxStatus.PENDING || tx.status === TxStatus.SUBMITTED
      );
      if (!hasActiveTx) {
        setVisible(false);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [recentTransactions]);

  if (!visible || recentTransactions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-medium">Recent Transactions</h3>
        <button 
          onClick={() => setVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {recentTransactions.map((tx) => (
          <div key={tx.id} className="p-3 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {tx.status === TxStatus.PENDING && (
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                {tx.status === TxStatus.SUBMITTED && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                )}
                {tx.status === TxStatus.CONFIRMED && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                )}
                {tx.status === TxStatus.FAILED && (
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="font-medium">
                  {tx.status === TxStatus.PENDING && 'Preparing...'}
                  {tx.status === TxStatus.SUBMITTED && 'Processing...'}
                  {tx.status === TxStatus.CONFIRMED && 'Confirmed'}
                  {tx.status === TxStatus.FAILED && 'Failed'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(parseInt(tx.id.split('-')[0])).toLocaleTimeString()}
              </span>
            </div>
            
            {tx.hash && (
              <div className="mt-1 text-xs text-gray-600">
                TX: {formatAddress(tx.hash, 6, 6)}
              </div>
            )}
            
            {tx.error && (
              <div className="mt-1 text-xs text-red-500">
                {tx.error.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 