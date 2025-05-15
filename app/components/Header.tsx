"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, WalletIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/app/lib/utils"
import { useAuth } from '@/app/hooks/useAuth'
import LoginButton from './auth/LoginButton'
import LogoutButton from './auth/LogoutButton'
import UserProfile from './auth/UserProfile'
import { useRouter } from "next/navigation"

interface HeaderProps {
  title?: string
  showBack?: boolean
  showTitle?: boolean
  showActions?: boolean
  backUrl?: string
  onBack?: () => void
  onClickBack?: () => void
  balance?: number
  className?: string
  variant?: "default" | "mobile" // Add variant prop to switch between header styles
}

export function Header({
  title,
  showBack = false,
  showTitle = true,
  showActions = true,
  backUrl,
  onBack,
  onClickBack,
  balance,
  className,
  variant = "default", // Default to original header
}: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(3)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleNotification = () => {
    setNotifications(0)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (onClickBack) {
      onClickBack()
    } else if (backUrl) {
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  // Original header with Privy auth
  if (variant === "default") {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-lg sm:text-xl font-bold text-blue-600">
                Stellar Swipe
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex ml-10 space-x-4">
                <Link href="/home" className="text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/projects" className="text-gray-500 hover:text-gray-900">
                  Projects
                </Link>
                {isAuthenticated && (
                  <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              {/* Auth Button */}
              <div className="hidden sm:block">
                {isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <LoginButton />
                )}
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden ml-2 p-2"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <svg 
                  className="w-6 h-6 text-gray-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-3 py-3 border-t border-gray-200">
              <nav className="flex flex-col space-y-3">
                <Link href="/home" className="text-gray-500 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/projects" className="text-gray-500 hover:text-gray-900">
                  Projects
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                      Dashboard
                    </Link>
                  </>
                )}
                
                {/* Mobile Auth */}
                <div className="pt-3 border-t border-gray-100">
                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3">
                      <UserProfile />
                      <LogoutButton className="mt-2" />
                    </div>
                  ) : (
                    <LoginButton className="w-full" />
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    )
  }

  // New mobile header for the new UI components
  return (
    <header
      className={cn(
        "sticky top-0 z-10 w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-center">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {showTitle && <h1 className="text-lg font-semibold">{title || "Stellar Swipe"}</h1>}
      </div>

      {showActions && (
        <div className="flex items-center space-x-2">
          <Link href="/profile" className="relative">
            <Button variant="ghost" size="icon" onClick={handleNotification}>
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
          </Link>

          {balance !== undefined && (
            <Link href="/profile">
              <Button variant="outline" size="sm" className="h-9 px-2">
                <WalletIcon className="h-4 w-4 mr-1" />
                <span>${balance.toFixed(2)}</span>
              </Button>
            </Link>
          )}

          {/* Add authentication buttons */}
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <LoginButton />
          )}
        </div>
      )}
    </header>
  )
}

// For backward compatibility
export default Header;  