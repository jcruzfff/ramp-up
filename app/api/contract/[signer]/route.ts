import { NextRequest, NextResponse } from 'next/server';

/**
 * This API endpoint simulates Mercury's functionality for looking up
 * contract addresses from passkey IDs. In a production environment,
 * you would integrate with the actual Mercury service.
 */

// In-memory map for demo purposes, replace with proper database in production
const contractMap: Record<string, string> = {};

// This would typically query a database or service like Mercury
// as mentioned in the Stellar docs for passkey prerequisites
export async function GET(
  req: NextRequest,
  { params }: { params: { signer: string } }
) {
  try {
    const { signer } = params;
    
    if (!signer) {
      return NextResponse.json({ error: 'Missing signer parameter' }, { status: 400 });
    }
    
    console.log('Looking up contract ID for signer:', signer);
    
    // In a real implementation, you would:
    // 1. Query your Mercury indexer or database to find the contract associated with this signer
    // 2. Return the contract ID if found
    
    // For demo purposes, we'll return a dummy contract ID
    // In production, this should be replaced with a real lookup
    const contractId = contractMap[signer] || `C${Array(35).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('')}`;
    
    // Store for future lookups (demo only, use a database in production)
    contractMap[signer] = contractId;
    
    // Return just the contract ID as a string (as per the docs)
    return new NextResponse(contractId);
  } catch (error) {
    console.error('Error looking up contract ID:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 