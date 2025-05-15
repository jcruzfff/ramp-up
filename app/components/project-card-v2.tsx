"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Flame, X, Heart, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Award } from "lucide-react"
import { getTrustLevel, formatCurrency, getUserSettings } from "@/app/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip"
import { Badge } from "@/app/components/ui/badge"

interface ProjectCardV2Props {
  project: {
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
  mode?: "swipe" | "list"
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDonate?: () => void
  onShowCommunityNotes?: () => void
  showOverlay?: boolean
  overlayDirection?: "left" | "right" | null
  isNext?: boolean
  donationAmount?: number
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export function ProjectCardV2({
  project,
  mode = "swipe",
  onSwipeLeft,
  onSwipeRight,
  onDonate,
  onShowCommunityNotes,
  showOverlay = false,
  overlayDirection = null,
  isNext = false,
  donationAmount = 0.01,
  isExpanded = false,
  onToggleExpand,
}: ProjectCardV2Props) {
  const [userSettings] = useState(getUserSettings())
  const trustLevel = getTrustLevel(project)
  const websiteUrl = project.websiteUrl || project.website
  const [isHovering, setIsHovering] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate percentage funded
  const percentFunded = Math.min(100, Math.round((project.currentFunding / project.fundingGoal) * 100))

  // Format donation amount
  const formattedDonation = formatCurrency(donationAmount, userSettings.currency)

  // Determine if project is urgent (less than 3 days left or over 80% funded)
  const isUrgent = (project.daysLeft !== undefined && project.daysLeft <= 3) || percentFunded >= 80

  // Prevent event propagation for buttons
  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation()
    if (callback) callback()
  }

  // If trust level is low, show warning
  if (trustLevel.level === "low" && mode === "swipe") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`relative ${isNext ? "z-0" : "z-10"}`}>
              <Card className="w-full overflow-hidden bento-bevel opacity-70 border-red-300">
                <div className="relative h-64 w-full flex items-center justify-center bg-slate-100">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold mb-2">Insufficient Trust</h3>
                    <p className="text-sm text-slate-600">
                      This project has been flagged by the community for potential concerns.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 px-4 py-2 bg-slate-200 rounded-full text-sm font-medium"
                      onClick={(e) => handleButtonClick(e, onShowCommunityNotes)}
                    >
                      View Community Notes
                    </motion.button>
                  </div>
                </div>
              </Card>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Community flagged concerns</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (mode === "list") {
    return (
      <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
        <Card className={`w-full mb-4 overflow-hidden ${trustLevel.className}`}>
          <div className="flex">
            <div className="relative h-24 w-24 flex-shrink-0">
              <Image
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                fill
                className="object-cover pointer-events-none"
              />
              {(project.sponsored || project.sponsorBoosted) && (
                <div className="absolute top-1 left-1 bg-amber-500 text-white p-1 rounded-full">
                  <Flame className="h-3 w-3" />
                </div>
              )}
              {isUrgent && (
                <div className="absolute bottom-1 left-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">
                  {project.daysLeft !== undefined && project.daysLeft <= 3
                    ? `${project.daysLeft}d left`
                    : `${percentFunded}% funded`}
                </div>
              )}
            </div>
            <CardContent className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold">{project.title}</h3>
                    {websiteUrl && (
                      <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                      {project.category}
                    </Badge>
                    {project.communityTags && project.communityTags.length > 0 && (
                      <Badge
                        variant={project.communityTags[0].text.includes("Verified") ? "success" : "outline"}
                        className="text-xs px-2 py-0 h-5"
                      >
                        {project.communityTags[0].text}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{project.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#22CC88] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"
                    onClick={(e) => handleButtonClick(e, onDonate)}
                  >
                    {formattedDonation}
                    <Heart className="h-3 w-3" />
                  </motion.button>
                  <span className="text-xs text-blue-500 font-medium">+5 pts</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{percentFunded}% funded</span>
                  {project.donorCount && <span>{project.donorCount} donors</span>}
                </div>
                <Progress value={percentFunded} max={100} className="h-1" />
              </div>
              <button
                onClick={(e) => handleButtonClick(e, onShowCommunityNotes)}
                className="flex items-center mt-2 text-xs text-slate-500"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Community Notes
              </button>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Swipe mode
  return (
    <div
      className={`relative ${isNext ? "z-0" : "z-10"}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div
        ref={cardRef}
        whileHover={!isExpanded ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Card className={`w-full overflow-hidden bento-bevel ${trustLevel.className} select-none`}>
          <div className={`relative ${isExpanded ? "h-48" : "h-64"} w-full transition-height duration-300`}>
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              fill
              priority
              className="object-cover pointer-events-none"
            />

            {/* Category Badge */}
            <div className="absolute top-2 right-2 bg-white/90 text-slate-800 px-2 py-1 rounded-full text-xs font-medium">
              {project.category}
            </div>

            {/* Sponsor Badge */}
            {(project.sponsored || project.sponsorBoosted) && (
              <div className="absolute top-2 left-2 bg-amber-500 text-white p-1 rounded-full flex items-center gap-1 px-2">
                <Flame className="h-3 w-3" />
                <span className="text-xs">Sponsored</span>
              </div>
            )}

            {/* Urgency Badge */}
            {isUrgent && (
              <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {project.daysLeft !== undefined && project.daysLeft <= 3 ? (
                  <span>{project.daysLeft} days left</span>
                ) : (
                  <span>{percentFunded}% funded</span>
                )}
              </div>
            )}

            {/* Community Notes Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-2 right-2 bg-white/90 text-slate-700 px-2 py-1 rounded-full text-xs flex items-center"
              onClick={(e) => handleButtonClick(e, onShowCommunityNotes)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Notes
            </motion.button>
          </div>

          <CardContent className={`p-6 ${isExpanded ? "pb-16" : ""}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Trust Badge */}
              {trustLevel.level === "high" && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>Verified</span>
                </Badge>
              )}
            </div>

            {/* Community Tags */}
            {project.communityTags && project.communityTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {project.communityTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={tag.text.includes("Verified") ? "success" : "outline"}
                    className="text-xs"
                  >
                    {tag.text}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <div className={`description-container ${isExpanded ? "expanded" : ""}`}>
              <p className={`text-sm text-slate-600 mb-4 ${isExpanded ? "" : "line-clamp-2"}`}>{project.description}</p>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funding goal: ${project.fundingGoal}</span>
                <span>${project.currentFunding} raised</span>
              </div>
              <Progress value={project.currentFunding} max={project.fundingGoal} />
              {project.donorCount && (
                <div className="text-xs text-slate-500 text-right">{project.donorCount} donors</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col mt-6">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded-md transition-colors"
                  onClick={(e) => handleButtonClick(e, onSwipeLeft)}
                >
                  <X className="h-4 w-4" /> Skip
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded-md transition-colors"
                  onClick={(e) => handleButtonClick(e, onToggleExpand)}
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded-md transition-colors"
                  onClick={(e) => handleButtonClick(e, onSwipeRight)}
                >
                  Donate {formattedDonation} <Heart className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Swipe Hint */}
              <AnimatePresence>
                {isHovering && !isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  >
                    <div className="flex items-center gap-8 text-white text-lg font-medium">
                      <motion.div
                        animate={{ x: [-10, 0, -10] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                        className="flex items-center gap-2 bg-red-500/80 px-4 py-2 rounded-full"
                      >
                        <X className="h-5 w-5" />
                        <span>Skip</span>
                      </motion.div>
                      <motion.div
                        animate={{ x: [10, 0, 10] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                        className="flex items-center gap-2 bg-[#22CC88]/80 px-4 py-2 rounded-full"
                      >
                        <span>Donate</span>
                        <Heart className="h-5 w-5" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overlay for swipe direction */}
      {showOverlay && overlayDirection === "left" && (
        <div className="absolute inset-0 bg-red-500/20 rounded-2xl flex items-center justify-center">
          <div className="bg-red-500/80 w-20 h-20 rounded-full flex items-center justify-center">
            <X className="text-white h-10 w-10" />
          </div>
        </div>
      )}

      {showOverlay && overlayDirection === "right" && (
        <div className="absolute inset-0 bg-[#22CC88]/20 rounded-2xl flex items-center justify-center">
          <div className="bg-[#22CC88]/80 w-20 h-20 rounded-full flex items-center justify-center">
            <Heart className="text-white h-10 w-10" />
          </div>
        </div>
      )}
    </div>
  )
}
