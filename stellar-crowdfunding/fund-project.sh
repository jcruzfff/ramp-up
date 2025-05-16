#!/bin/bash
set -e

# Check if all required parameters are provided
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <project_id> <amount> <token_id> [identity]"
    echo "Example: $0 CDAIUFS7IKLGIXIHJWZ2KJ3KL2MHXIJKLDJKL2M3 1000 CDAXXDKSSXOFMWEOIWOEINSMXNL3M2WOENSM admin"
    exit 1
fi

PROJECT_ID="$1"
AMOUNT="$2"
TOKEN_ID="$3"
IDENTITY="${4:-admin}"
NETWORK=testnet

echo "Funding project with the following details:"
echo "Project ID: $PROJECT_ID"
echo "Amount: $AMOUNT"
echo "Token ID: $TOKEN_ID"
echo "Using identity: $IDENTITY"
echo "Funder address: $(stellar keys address $IDENTITY)"

# First, set the token for the project if not already set
echo "Setting token for project..."
stellar contract invoke \
    --id $PROJECT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    set_token \
    --token_id $TOKEN_ID || echo "Token might already be set, continuing..."

# Fund the project
echo "Funding project..."
stellar contract invoke \
    --id $PROJECT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    fund \
    --from $(stellar keys address $IDENTITY) \
    --amount $AMOUNT

echo "Project funded successfully!"
echo "To check funding total:"
echo "stellar contract invoke --id $PROJECT_ID --network $NETWORK -- get_total_funded"
echo "To check your contribution:"
echo "stellar contract invoke --id $PROJECT_ID --network $NETWORK -- get_contribution --funder $(stellar keys address $IDENTITY)" 