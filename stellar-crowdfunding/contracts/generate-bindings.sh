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
// Generated contract bindings
import * as FactoryContract from "./factory";
import * as ProjectContract from "./project";

// RPC URL for Stellar testnet
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

// Contract IDs
export const FACTORY_CONTRACT_ID = "${FACTORY_ID}";
export const PROJECT_CONTRACT_ID = "${PROJECT_ID}";

// Factory contract client
export const getFactoryClient = () => {
  return new FactoryContract.Client(FACTORY_CONTRACT_ID, {
    network: "testnet",
    rpcUrl: RPC_URL,
  });
};

// Project contract client (for a specific project)
export const getProjectClient = (projectId: string) => {
  return new ProjectContract.Client(projectId, {
    network: "testnet",
    rpcUrl: RPC_URL,
  });
};

// Save these IDs to .env.local file if they don't exist
if (typeof window === 'undefined') {
  const fs = require('fs');
  const path = require('path');
  const dotenvPath = path.resolve(process.cwd(), '.env.local');
  
  try {
    let envContent = '';
    if (fs.existsSync(dotenvPath)) {
      envContent = fs.readFileSync(dotenvPath, 'utf8');
    }
    
    if (!envContent.includes('NEXT_PUBLIC_FACTORY_CONTRACT_ID')) {
      fs.appendFileSync(dotenvPath, 
        \`\nNEXT_PUBLIC_FACTORY_CONTRACT_ID=${FACTORY_ID}\n\`);
    }
    
    if (!envContent.includes('NEXT_PUBLIC_PROJECT_CONTRACT_ID')) {
      fs.appendFileSync(dotenvPath, 
        \`NEXT_PUBLIC_PROJECT_CONTRACT_ID=${PROJECT_ID}\n\`);
    }
    
    if (!envContent.includes('NEXT_PUBLIC_STELLAR_RPC_URL')) {
      fs.appendFileSync(dotenvPath, 
        \`NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org\n\`);
    }
  } catch (error) {
    console.error('Failed to update .env.local file:', error);
  }
}
EOL

echo "contracts.ts file created successfully!"
echo "You can now import the contracts using:"
echo "import { getFactoryClient, getProjectClient } from '@/src/contracts/contracts';" 