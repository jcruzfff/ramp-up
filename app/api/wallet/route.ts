import { NextRequest, NextResponse } from 'next/server';
import { createStellarWallet, getWallet, linkWalletToUser } from '@/lib/privy/wallet-service';
import { getUser } from '@privy-io/server-auth';

// Handler for creating a new wallet
export async function POST(req: NextRequest) {
  try {
    // Verify the user's authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate the token and get the user
    let user;
    try {
      user = await getUser(token);
    } catch (error) {
      console.error('Invalid authentication token:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
    // Create a new Stellar wallet
    const wallet = await createStellarWallet();
    
    // Link the wallet to the user
    await linkWalletToUser(user.id, wallet.id);
    
    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chainType,
        // Don't expose sensitive data
      }
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handler for getting wallet information
export async function GET(req: NextRequest) {
  try {
    // Verify the user's authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Validate the token and get the user
    let user;
    try {
      user = await getUser(token);
    } catch (error) {
      console.error('Invalid authentication token:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    
    // Get the wallet ID from query parameters
    const url = new URL(req.url);
    const walletId = url.searchParams.get('walletId');
    
    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }
    
    // Retrieve the wallet
    const wallet = await getWallet(walletId);
    
    // Here you should verify that the wallet belongs to the authenticated user
    // This would require querying your database for the user-wallet association
    
    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        chainType: wallet.chainType,
        // Don't expose sensitive data
      }
    });
  } catch (error) {
    console.error('Error retrieving wallet:', error);
    return NextResponse.json(
      { error: `Failed to retrieve wallet: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 