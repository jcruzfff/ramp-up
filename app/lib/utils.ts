import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with the specified symbol
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  if (isNaN(value)) return `0 ${currency}`;
  
  // Special handling for cryptocurrencies which don't have standard formatters
  if (currency === 'XLM') {
    // Format with up to 7 decimal places for XLM, but trim trailing zeros
    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7
    });
    return `${formatted} XLM`;
  }
  
  // Use standard currency formatter for USD and other fiat currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // Fallback if currency code is invalid
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Truncate a Stellar address for display
 * @param address The full Stellar address
 * @param prefixLength Number of characters to keep at the beginning
 * @param suffixLength Number of characters to keep at the end
 * @returns Truncated address with ellipsis
 */
export function truncateAddress(address: string, prefixLength = 6, suffixLength = 6): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * Get the URL for a Stellar account on a block explorer
 * @param address The Stellar account address
 * @returns URL to the account on the explorer
 */
export function getStellarAccountExplorerUrl(address: string): string {
  if (!address) return '';
  
  const network = 'testnet'; // Using testnet by default for our application
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

/**
 * Get user settings from local storage or defaults if not available
 * @returns User settings object with currency, language, and region
 */
export function getUserSettings(): { currency: string; language: string; region: string } {
  // Default settings
  const defaults = {
    currency: 'USD',
    language: 'en',
    region: 'US'
  };
  
  if (typeof window === 'undefined') {
    return defaults;
  }
  
  try {
    const storedSettings = localStorage.getItem('user-settings');
    if (storedSettings) {
      return { ...defaults, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error('Error reading user settings from localStorage:', error);
  }
  
  return defaults;
}

/**
 * Determine the trust level of a project based on various factors
 * @param project The project object with community tags and other data
 * @returns Object with trust level and corresponding CSS class
 */
export function getTrustLevel(project: { 
  communityTags?: Array<{ text: string; count: number }>; 
  trustScore?: number;
  donorCount?: number;
}): { level: 'high' | 'medium' | 'low'; className: string } {
  // Default to medium trust if no data is available
  if (!project) {
    return { level: 'medium', className: 'border-slate-200' };
  }
  
  // Check if project has a trustScore directly
  if (project.trustScore !== undefined) {
    if (project.trustScore >= 80) {
      return { level: 'high', className: 'border-green-300' };
    } else if (project.trustScore >= 50) {
      return { level: 'medium', className: 'border-slate-200' };
    } else {
      return { level: 'low', className: 'border-red-300' };
    }
  }
  
  // Otherwise check community tags
  if (project.communityTags && project.communityTags.length > 0) {
    // Look for verified tags
    const verifiedTags = project.communityTags.filter(tag => 
      tag.text.includes('Verified') || tag.text.includes('Trusted')
    );
    
    // Look for warning tags
    const warningTags = project.communityTags.filter(tag => 
      tag.text.includes('Scam') || 
      tag.text.includes('Fake') || 
      tag.text.includes('Warning') ||
      tag.text.includes('Suspicious')
    );
    
    // Determine trust level based on tags
    if (verifiedTags.length > 0 && verifiedTags.reduce((sum, tag) => sum + tag.count, 0) > 3) {
      return { level: 'high', className: 'border-green-300' };
    } else if (warningTags.length > 0 && warningTags.reduce((sum, tag) => sum + tag.count, 0) > 2) {
      return { level: 'low', className: 'border-red-300' };
    }
  }
  
  // Check donor count as a proxy for trust
  if (project.donorCount && project.donorCount > 10) {
    return { level: 'high', className: 'border-green-300' };
  }
  
  // Default to medium trust
  return { level: 'medium', className: 'border-slate-200' };
}

/**
 * Simulates haptic feedback when available on the device
 */
export function simulateHapticFeedback() {
  // Check if the navigator.vibrate API is available
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    // Vibrate for 50ms for a short haptic feedback
    navigator.vibrate(50);
  }
  
  // No fallback needed for devices that don't support vibration
}

// Define default swipe donation amounts
export const swipeAmounts = [
  { value: 0.01, label: "$0.01" },
  { value: 0.05, label: "$0.05" },
  { value: 0.10, label: "$0.10" },
  { value: 0.25, label: "$0.25" }
]; 