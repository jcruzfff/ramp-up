import { NextRequest, NextResponse } from 'next/server';
import * as StellarSdk from '@stellar/stellar-sdk';

export async function GET(req: NextRequest) {
  try {
    // Get address from query string
    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Stellar address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }
    
    console.log(`Checking Stellar account status for: ${address}`);
    
    // Create a server connection
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
    
    try {
      // Try to fetch the account
      const account = await server.accounts().accountId(address).call();
      
      // Find the native XLM balance
      const nativeBalance = account.balances.find(
        (balance: { asset_type: string, balance?: string }) => balance.asset_type === 'native'
      );
      
      const balance = nativeBalance && 'balance' in nativeBalance 
        ? parseFloat(nativeBalance.balance) 
        : 0;
      
      return NextResponse.json({
        success: true,
        exists: true,
        funded: balance > 0,
        balance,
        lastModified: account.last_modified_time
      });
    } catch (error: any) {
      // Check if the error is that the account doesn't exist
      if (error.response && error.response.status === 404) {
        return NextResponse.json({
          success: true,
          exists: false,
          funded: false,
          balance: 0
        });
      }
      
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    console.error('Error checking account status:', error);
    return NextResponse.json(
      { error: 'Failed to check Stellar account status' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Stellar address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(address)) {
      return NextResponse.json(
        { error: 'Invalid Stellar address format' },
        { status: 400 }
      );
    }
    
    console.log(`Requesting funding for Stellar account: ${address}`);
    
    try {
      // Request funding from Friendbot
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Friendbot error response:', errorText);
        
        return NextResponse.json(
          { error: `Friendbot request failed: ${response.status} ${response.statusText}` },
          { status: response.status }
        );
      }
      
      const result = await response.json();
      
      return NextResponse.json({
        success: true,
        funded: true,
        transaction: {
          id: result.hash || result.id,
          result: result.result
        }
      });
    } catch (error) {
      console.error('Error funding account with Friendbot:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error funding account:', error);
    return NextResponse.json(
      { error: 'Failed to fund Stellar account' },
      { status: 500 }
    );
  }
} 