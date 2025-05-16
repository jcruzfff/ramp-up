import { NextResponse } from 'next/server';
import { Server } from '@stellar/stellar-sdk/rpc';

// RPC server instance
const rpc = new Server(process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org");

export async function POST(request: Request) {
  try {
    const { xdr } = await request.json();
    
    if (!xdr) {
      return NextResponse.json({ error: 'Missing XDR in request body' }, { status: 400 });
    }
    
    console.log('Sending transaction to Stellar network...');
    const response = await rpc.sendTransaction(xdr);
    
    // Send the response back to the client
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 