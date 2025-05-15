"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { EnhancedProjectCard } from "@/components/enhanced-project-card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { simulateHapticFeedback } from "@/lib/utils"

interface SwipeCardStackProps {
  projects: Array<{
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
  }>
  onDonateAction: () => void
}

export function SwipeCardStack({ projects, onDonateAction }: SwipeCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [lastTapTime, setLastTapTime] = useState(0)

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

  // Calculate threshold based on screen width (25% of screen width)
  const getSwipeThreshold = () => {
    return Math.max(window.innerWidth * 0.25, 150)
  }

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
  const springToCenter = () => {
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
  }

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

  // Wrap in useCallback to avoid re-creation on each render
  const handleSwipeLeft = useCallback(() => {
    if (isAnimating || isExpanded) return
    setIsAnimating(true)
    setPreviousIndex(currentIndex)
    setSwipeDirection("left")

    simulateHapticFeedback()

    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.3s ease"
      cardRef.current.style.transform = `translateX(-${window.innerWidth}px) rotate(-15deg)`
    }

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length)
      handleAnimationComplete()
    }, 300)
  }, [currentIndex, isAnimating, isExpanded, projects.length])

  // Wrap in useCallback to avoid re-creation on each render
  const handleSwipeRight = useCallback(() => {
    if (isAnimating || isExpanded) return
    setIsAnimating(true)
    setPreviousIndex(currentIndex)
    setSwipeDirection("right")

    simulateHapticFeedback()

    // Animate card off screen
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.3s ease"
      cardRef.current.style.transform = `translateX(${window.innerWidth}px) rotate(15deg)`
    }

    onDonateAction()

    setTimeout(() => {
      handleAnimationComplete()
    }, 300)
  }, [currentIndex, isAnimating, isExpanded, onDonateAction])

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
      handleToggleExpand()
    }
    setLastTapTime(now)

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!startX.current || !startY.current || isAnimating || isExpanded) return

    const deltaX = e.clientX - startX.current
    const deltaY = e.clientY - (startY.current ?? 0)

    // Detect if this is a scroll gesture
    if (!isScrolling.current && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      isScrolling.current = true
      return
    }

    if (isScrolling.current) return

    // Calculate rotation (decreases as card moves further)
    const screenWidth = window.innerWidth
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
  const handleTouchStart = (e: React.TouchEvent) => {
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
      handleToggleExpand()
    }
    setLastTapTime(now)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current || !startY.current || isAnimating || isExpanded) return

    const deltaX = e.touches[0].clientX - startX.current
    const deltaY = e.touches[0].clientY - (startY.current ?? 0)

    // Detect if this is a scroll gesture
    if (!isScrolling.current && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      isScrolling.current = true
      return
    }

    if (isScrolling.current) return

    // Prevent default to avoid page scrolling
    e.preventDefault()

    // Calculate rotation (decreases as card moves further)
    const screenWidth = window.innerWidth
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

  const handleTouchEnd = () => {
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

  // Add keyboard navigation
  useEffect(() => {
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
  }, [handleSwipeLeft, handleSwipeRight, isExpanded])

  // Visual indicators for swipe threshold
  const threshold = getSwipeThreshold()
  const showLeftIndicator = currentX.current < -threshold * 0.7
  const showRightIndicator = currentX.current > threshold * 0.7

  return (
    <div ref={containerRef} className="relative h-[500px] w-full" onMouseLeave={handleMouseLeave}>
      {/* Next card (peeking from underneath) */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        <EnhancedProjectCard 
          project={{
            id: nextProject.id,
            title: nextProject.title,
            description: nextProject.description,
            image: nextProject.image,
            fundingGoal: nextProject.fundingGoal,
            currentFunding: nextProject.currentFunding,
            category: nextProject.category,
            communityTags: nextProject.communityTags
          }}
          mode="swipe" 
          zIndex={5}
        />
      </div>

      {/* Current card */}
      <div
        ref={cardRef}
        className={`absolute inset-0 select-none ${isExpanded ? "expanded-card" : ""}`}
        style={{ zIndex: 10 }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <EnhancedProjectCard
          project={{
            id: currentProject.id,
            title: currentProject.title,
            description: currentProject.description,
            image: currentProject.image,
            fundingGoal: currentProject.fundingGoal,
            currentFunding: currentProject.currentFunding,
            category: currentProject.category,
            communityTags: currentProject.communityTags
          }}
          mode="swipe"
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onDonate={onDonateAction}
          showOverlay={!!swipeDirection}
          overlayDirection={swipeDirection}
          zIndex={10}
        />
      </div>

      {/* Threshold indicators (subtle visual cues) */}
      {isDragging && !isExpanded && (
        <>
          <div
            className={`absolute inset-0 pointer-events-none rounded-lg border-4 border-red-400 transition-opacity ${
              showLeftIndicator ? "opacity-70" : "opacity-0"
            }`}
            style={{ zIndex: 20 }}
          />
          <div
            className={`absolute inset-0 pointer-events-none rounded-lg border-4 border-green-400 transition-opacity ${
              showRightIndicator ? "opacity-70" : "opacity-0"
            }`}
            style={{ zIndex: 20 }}
          />
        </>
      )}

      {/* Undo button (only visible if there's a previous card) */}
      {previousIndex !== null && !isAnimating && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 bg-white shadow-md rounded-full z-30"
          onClick={handleUndo}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
