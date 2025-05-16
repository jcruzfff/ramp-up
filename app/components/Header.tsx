"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, WalletIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/app/lib/utils"
import { useAuth } from '@/app/hooks/useAuth'
import UserMenu from './UserMenu'
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
  const router = useRouter()

  const handleNotification = () => {
    setNotifications(0)
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

  // Original header with PasskeyKit auth
  if (variant === "default") {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo - links to home */}
            <Link href="/home" className="text-lg sm:text-xl font-bold text-blue-600">
              Stellar Swipe
            </Link>
            
            {/* User Menu with slide panel */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={handleNotification}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>
            
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
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
          <Button variant="ghost" size="icon" onClick={handleNotification} className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </Button>

          {balance !== undefined && (
            <Button variant="outline" size="sm" className="h-9 px-2">
              <WalletIcon className="h-4 w-4 mr-1" />
              <span>${balance.toFixed(2)}</span>
            </Button>
          )}

          {/* User Menu */}
          <UserMenu />
        </div>
      )}
    </header>
  )
}

// For backward compatibility
export default Header;  