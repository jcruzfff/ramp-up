import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    'passkey-kit', 
    'passkey-factory-sdk', 
    'passkey-kit-sdk',
    'sac-sdk',
    '@simplewebauthn/browser',
    '@stellar/stellar-sdk'
  ],
  images: {
    domains: ["images.unsplash.com", "i.pravatar.cc", "pbs.twimg.com", "i.pcdn.xyz"]
  }
};

export default nextConfig;
