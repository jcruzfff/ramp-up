import { NextRequest, NextResponse } from 'next/server';

/**
 * This API endpoint simulates Mercury's functionality for looking up
 * contract addresses from passkey IDs. In a production environment,
 * you would integrate with the actual Mercury service.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { signer: string } }
) {
  try {
    const { signer } = params;
    
    if (!signer) {
      return new Response('No signer ID provided', { status: 400 });
    }

    console.log(`Looking up contract for signer: ${signer}`);

    // In a real implementation with Mercury, you would make an API call to the Mercury service
    // For this example, we'll return a dummy contract ID
    // You would integrate with PasskeyServer.getContractId() in a real implementation
    const contractId = `C${Array(35).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('')}`;
    
    return new Response(contractId);
  } catch (error) {
    console.error('Error looking up contract:', error);
    return new Response('Failed to lookup contract', { status: 500 });
  }
} 