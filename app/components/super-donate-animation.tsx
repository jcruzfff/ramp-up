"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface SuperDonateAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function SuperDonateAnimation({ show, onComplete }: SuperDonateAnimationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0], 
          }}
          transition={{ repeat: 2, duration: 0.5 }}
          className="bg-amber-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg"
        >
          <Zap className="h-6 w-6" />
          <span className="text-xl font-bold">Super Donate!</span>
          <Zap className="h-6 w-6" />
        </motion.div>

        {/* Particles */}
        <motion.div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              initial={{ x: 0, y: 0 }}
              animate={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: [1, 0],
                scale: [0, 1, 0],
              }}
              transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
            >
              <div
                className="h-3 w-3 bg-yellow-300 rounded-full"
                style={{ boxShadow: "0 0 10px rgba(255, 204, 0, 0.8)" }}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
