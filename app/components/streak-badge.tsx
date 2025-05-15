"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  streak: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function StreakBadge({ streak, size = "md", showText = true, className }: StreakBadgeProps) {
  // Size classes for the badge
  const sizeClasses = {
    sm: "h-5 px-1.5 text-xs",
    md: "h-6 px-2 text-sm",
    lg: "h-7 px-2.5 text-base",
  }

  // Size for the flame icon
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  // Base classes
  const baseClasses = "flex items-center gap-1 rounded-full bg-amber-100 text-amber-600 font-medium"

  return (
    <div className={cn(baseClasses, sizeClasses[size], className)}>
      <Flame className={cn(iconSize[size], "text-amber-600")} /> 
      {showText && <span>{streak} day streak</span>}
    </div>
  )
}
