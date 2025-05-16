import { NextResponse } from 'next/server';
import { Server } from 'stellar-sdk';

// For demo/testnet: Use Stellar's friendbot to fund accounts
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const horizonServer = new Server(HORIZON_URL);

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!address) {
      return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }
    
    console.log('Funding account on testnet:', address);
    
    // In a real implementation, you might use a funder account
    // For testnet, we can use Friendbot
    try {
      // Check if we're on testnet
      if (HORIZON_URL.includes('testnet')) {
        const friendbotUrl = `https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`;
        const response = await fetch(friendbotUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Friendbot error:', errorText);
          return NextResponse.json({ error: 'Friendbot funding failed' }, { status: 500 });
        }
        
        const result = await response.json();
        
        return NextResponse.json({
          status: 200,
          message: 'Smart wallet successfully funded via Friendbot',
          hash: result.hash || result._links?.transaction?.href || 'unknown'
        });
      } else {
        // For mainnet, you'd use your own funding account
        return NextResponse.json({ 
          error: 'Funding on mainnet requires a funded source account' 
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Error funding account:', error);
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in fund endpoint:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 