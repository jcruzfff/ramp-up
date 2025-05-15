"use client"

import { Button } from "@/app/components/ui/button"
import { cn } from "@/app/lib/utils"
import { motion } from "framer-motion"

interface AnimatedButtonProps {
  children?: React.ReactNode
  icon?: React.ReactNode
  activeIcon?: React.ReactNode
  onClick?: () => void
  onClickAction?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  activeClassName?: string
  disabled?: boolean
  isActive?: boolean
}

export function AnimatedButton({
  children,
  icon,
  activeIcon,
  onClick,
  onClickAction,
  variant = "default",
  size = "icon", 
  className,
  activeClassName,
  disabled = false,
  isActive = false,
}: AnimatedButtonProps) {
  const handlePress = () => {
    if (onClick) {
      onClick();
    } else if (onClickAction) {
      onClickAction();
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handlePress}
        disabled={disabled}
        className={cn(className, isActive && activeClassName)}
      >
        {children || (isActive && activeIcon ? activeIcon : icon)}
      </Button>
    </motion.div>
  )
}
