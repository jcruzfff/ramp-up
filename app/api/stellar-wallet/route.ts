import { NextRequest, NextResponse } from 'next/server';

// Mock database of wallets (in production would use a real database)
const walletDB = new Map<string, {
  id: string;
  address: string;
  chainType: string;
  createdAt: Date;
}>();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      console.error('No user ID provided in request');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Handling Stellar wallet request for user ${userId}`);

    // Check if user already has a wallet
    if (walletDB.has(userId)) {
      const existingWallet = walletDB.get(userId);
      console.log(`User ${userId} already has a Stellar wallet: ${existingWallet?.id}`);
      
      return NextResponse.json({
        success: true,
        wallet: existingWallet
      });
    }

    // Create a new stellar wallet (in a real app, this would integrate with Stellar SDK)
    const walletId = `wallet_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
    const stellarAddress = `G${Array(56).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('')}`;
    
    const newWallet = {
      id: walletId,
      address: stellarAddress,
      chainType: 'stellar',
      createdAt: new Date(),
    };

    // Store in our "database"
    walletDB.set(userId, newWallet);
    
    console.log(`Created Stellar wallet for user ${userId}: ${walletId}`);

    return NextResponse.json({
      success: true,
      wallet: {
        id: newWallet.id,
        address: newWallet.address,
        chainType: newWallet.chainType
      }
    });
  } catch (error) {
    console.error('Unexpected error in Stellar wallet API:', error);
    return NextResponse.json(
      { error: 'Failed to process Stellar wallet request' },
      { status: 500 }
    );
  }
} 