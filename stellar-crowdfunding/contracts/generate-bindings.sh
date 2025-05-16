#!/bin/bash
set -e

# Check if contract IDs are provided
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 CDUMNH5543YMWUFSHRPNRWYTPOLTHLPHSM26ISWPRG3EH6P4MQLJUOX3 CC2EAXLDNAJHV63F7Z52VQEPEXVEURPYNGYMFTHQ5KFIJP5DLEI26RUK"
    echo "Example: $0 CDUMNH5543YMWUFSHRPNRWYTPOLTHLPHSM26ISWPRG3EH6P4MQLJUOX3 CCVT2ZX7DQHWB66LRWC5LFQSYFYKM3QQZSJXLNWYCCBH22GOILPTKOEX"
    exit 1
fi

FACTORY_ID="$1"
PROJECT_ID="$2"
NETWORK="testnet"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Output directories
BINDINGS_DIR="../app/src/contracts"
FACTORY_DIR="${BINDINGS_DIR}/factory"
PROJECT_DIR="${BINDINGS_DIR}/project"

echo "Creating bindings directory structure..."
mkdir -p "${FACTORY_DIR}"
mkdir -p "${PROJECT_DIR}"

echo "Generating TypeScript bindings for factory contract..."
echo "Contract ID: ${FACTORY_ID}"
stellar contract bindings typescript \
    --network ${NETWORK} \
    --contract-id ${FACTORY_ID} \
    --output-dir ${FACTORY_DIR} \
    --overwrite

echo "Generating TypeScript bindings for project contract..."
echo "Contract ID: ${PROJECT_ID}"
stellar contract bindings typescript \
    --network ${NETWORK} \
    --contract-id ${PROJECT_ID} \
    --output-dir ${PROJECT_DIR} \
    --overwrite

echo "Building bindings packages..."
cd ${FACTORY_DIR} && npm install && npm run build
cd ../../..
cd ${PROJECT_DIR} && npm install && npm run build
cd ../../..

echo "TypeScript bindings generated successfully!"
echo "Factory bindings: ${FACTORY_DIR}"
echo "Project bindings: ${PROJECT_DIR}"

echo "Creating contracts.ts file for easy imports..."
cat > "${BINDINGS_DIR}/contracts.ts" << EOL
// Contract IDs on Stellar testnet
export const FACTORY_CONTRACT_ID = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || '${FACTORY_ID}';
export const PROJECT_CONTRACT_ID = process.env.NEXT_PUBLIC_PROJECT_CONTRACT_ID || '${PROJECT_ID}';
export const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || '${NETWORK_PASSPHRASE}';

// Stellar testnet RPC URL
export const TESTNET_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

// Import generated bindings
import * as FactoryContract from './factory';
import * as ProjectContract from './project';

/**
 * Get the factory contract client
 */
export function getFactoryClient() {
  try {
    return new FactoryContract.Client({
      contractId: FACTORY_CONTRACT_ID,
      networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: TESTNET_RPC_URL,
    });
  } catch (error) {
    console.error('Failed to create factory client:', error);
    throw error;
  }
}

/**
 * Get a project contract client for a specific project
 * @param contractId - The ID of the project contract
 */
export function getProjectClient(contractId = PROJECT_CONTRACT_ID) {
  try {
    return new ProjectContract.Client({
      contractId: contractId,
      networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: TESTNET_RPC_URL,
    });
  } catch (error) {
    console.error('Failed to create project client:', error);
    throw error;
  }
}

/**
 * Transaction helper: Handle typical Stellar transaction submission
 * @param txnFunction - The function that generates and submits a transaction
 */
export async function handleTransaction<T>(txnFunction: () => Promise<T>): Promise<T> {
  try {
    return await txnFunction();
  } catch (error) {
    if (typeof error === 'object' && error !== null) {
      // Handle specific Stellar/Soroban error types
      console.error('Transaction error:', error);
    }
    throw error;
  }
}

/**
 * Formats a contract address for display
 * @param address - The full contract address
 * @param startChars - Number of characters to show at start
 * @param endChars - Number of characters to show at end
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address || '';
  }
  return \`\${address.substring(0, startChars)}...\${address.substring(address.length - endChars)}\`;
}

// Save these IDs to .env.local file if they don't exist
if (typeof window === 'undefined') {
  // Use dynamic import instead of require
  import('fs').then(fs => {
    import('path').then(path => {
      const dotenvPath = path.resolve(process.cwd(), '.env.local');
      
      try {
        let envContent = '';
        if (fs.existsSync(dotenvPath)) {
          envContent = fs.readFileSync(dotenvPath, 'utf8');
        }
        
        if (!envContent.includes('NEXT_PUBLIC_FACTORY_CONTRACT_ID')) {
          fs.appendFileSync(dotenvPath, 
            \`\nNEXT_PUBLIC_FACTORY_CONTRACT_ID=\${FACTORY_CONTRACT_ID}\n\`);
        }
        
        if (!envContent.includes('NEXT_PUBLIC_PROJECT_CONTRACT_ID')) {
          fs.appendFileSync(dotenvPath, 
            \`NEXT_PUBLIC_PROJECT_CONTRACT_ID=\${PROJECT_CONTRACT_ID}\n\`);
        }
        
        if (!envContent.includes('NEXT_PUBLIC_STELLAR_RPC_URL')) {
          fs.appendFileSync(dotenvPath, 
            \`NEXT_PUBLIC_STELLAR_RPC_URL=\${TESTNET_RPC_URL}\n\`);
        }

        if (!envContent.includes('NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE')) {
          fs.appendFileSync(dotenvPath, 
            \`NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=\${NETWORK_PASSPHRASE}\n\`);
        }
      } catch (error) {
        console.error('Failed to update .env.local file:', error);
      }
    }).catch(err => {
      console.error('Failed to import path module:', err);
    });
  }).catch(err => {
    console.error('Failed to import fs module:', err);
  });
}
EOL

echo "contracts.ts file created successfully!"
echo "You can now import the contracts using:"
echo "import { getFactoryClient, getProjectClient } from '@/src/contracts/contracts';" 