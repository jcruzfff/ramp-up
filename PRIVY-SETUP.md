# Privy Authentication Setup

This document explains how to set up Privy authentication for the Stellar Swipe application.

## Getting Your Privy App ID

1. Sign up or log in to your Privy account at [https://console.privy.io/](https://console.privy.io/)
2. Create a new app or select your existing app
3. Navigate to the "App Settings" section
4. Copy your App ID

## Setting Up Environment Variables

1. Create a file named `.env.local` in the root directory of the project
2. Add the following line to the file, replacing `your-privy-app-id-here` with your actual Privy App ID:

   ```
   NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
   ```

3. Save the file
4. Restart your development server if it's already running

## Verifying the Setup

1. Start your development server with `npm run dev`
2. Navigate to your application in the browser
3. The Privy authentication should now be working correctly
4. You should be able to sign in using the configured methods (email, wallet, Twitter, Farcaster)

## Troubleshooting

If you encounter any issues:

1. Check that your `.env.local` file is correctly formatted and contains the right App ID
2. Ensure the App ID is valid and active in your Privy dashboard
3. Check the browser console for any error messages
4. Make sure you've restarted your development server after making changes to environment variables

## Additional Configuration

You can customize the Privy integration by modifying the `PrivyProvider.tsx` file:

- Change the appearance settings under `config.appearance`
- Update the login methods under `config.loginMethods`
- Modify wallet creation behavior under `config.embeddedWallets`

For more information, refer to the [Privy documentation](https://docs.privy.io/).
