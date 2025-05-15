This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Stellar Swipe

A social crowdfunding platform built on the Stellar blockchain, with a mobile-first, swipe-to-fund UX.

## Features

- **Privy Authentication**: Simple and secure wallet-based authentication
- **Swipe to Donate**: Tinder-like UX for discovering and funding projects
- **Stellar Integration**: All transactions handled on the Stellar blockchain
- **Community Features**: Social components like leaderboards, impact sharing, and friend connections

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the environment variables file and fill in your values:

```bash
cp env-example.txt .env.local
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Integration Plan for New Components

The project has recently incorporated a set of mobile-first UI components and pages. Here's the integration strategy:

### Navigation Structure

- **Root Level**: Redirect to `/home`
- **Main Pages**:
  - `/home`: Swipe-to-fund discovery interface
  - `/social`: Leaderboards, friends, and social impact
  - `/create`: Project creation flow
  - `/profile`: User profile
  - `/dashboard`: Wallet and transactions overview

### Component Integration

1. **Core Navigation**:

   - Header component for page titles
   - BottomNav component for mobile navigation
   - Each main page manages its own navigation components

2. **UI Component Usage**:

   - Use shadcn/ui components for consistency
   - Follow existing styling patterns
   - Maintain responsive design principles

3. **Data Flow**:
   - Transaction handling via BatchTransactionProvider
   - Authentication via PrivyProvider
   - Wallet management consistent across components

### Application Structure

```
app/
├── components/     # Shared UI components
├── home/           # Home/discovery page
├── social/         # Social features
├── create/         # Project creation
├── profile/        # User profile
│   └── settings/   # User settings subpages
├── dashboard/      # User dashboard
│   └── wallet/     # Wallet management
├── hooks/          # Custom React hooks
├── api/            # API routes
└── providers/      # Context providers
```

### Implementation Priority

1. Bottom navigation integration
2. Home page functionality
3. Profile and settings
4. Social features
5. Creation flow
