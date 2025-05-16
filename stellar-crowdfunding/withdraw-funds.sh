#!/bin/bash
set -e

# Check if all required parameters are provided
if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <project_id> [identity]"
    echo "Example: $0 CDAIUFS7IKLGIXIHJWZ2KJ3KL2MHXIJKLDJKL2M3 admin"
    exit 1
fi

PROJECT_ID="$1"
IDENTITY="${2:-admin}"
NETWORK=testnet

echo "Withdrawing funds from project:"
echo "Project ID: $PROJECT_ID"
echo "Using identity: $IDENTITY (must be the project creator)"
echo "Creator address: $(stellar keys address $IDENTITY)"

# Check project data to confirm deadline
echo "Checking project data..."
stellar contract invoke \
    --id $PROJECT_ID \
    --network $NETWORK \
    -- \
    get_project_data

# Check total funded amount
TOTAL_FUNDED=$(stellar contract invoke \
    --id $PROJECT_ID \
    --network $NETWORK \
    -- \
    get_total_funded | grep -o "[0-9]*")

echo "Total funded amount: $TOTAL_FUNDED"

# Confirm withdrawal
echo "Attempting to withdraw funds..."
stellar contract invoke \
    --id $PROJECT_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    withdraw

echo "Withdrawal attempted. If the deadline has not passed, this will have failed."
echo "Check the new total funded amount to verify success:"
echo "stellar contract invoke --id $PROJECT_ID --network $NETWORK -- get_total_funded" 