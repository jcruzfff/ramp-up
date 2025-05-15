import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@privy-io/server-auth';
import { getStellarBalance } from '@/lib/stellar/balance';

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
    
    // Get the wallet address from query parameters
    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    // Fetch balance for the given address
    const balances = await getStellarBalance(address);
    
    return NextResponse.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: `Failed to fetch balance: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 