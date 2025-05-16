import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST handler for generating WebAuthn credential creation options
 * This API endpoint helps set up WebAuthn credentials for PasskeyKit
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, domain } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log(`Generating WebAuthn options for user ${userId} on domain ${domain}`);
    
    // Use your site's actual name and domain
    const rpName = process.env.NEXT_PUBLIC_SITE_NAME || 'Stellar Swipe';
    const rpId = domain;
    
    // Basic WebAuthn credential options
    // In a production environment, you would generate more secure and unique options
    const options = {
      rp: {
        name: rpName,
        id: rpId,
      },
      user: {
        id: userId,
        name: `user-${userId}`,
        displayName: `User ${userId}`,
      },
      challenge: crypto.randomBytes(32).toString('base64'),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000, // 1 minute
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        userVerification: 'preferred',
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