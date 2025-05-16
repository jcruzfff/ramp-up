# Stellar Crowdfunding Contracts

This project contains Soroban smart contracts for crowdfunding on the Stellar network. The contracts enable creators to start fundraising campaigns for projects, and allow backers to contribute funds to those projects.

## Contract Architecture

There are two main contracts:

1. **Factory Contract** (`factory_contract`):

   - Responsible for deploying and managing project contracts
   - Maintains a registry of all created projects
   - Provides admin functions for security and upgrades

2. **Project Contract** (`project_contract`):
   - Handles individual crowdfunding campaigns
   - Collects and tracks contributions
   - Manages the release of funds to project creators
   - Provides transparency and verification

## Key Features

- **Time-based Funding:** Projects have a deadline after which funds can be withdrawn by the creator
- **Token-based Contributions:** Uses Stellar tokens (e.g., USDC) for contributions
- **Transparent Tracking:** All contributions are recorded and queryable
- **Security:** Authorization checks to ensure only authorized parties can perform sensitive operations

## Prerequisites

- Rust and Cargo (latest stable)
- The WebAssembly target: `rustup target add wasm32-unknown-unknown`
- The Stellar CLI: Install via `brew install stellar-cli` on macOS or see [Stellar Documentation](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup) for other platforms

## Deployment and Usage

### Setup

To build the contracts:

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Deployment

1. **Deploy the Contracts:**

```bash
./deploy.sh [identity]
```

This script:

- Builds the contract code
- Installs the WASMs on the Stellar network
- Deploys the factory contract
- Initializes the factory contract
- Configures the factory to use the project contract WASM

### Creating a Project

To create a new project:

```bash
./create-project.sh "Project Title" "Project Description" "https://example.com/image.jpg" 30 [identity]
```

Where:

- The first three parameters are the project metadata
- `30` is the number of days until the funding deadline
- `[identity]` (optional) is the Stellar identity to use

### Funding a Project

To fund a project that has been created:

```bash
./fund-project.sh <project_id> <amount> <token_id> [identity]
```

Where:

- `project_id` is the contract ID of the project
- `amount` is the amount to contribute (in the smallest unit of the token)
- `token_id` is the contract ID of the token being used
- `[identity]` (optional) is the Stellar identity to use

### Withdrawing Funds

After a project's deadline has passed, the creator can withdraw collected funds:

```bash
./withdraw-funds.sh <project_id> [identity]
```

Where:

- `project_id` is the contract ID of the project
- `[identity]` (optional) is the Stellar identity to use (must be the project creator)

## Integration with Frontend

To integrate these contracts with a frontend application, you'll need to:

1. Generate TypeScript bindings for the contracts
2. Use the Stellar SDK to interact with the contracts
3. Connect to a user's Stellar wallet (with [Freighter](https://www.freighter.app/) or another provider)

## Development and Testing

For development and testing purposes, you can:

1. Use the Stellar Testnet (default in the scripts)
2. Generate test tokens using the Stellar Laboratory or SDK
3. Monitor transactions using Stellar Explorer or similar tools

## License

This project is licensed under the MIT License - see the LICENSE file for details.
