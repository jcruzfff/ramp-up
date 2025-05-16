"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProjectCardV2 } from "@/app/components/project-card-v2"
import { Button } from "@/app/components/ui/button"
import { RotateCcw, Zap } from "lucide-react"
import { simulateHapticFeedback } from "@/app/lib/utils"

// Define a proper type for the project object
type Project = {
  id: number
  title: string
  category: string
  description: string
  image: string
  website?: string
  websiteUrl?: string
  fundingGoal: number
  currentFunding: number
  sponsored?: boolean
  sponsorBoosted?: boolean
  trustScore?: number
  donorCount?: number
  daysLeft?: number
  communityTags?: Array<{
    id: number
    text: string
    color: string
    count: number
  }>
}

interface SwipeCardStackV2Props {
  projects: Array<Project>
  onDonateAction: () => void
  onSuperDonateAction?: () => void
  onShowCommunityNotesAction: (project: Project) => void
  donationAmount: number
}

export function SwipeCardStackV2({
  projects,
  onDonateAction,
  onSuperDonateAction,
  onShowCommunityNotesAction,
  donationAmount,
}: SwipeCardStackV2Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [doubleTapDetected, setDoubleTapDetected] = useState(false)

  // Refs for tracking drag state
  const cardRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const currentX = useRef<number>(0)
  const currentRotation = useRef<number>(0)
  const isScrolling = useRef<boolean>(false)
  const animationFrameId = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentProject = projects[currentIndex % projects.length]
  const nextProject = projects[(currentIndex + 1) % projects.length]

  // Default threshold for server-side rendering
  const [swipeThreshold, setSwipeThreshold] = useState(150)

  // Calculate threshold based on screen width (25% of screen width)
  const getSwipeThreshold = useCallback(() => {
    return Math.max(swipeThreshold, 150)
  }, [swipeThreshold])

  // Set swipe threshold based on window width - client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSwipeThreshold(window.innerWidth * 0.25)
      
      // Add resize listener
      const handleResize = () => {
        setSwipeThreshold(window.innerWidth * 0.25)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Reset expanded state when changing cards
  useEffect(() => {
    setIsExpanded(false)
  }, [currentIndex])

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  // Spring animation for returning to center
  const springToCenter = useCallback(() => {
    if (!cardRef.current) return

    const springStrength = 0.15 // Lower = more gentle return
    const friction = 0.85 // Higher = less oscillation

    const animate = () => {
      // Apply spring physics
      const dx = 0 - currentX.current
      const vx = dx * springStrength

      currentX.current += vx
      currentRotation.current = currentX.current * 0.05

      // Apply friction
      currentX.current *= friction

      // Update position
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${currentX.current}px) rotate(${currentRotation.current}deg)`
      }

      // Stop animation when close enough to center
      if (Math.abs(currentX.current) < 0.5) {
        currentX.current = 0
        currentRotation.current = 0
        if (cardRef.current) {
          cardRef.current.style.transform = `translateX(0) rotate(0deg)`
        }
        animationFrameId.current = null
        return
      }

      animationFrameId.current = requestAnimationFrame(animate)
    }

    // Start animation
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    animationFrameId.current = requestAnimationFrame(animate)
  }, [])

  // Handle animation completion
  const handleAnimationComplete = () => {
    setIsAnimating(false)
    setSwipeDirection(null)

    // Reset transform
    if (cardRef.current) {
      cardRef.current.style.transition = "none"
      cardRef.current.style.transform = "translateX(0) rotate(0deg)"
    }

    currentX.current = 0
    currentRotation.current = 0
  }

  // Handle swipeLeft but don't display the button
  const handleSwipeLeft = useCallback(() => {
    if (isAnimating || isExpanded) return
    setIsAnimating(true)
    setPreviousIndex(currentIndex)
    setSwipeDirection("left")

    simulateHapticFeedback()

    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.3s ease"
      cardRef.current.style.transform = `translateX(-${swipeThreshold * 4}px) rotate(-15deg)`
    }

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length)
      handleAnimationComplete()
    }, 300)
  }, [isAnimating, isExpanded, currentIndex, swipeThreshold, projects.length])

  const handleSwipeRight = useCallback(() => {
    if (isAnimating || isExpanded) return
    setIsAnimating(true)
    setPreviousIndex(currentIndex)
    setSwipeDirection("right")

    simulateHapticFeedback()

    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.3s ease"
      cardRef.current.style.transform = `translateX(${swipeThreshold * 4}px) rotate(15deg)`
    }

    onDonateAction()

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length)
      handleAnimationComplete()
    }, 300)
  }, [isAnimating, isExpanded, currentIndex, swipeThreshold, onDonateAction, projects.length])

  const handleSuperDonate = useCallback(() => {
    if (isAnimating || isExpanded) return

    setDoubleTapDetected(true)
    simulateHapticFeedback()

    // Trigger super donate animation
    if (onSuperDonateAction) {
      onSuperDonateAction()
    } else {
      onDonateAction() // Fallback to regular donate
    }

    // Reset after animation
    setTimeout(() => {
      setDoubleTapDetected(false)
    }, 1000)
  }, [isAnimating, isExpanded, onDonateAction, onSuperDonateAction])

  const handleUndo = () => {
    if (previousIndex !== null) {
      setCurrentIndex(previousIndex)
      setPreviousIndex(null)
    }
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle when mouse leaves the container
  const handleMouseLeave = () => {
    if (isDragging) {
      // Simulate mouse up to end the drag
      handleMouseUp()
    }
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || isExpanded) return

    // Cancel any ongoing animation
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    startX.current = e.clientX
    startY.current = e.clientY
    setIsDragging(true)
    isScrolling.current = false

    // Remove any transition
    if (cardRef.current) {
      cardRef.current.style.transition = "none"
    }

    // Check for double click
    const now = Date.now()
    if (now - lastTapTime < 300) {
      handleSuperDonate()
    } else {
      setLastTapTime(now)
    }

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!startX.current || !startY.current || isAnimating || isExpanded) return

    const deltaX = e.clientX - startX.current
    const deltaY = e.clientY - startY.current

    // Detect if this is a scroll gesture
    if (!isScrolling.current && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      isScrolling.current = true
      return
    }

    if (isScrolling.current) return

    // Calculate rotation (decreases as card moves further)
    const screenWidth = swipeThreshold * 4
    const rotationFactor = 0.15 * (1 - Math.min(Math.abs(deltaX) / (screenWidth * 0.5), 0.8))
    const rotation = deltaX * rotationFactor

    // Update refs
    currentX.current = deltaX
    currentRotation.current = rotation

    // Apply transform directly
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`
    }
  }

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)

    setIsDragging(false)

    if (isScrolling.current || !startX.current || isAnimating || isExpanded) {
      startX.current = null
      startY.current = null
      return
    }

    const threshold = getSwipeThreshold()

    if (currentX.current > threshold) {
      handleSwipeRight()
    } else if (currentX.current < -threshold) {
      handleSwipeLeft()
    } else {
      // Return to center with spring animation
      springToCenter()
    }

    startX.current = null
    startY.current = null
  }

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating || isExpanded) return

    // Cancel any ongoing animation
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }

    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    setIsDragging(true)
    isScrolling.current = false

    // Remove any transition
    if (cardRef.current) {
      cardRef.current.style.transition = "none"
    }

    // Check for double tap
    const now = Date.now()
    if (now - lastTapTime < 300) {
      handleSuperDonate()
    }
    setLastTapTime(now)
  }, [isAnimating, isExpanded, lastTapTime, handleSuperDonate]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!startX.current || !startY.current || isAnimating || isExpanded) return

    const deltaX = e.touches[0].clientX - startX.current
    const deltaY = e.touches[0].clientY - startY.current

    // Detect if this is a scroll gesture
    if (!isScrolling.current && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      isScrolling.current = true
      return
    }

    // Only prevent default if we're not scrolling vertically
    if (isScrolling.current) return

    // We're doing a horizontal swipe, prevent page scrolling
    e.preventDefault()

    // Calculate rotation (decreases as card moves further)
    const screenWidth = swipeThreshold * 4
    const rotationFactor = 0.15 * (1 - Math.min(Math.abs(deltaX) / (screenWidth * 0.5), 0.8))
    const rotation = deltaX * rotationFactor

    // Update refs
    currentX.current = deltaX
    currentRotation.current = rotation

    // Apply transform directly
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`
    }
  }, [isAnimating, isExpanded, swipeThreshold]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)

    if (isScrolling.current || !startX.current || isAnimating || isExpanded) {
      startX.current = null
      startY.current = null
      return
    }

    const threshold = getSwipeThreshold()

    if (currentX.current > threshold) {
      handleSwipeRight()
    } else if (currentX.current < -threshold) {
      handleSwipeLeft()
    } else {
      // Return to center with spring animation
      springToCenter()
    }

    startX.current = null
    startY.current = null
  }, [isAnimating, isExpanded, getSwipeThreshold, handleSwipeRight, handleSwipeLeft, springToCenter]);

  // Add keyboard navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handleSwipeLeft()
      } else if (e.key === "ArrowRight") {
        handleSwipeRight()
      } else if (e.key === "ArrowDown" && !isExpanded) {
        setIsExpanded(true)
      } else if (e.key === "ArrowUp" && isExpanded) {
        setIsExpanded(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentIndex, isAnimating, isExpanded, handleSwipeLeft, handleSwipeRight])

  // Add touch event listeners with passive: false
  useEffect(() => {
    if (typeof window === 'undefined' || !cardRef.current) return;
    
    const element = cardRef.current;
    
    // Add event listeners with { passive: false } to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart as unknown as EventListener, { passive: true });
    element.addEventListener('touchmove', handleTouchMove as unknown as EventListener, { passive: false });
    element.addEventListener('touchend', handleTouchEnd as unknown as EventListener);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart as unknown as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as unknown as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as unknown as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isAnimating, isExpanded]);

  // Prevent default behavior for drag events on images
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preventDragDefault = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    const images = document.querySelectorAll("img")
    images.forEach((img) => {
      img.addEventListener("dragstart", preventDragDefault)
    })

    return () => {
      images.forEach((img) => {
        img.removeEventListener("dragstart", preventDragDefault)
      })
    }
  }, [currentIndex])

  // Visual indicators for swipe threshold
  const threshold = getSwipeThreshold()
  const showLeftIndicator = currentX.current < -threshold * 0.7
  const showRightIndicator = currentX.current > threshold * 0.7

  return (
    <div ref={containerRef} className="relative h-[500px] w-full" onMouseLeave={handleMouseLeave}>
      {/* Next card (peeking from underneath) */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        <ProjectCardV2 project={nextProject} mode="swipe" isNext={true} donationAmount={donationAmount} />
      </div>

      {/* Current card */}
      <div
        ref={cardRef}
        className={`absolute inset-0 select-none ${isExpanded ? "expanded-card" : ""}`}
        style={{ zIndex: 10 }}
        onMouseDown={handleMouseDown}
      >
        <ProjectCardV2
          project={currentProject}
          mode="swipe"
          onSwipeRight={handleSwipeRight}
          onShowCommunityNotes={() => onShowCommunityNotesAction(currentProject)}
          showOverlay={!!swipeDirection}
          overlayDirection={swipeDirection}
          donationAmount={donationAmount}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
        />
      </div>

      {/* Super donate animation */}
      <AnimatePresence>
        {doubleTapDetected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          >
            <div className="bg-amber-500 text-white rounded-full p-4 flex items-center gap-2">
              <Zap className="h-6 w-6" />
              <span className="text-lg font-bold">Super Donate!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Threshold indicators (subtle visual cues) */}
      {isDragging && !isExpanded && (
        <>
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 bg-red-500 transition-opacity duration-200 ${showLeftIndicator ? "opacity-70" : "opacity-0"}`}
            style={{ left: -threshold, zIndex: 20 }}
          />
          <div
            className={`absolute right-0 top-0 bottom-0 w-1 bg-green-500 transition-opacity duration-200 ${showRightIndicator ? "opacity-70" : "opacity-0"}`}
            style={{ right: -threshold, zIndex: 20 }}
          />
        </>
      )}

      {previousIndex !== null && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 rounded-full px-4 z-20"
          onClick={handleUndo}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Undo</span>
        </Button>
      )}

      {!isDragging && !isExpanded && !isAnimating && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 swipe-hint">
          Swipe right to donate →
        </div>
      )}
    </div>
  )
}
