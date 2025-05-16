#!/bin/bash
set -e

# Check if all required parameters are provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <title> <description> <image_url> <days_until_deadline> [identity]"
    echo "Example: $0 \"My Project\" \"A great project\" \"https://example.com/image.jpg\" 30 admin"
    exit 1
fi

TITLE="$1"
DESCRIPTION="$2"
IMAGE_URL="$3"
DAYS="$4"
IDENTITY="${5:-admin}"
NETWORK=testnet

# Calculate deadline timestamp (current time + days in seconds)
DEADLINE=$(date -v +${DAYS}d +%s 2>/dev/null || date -d "+${DAYS} days" +%s)

# Check if factory_id file exists
if [ ! -f .stellar-crowdfunding/factory_id ]; then
    echo "Error: Factory contract ID not found. Run deploy.sh first."
    exit 1
fi

# Get the factory contract ID
FACTORY_ID=$(cat .stellar-crowdfunding/factory_id)

echo "Creating project with the following details:"
echo "Title: $TITLE"
echo "Description: $DESCRIPTION"
echo "Image URL: $IMAGE_URL"
echo "Deadline: $(date -r $DEADLINE 2>/dev/null || date -d "@$DEADLINE")"
echo "Using identity: $IDENTITY"
echo "Factory contract ID: $FACTORY_ID"

# Create the project using the factory contract
PROJECT_ID=$(stellar contract invoke \
    --id $FACTORY_ID \
    --source $IDENTITY \
    --network $NETWORK \
    -- \
    create_project \
    --creator $(stellar keys address $IDENTITY) \
    --title "$TITLE" \
    --description "$DESCRIPTION" \
    --image_url "$IMAGE_URL" \
    --deadline $DEADLINE | grep -o "address: [^ ]*" | awk '{print $2}')

echo "Project created successfully!"
echo "Project contract address: $PROJECT_ID"
echo $PROJECT_ID > .stellar-crowdfunding/last_project_id

echo "To check project details:"
echo "stellar contract invoke --id $PROJECT_ID --network $NETWORK -- get_project_data"

# Generate TypeScript bindings for the project contract
echo "Generating TypeScript bindings for project contract..."
mkdir -p ../app/src/contracts
stellar contract bindings typescript \
    --contract-id $PROJECT_ID \
    --output-dir ../app/src/contracts/project \
    --network $NETWORK \
    --overwrite

echo "You can contribute to this project with:"
echo "stellar contract invoke --id $PROJECT_ID --network $NETWORK --source <contributor_identity> -- contribute --token <token_address> --amount <amount>" 