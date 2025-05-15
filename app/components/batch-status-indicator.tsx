"use client"

import { Loader2, Check, X, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BatchStatusIndicatorProps {
  status: "pending" | "processing" | "success" | "error"
  count: number
  onClose?: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function BatchStatusIndicator({
  status,
  count,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
}: BatchStatusIndicatorProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoClose && (status === "success" || status === "error")) {
      const timer = setTimeout(() => {
        setVisible(false) 
        if (onClose) onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [status, autoClose, autoCloseDelay, onClose])

  const statusConfig = {
    pending: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      message: "Preparing donation batch...",
      bg: "bg-blue-100",
      border: "border-blue-300",
      textColor: "text-blue-800",
    },
    processing: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      message: `Processing ${count} donation${count !== 1 ? "s" : ""}...`,
      bg: "bg-blue-100",
      border: "border-blue-300",
      textColor: "text-blue-800",
    },
    success: {
      icon: <Check className="h-4 w-4" />,
      message: `${count} donation${count !== 1 ? "s" : ""} processed successfully`,
      bg: "bg-green-100",
      border: "border-green-300",
      textColor: "text-green-800",
    },
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      message: "Error processing donations",
      bg: "bg-red-100",
      border: "border-red-300",
      textColor: "text-red-800",
    },
  }

  const config = statusConfig[status]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 inset-x-0 px-4 pb-4 pointer-events-none flex justify-center z-50"
        >
          <div
            className={`rounded-full px-4 py-2 ${config.bg} ${config.border} ${config.textColor} shadow-md flex items-center justify-between max-w-md w-full pointer-events-auto`}
          >
            <div className="flex items-center space-x-2">
              {config.icon}
              <span className="text-sm font-medium">{config.message}</span>
            </div>
            {(status === "success" || status === "error") && (
              <button
                onClick={() => {
                  setVisible(false)
                  if (onClose) onClose()
                }}
                className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
