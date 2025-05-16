import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncates a blockchain address to a shorter format for display
 * Example: "C1234567890123456789012345678901234567890" -> "C123...7890"
 */
export function truncateAddress(address: string | null, prefixLength = 4, suffixLength = 4): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength + 3) return address;
  
  return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
}

/**
 * Get the Stellar explorer URL for an account based on the current network
 * @param address The Stellar account address
 * @returns URL to view the account in Stellar Explorer
 */
export function getStellarAccountExplorerUrl(address: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'PUBLIC' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

/**
 * Get the Stellar explorer URL for a transaction based on the current network
 * @param txHash The transaction hash/ID
 * @returns URL to view the transaction in Stellar Explorer
 */
export function getStellarTransactionExplorerUrl(txHash: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'PUBLIC' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

/**
 * Format Stellar balance for display
 * @param balance The balance amount as string
 * @param decimals Number of decimal places to display
 * @returns Formatted balance string
 */
export function formatStellarBalance(balance: string, decimals: number = 7): string {
  try {
    // Parse the balance as a float and fix to specified decimal places
    const formattedBalance = parseFloat(balance).toFixed(decimals);
    
    // Remove trailing zeros after the decimal point
    return formattedBalance.replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
}

// Theme colors
export const themeColors = {
  primary: "#3B82F6", // Blue 500
  secondary: "#1E40AF", // Blue 800
  accent: "#93C5FD", // Blue 200
  success: "#10B981", // Emerald 500
  warning: "#F59E0B", // Amber 500
  error: "#EF4444", // Red 500
  background: "#FFFFFF", // White
  text: "#1F2937", // Gray 800
}

// Get tag color based on tag text
export function getTagColor(tag: string) {
  const tagToColorMap: Record<string, { bg: string; text: string }> = {
    fake: { bg: "bg-red-100", text: "text-red-800" },
    spam: { bg: "bg-red-100", text: "text-red-800" },
    scam: { bg: "bg-red-100", text: "text-red-800" },
    verified: { bg: "bg-green-100", text: "text-green-800" },
    legitimate: { bg: "bg-green-100", text: "text-green-800" },
    trusted: { bg: "bg-green-100", text: "text-green-800" },
    impact: { bg: "bg-blue-100", text: "text-blue-800" },
    sustainable: { bg: "bg-blue-100", text: "text-blue-800" },
    environment: { bg: "bg-emerald-100", text: "text-emerald-800" },
    health: { bg: "bg-purple-100", text: "text-purple-800" },
    education: { bg: "bg-indigo-100", text: "text-indigo-800" },
    community: { bg: "bg-amber-100", text: "text-amber-800" },
    highimpact: { bg: "bg-blue-100", text: "text-blue-800" },
    unverified: { bg: "bg-yellow-100", text: "text-yellow-800" },
  }
  
  // Convert tag to lowercase and remove spaces for matching
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, "")
  
  // Check if the tag or part of it matches any key
  for (const key of Object.keys(tagToColorMap)) {
    if (normalizedTag.includes(key)) {
      return tagToColorMap[key]
    }
  }
  
  // Default color for unmatched tags
  return { bg: "bg-slate-100", text: "text-slate-800" }
}

// Define a proper type for community tags
interface CommunityTag {
  id: number;
  text: string;
  color?: string;
  count: number;
}

// Define a type for projects with community tags
interface ProjectWithTags {
  id?: string | number;
  title?: string;
  communityTags?: CommunityTag[];
  [key: string]: unknown; // Allow other properties
}

// Define a type for trust level result
interface TrustLevel {
  level: "low" | "medium" | "high" | "medium-low" | "medium-high";
  className: string;
}

// Get trust level based on tags and other factors
export function getTrustLevel(project: ProjectWithTags): TrustLevel {
  let level: "low" | "medium" | "high" | "medium-low" | "medium-high" = "medium";
  
  // If project has community tags
  if (project.communityTags && Array.isArray(project.communityTags)) {
    const negativeTags = project.communityTags.filter((tag: CommunityTag) => 
      ["fake", "spam", "scam"].includes(tag.text.toLowerCase())
    )
    
    const positiveTags = project.communityTags.filter((tag: CommunityTag) => 
      ["verified", "legitimate", "trusted"].includes(tag.text.toLowerCase())
    )
    
    // Calculate negative and positive scores
    const negativeScore = negativeTags.reduce((sum: number, tag: CommunityTag) => sum + tag.count, 0)
    const positiveScore = positiveTags.reduce((sum: number, tag: CommunityTag) => sum + tag.count, 0)
    
    if (negativeScore > 5) level = "low";
    else if (positiveScore > 5) level = "high";
    else if (negativeScore > positiveScore) level = "medium-low";
    else if (positiveScore > negativeScore) level = "medium-high";
  }
  
  // Map the level to appropriate class names
  const classNameMap: Record<typeof level, string> = {
    "low": "border-red-300",
    "medium-low": "border-yellow-300",
    "medium": "",
    "medium-high": "border-emerald-200",
    "high": "border-green-300"
  };
  
  return {
    level,
    className: classNameMap[level]
  };
}

// Mock data for projects
export const projects = [
  {
    id: "1",
    title: "Clean Ocean Initiative",
    description: "Removing plastic waste from oceans and coastal areas to protect marine life.",
    imageSrc: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG9jZWFufGVufDB8fDB8fHww",
    category: "Environment",
    tags: ["ocean", "plastic", "cleanup", "sustainability"],
    goalAmount: 15000,
    currentAmount: 8795,
    sponsorBoosted: true,
    location: "Global",
    impact: "Removed 250 tons of plastic in 2023",
  },
  {
    id: "2",
    title: "Solar for Schools",
    description: "Installing solar panels in underfunded schools to reduce energy costs and teach sustainability.",
    imageSrc: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c29sYXIlMjBwYW5lbHN8ZW58MHx8MHx8fDA%3D",
    category: "Education",
    tags: ["solar", "education", "renewable", "schools"],
    goalAmount: 25000,
    currentAmount: 12450,
    sponsorBoosted: false,
    location: "United States",
    impact: "Saved $15,000 in energy costs for 5 schools",
  },
  {
    id: "3",
    title: "Micro-loans for Women Entrepreneurs",
    description: "Providing micro-loans to women in developing countries to start small businesses.",
    imageSrc: "https://images.unsplash.com/photo-1664575198308-3959904fa430?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdvbWVuJTIwZW50cmVwcmVuZXVyc3xlbnwwfHwwfHx8MA%3D%3D",
    category: "Economic",
    tags: ["women", "entrepreneurship", "micro-loans", "development"],
    goalAmount: 50000,
    currentAmount: 31275,
    sponsorBoosted: true,
    location: "Multiple Countries",
    impact: "Supported 120 new businesses",
  },
  {
    id: "4",
    title: "Rainforest Conservation",
    description: "Protecting endangered rainforest land from deforestation and promoting sustainable practices.",
    imageSrc: "https://images.unsplash.com/photo-1537430802614-118bf14be50c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmFpbmZvcmVzdHxlbnwwfHwwfHx8MA%3D%3D",
    category: "Environment",
    tags: ["rainforest", "conservation", "biodiversity", "climate"],
    goalAmount: 75000,
    currentAmount: 42000,
    sponsorBoosted: false,
    location: "Brazil & Indonesia",
    impact: "Protected 5,000 acres of rainforest",
  },
  {
    id: "5",
    title: "Clean Water Wells",
    description: "Building wells to provide clean drinking water in communities without access.",
    imageSrc: "https://images.unsplash.com/photo-1542682437-eacc353cdbe9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2xlYW4lMjB3YXRlcnxlbnwwfHwwfHx8MA%3D%3D",
    category: "Health",
    tags: ["water", "sanitation", "health", "development"],
    goalAmount: 30000,
    currentAmount: 18750,
    sponsorBoosted: true,
    location: "Sub-Saharan Africa",
    impact: "Provided clean water to 15,000 people",
  },
];

// Mock data for leaderboard
export const leaderboardData = [
  {
    id: 1,
    name: "Alex Smith",
    avatar: "https://i.pravatar.cc/150?img=1",
    amount: 356.75,
    points: 1240,
    tags: 89,
    reputation: 450,
    isCurrentUser: false,
  },
  {
    id: 2,
    name: "Jordan Taylor",
    avatar: "https://i.pravatar.cc/150?img=2",
    amount: 285.50,
    points: 925,
    tags: 72,
    reputation: 380,
    isCurrentUser: true,
  },
  {
    id: 3,
    name: "Casey Johnson",
    avatar: "https://i.pravatar.cc/150?img=3",
    amount: 210.25,
    points: 730,
    tags: 58,
    reputation: 320,
    isCurrentUser: false,
  },
  {
    id: 4,
    name: "Riley Brown",
    avatar: "https://i.pravatar.cc/150?img=4",
    amount: 175.00,
    points: 590,
    tags: 45,
    reputation: 270,
    isCurrentUser: false,
  },
  {
    id: 5,
    name: "Morgan Lee",
    avatar: "https://i.pravatar.cc/150?img=5",
    amount: 122.50,
    points: 420,
    tags: 37,
    reputation: 220,
    isCurrentUser: false,
  },
];

// Mock data for friends
export const friendsData = [
  {
    id: 1,
    name: "Jamie Wilson",
    avatar: "https://i.pravatar.cc/150?img=6",
    points: 750,
    maxPoints: 1000,
    donations: 32,
    isFollowing: true,
  },
  {
    id: 2,
    name: "Taylor Swift",
    avatar: "https://i.pravatar.cc/150?img=7",
    points: 650,
    maxPoints: 1000,
    donations: 28,
    isFollowing: true,
  },
  {
    id: 3,
    name: "Dana Garcia",
    avatar: "https://i.pravatar.cc/150?img=8",
    points: 480,
    maxPoints: 1000,
    donations: 20,
    isFollowing: false,
  },
  {
    id: 4,
    name: "Chris Robinson",
    avatar: "https://i.pravatar.cc/150?img=9",
    points: 420,
    maxPoints: 1000,
    donations: 18,
    isFollowing: true,
  },
  {
    id: 5,
    name: "Sam Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=10",
    points: 380,
    maxPoints: 1000,
    donations: 16,
    isFollowing: false,
  },
];

// Helper function for haptic feedback simulation
export function simulateHapticFeedback() {
  // This would use a device API in a real app
  // Here we just log it for development purposes
  console.log("Haptic feedback triggered");
}

// Currency formatter
export function formatCurrency(amount: number, currency: string = "USD") {
  if (currency === "CENTS") {
    return `${amount.toFixed(2)}¢`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// User settings mock
export function getUserSettings() {
  return {
    currency: "CENTS",
    language: "en",
    region: "US",
    notifications: true,
    darkMode: false,
  };
}

// Mock data for user achievements
export const achievements = [
  {
    id: 1, 
    title: "First Donation",
    description: "Made your first donation to a project",
    icon: "🎉",
    unlocked: true,
    date: "2023-10-15"
  },
  {
    id: 2,
    title: "5 Day Streak",
    description: "Donated for 5 consecutive days",
    icon: "🔥",
    unlocked: true,
    date: "2023-10-20"
  },
  {
    id: 3,
    title: "Environmental Champion",
    description: "Donated to 5 environmental projects",
    icon: "🌱",
    unlocked: true,
    date: "2023-11-05"
  },
  {
    id: 4,
    title: "Social Butterfly",
    description: "Connected with 3 friends on the platform",
    icon: "🦋",
    unlocked: true,
    date: "2023-11-15"
  },
  {
    id: 5,
    title: "Rising Star",
    description: "Reached level 5",
    icon: "⭐",
    unlocked: false,
    date: null
  },
  {
    id: 6,
    title: "Generosity Award",
    description: "Donated over $100 in total",
    icon: "🏆",
    unlocked: false,
    date: null
  }
];

// Define available swipe amounts for settings
export const swipeAmounts = [
  { value: 0.01, label: "$0.01" },
  { value: 0.05, label: "$0.05" },
  { value: 0.10, label: "$0.10" },
  { value: 0.25, label: "$0.25" }
];

// Get user stats function
export function getUserStats() {
  // In a real app, this would fetch from an API or database
  return {
    totalDonated: 87.50,
    projectsSupported: 42,
    categoriesSupported: 5,
    streak: 7,
    level: 14,
    nextLevel: {
      level: 15,
      requiredPoints: 1500,
      currentPoints: 1350
    },
    badges: 12,
    reputation: 4.8
  };
} 