import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, domain } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Define the domain to use for the WebAuthn operations
    // This must match the domain where the app is running
    const rpId = domain || 'localhost';
    const rpName = 'Stellar Swipe';
    
    // Generate credential creation options
    const options = {
      rp: {
        id: rpId,
        name: rpName,
      },
      user: {
        id: userId,
        name: `user-${userId}`,
        displayName: `User ${userId}`,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'discouraged',
        requireResidentKey: false,
      },
    };
    
    return NextResponse.json({ options });
  } catch (error) {
    console.error('Error generating WebAuthn options:', error);
    return NextResponse.json(
      { error: 'Failed to generate WebAuthn options' },
      { status: 500 }
    );
  }
} 