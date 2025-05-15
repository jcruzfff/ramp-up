"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type EmojiType = "🎉" | "❤️" | "⚡" | "👎" | "✨" | "🔥" | "success" | "skip" | string

interface EmojiAnimationProps {
  type: EmojiType
  show: boolean
  count?: number
  duration?: number
  onComplete?: () => void
}

export function EmojiAnimation({ type, show, count = 10, duration = 1500, onComplete }: EmojiAnimationProps) {
  const [emojis, setEmojis] = useState<Array<{ id: number; x: number; y: number; rotate: number; scale: number }>>([])
  const [isVisible, setIsVisible] = useState(false)

  // Map emoji types to actual emojis
  const getEmojiCharacter = (type: EmojiType): string => {
    switch (type) {
      case "success":
        return "❤️"
      case "skip":
        return "👎"
      default:
        return type
    }
  }
 
  // Start animation when show changes to true
  useEffect(() => {
    if (show) {
      // Create random positions for emojis
      const newEmojis = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 300 - 150, // Random X position between -150 and 150
        y: -(Math.random() * 300 + 100), // Random Y position (upward direction)
        rotate: Math.random() * 360, // Random rotation
        scale: Math.random() * 0.5 + 0.8, // Random size between 0.8 and 1.3
      }))

      setEmojis(newEmojis)
      setIsVisible(true)

      // Set a timeout to hide the animation after duration
      const timeout = setTimeout(() => {
        setIsVisible(false)
        if (onComplete) {
          onComplete()
        }
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [show, count, duration, onComplete])

  if (!isVisible) return null

  const emojiCharacter = getEmojiCharacter(type)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50" style={{ overflow: "hidden" }}>
        {emojis.map((emoji) => (
          <motion.div
            key={emoji.id}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: emoji.x,
              y: emoji.y,
              scale: emoji.scale,
              rotate: emoji.rotate,
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut",
              times: [0, 0.1, 0.8, 1],
            }}
            className="absolute top-1/2 left-1/2 text-2xl"
          >
            {emojiCharacter}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  )
}
