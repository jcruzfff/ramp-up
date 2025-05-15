"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface AnimatedIconProps {
  icon: LucideIcon
  isActive: boolean
  activeColor?: string
  size?: number
}

export function AnimatedIcon({ icon: Icon, isActive, activeColor = "#3B82F6", size = 24 }: AnimatedIconProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ scale: isActive ? 1.1 : 1 }}
      className="relative flex items-center justify-center w-8 h-8"
    >
      <Icon className={`h-${size === 24 ? 6 : size / 4} w-${size === 24 ? 6 : size / 4} ${isActive ? `text-[${activeColor}]` : "text-slate-500"}`} />
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"
          style={{ backgroundColor: activeColor }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        /> 
      )}
    </motion.div>
  )
}
