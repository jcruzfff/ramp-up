#!/bin/bash
set -e

# Check if identity is provided
IDENTITY=${1:-admin}
NETWORK=testnet

# Create directory for storing deployment info
mkdir -p .stellar-crowdfunding

echo "Building contracts..."
cd contracts/factory_contract
cargo build --release --target wasm32-unknown-unknown
cd ../project_contract
cargo build --release --target wasm32-unknown-unknown
cd ../..

echo "Setting up the identity..."
# Check if identity exists, create if not
if ! stellar keys address $IDENTITY &>/dev/null; then
    echo "Creating and funding identity '$IDENTITY'..."
    stellar keys generate $IDENTITY --network $NETWORK --fund
fi

# Get the identity's address
ADMIN_ADDRESS=$(stellar keys address $IDENTITY)
echo "Using admin address: $ADMIN_ADDRESS"

echo "Uploading project contract WASM..."
PROJECT_WASM_HASH=$(stellar contract install \
    --wasm ./contracts/project_contract/target/wasm32-unknown-unknown/release/project_contract.wasm \
    --source $IDENTITY \
    --network $NETWORK | grep "Contract installed with hash" | awk '{print $NF}')

echo "Project WASM hash: $PROJECT_WASM_HASH"
echo $PROJECT_WASM_HASH > .stellar-crowdfunding/project_wasm_hash

echo "Uploading factory contract WASM..."
FACTORY_WASM_HASH=$(stellar contract install \
    --wasm ./contracts/factory_contract/target/wasm32-unknown-unknown/release/factory_contract.wasm \
    --source $IDENTITY \
    --network $NETWORK | grep "Contract installed with hash" | awk '{print $NF}')

echo "Factory WASM hash: $FACTORY_WASM_HASH"

echo "Deploying factory contract..."
FACTORY_ID=$(stellar contract deploy \
    --wasm-hash $FACTORY_WASM_HASH \
    --source $IDENTITY \
    --network $NETWORK | grep "Contract deployed with ID" | awk '{print $NF}')

echo "Factory contract ID: $FACTORY_ID"
echo $FACTORY_ID > .stellar-crowdfunding/factory_id

echo "Initializing factory contract..."
stellar contract invoke \
    --id $FACTORY_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    initialize \
    --admin $ADMIN_ADDRESS

echo "Setting project WASM hash in factory contract..."
stellar contract invoke \
    --id $FACTORY_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    set_project_wasm_hash \
    --admin $ADMIN_ADDRESS \
    --wasm_hash $PROJECT_WASM_HASH

echo "Deployment complete!"
echo "Factory contract ID: $FACTORY_ID"
echo "Project WASM hash: $PROJECT_WASM_HASH"
echo "Use create-project.sh to create a new project" 