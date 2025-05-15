"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Flame } from "lucide-react"

interface ComboIndicatorProps {
  count: number
  show: boolean
  onComplete?: () => void
}

export function ComboIndicator({ count, show, onComplete }: ComboIndicatorProps) {
  if (!show || count < 2) return null

  let message = ""
  let color = ""

  // Determine message and color based on combo count
  if (count >= 10) {
    message = "LEGENDARY!"
    color = "text-red-500"
  } else if (count >= 7) {
    message = "AMAZING!"
    color = "text-orange-500"
  } else if (count >= 5) {
    message = "GREAT!"
    color = "text-yellow-500"
  } else if (count >= 3) { 
    message = "NICE!"
    color = "text-blue-500"
  } else {
    message = "COMBO!"
    color = "text-blue-400"
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`text-center flex flex-col items-center ${color}`}
            initial={{ scale: 0.5, y: 20 }}
            animate={{ scale: 1.2, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              duration: 1.5,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-8 h-8" />
              <span className="text-4xl font-bold">{count}x</span>
              <Flame className="w-8 h-8" />
            </div>
            <motion.p
              className="text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
