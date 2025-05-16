"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/app/components/Header"
import { BottomNav } from "@/app/components/bottom-nav"
import { CategoryFilter } from "@/app/components/category-filter"
import { ProjectCard } from "@/app/components/project-card"
import { CommunityNotesPanel } from "@/app/components/community-notes-panel"
import { TopUpModal } from "@/app/components/top-up-modal"
import { SwipeCardStackV2 } from "@/app/components/swipe-card-stack-v2"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { simulateHapticFeedback, formatCurrency, getUserSettings } from "@/app/lib/utils"
import { Flame, X, Heart, Zap } from "lucide-react"
import { AnimatedButton } from "@/app/components/animated-button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip"
import { StreakBadge } from "@/app/components/streak-badge"
import { EmojiAnimation } from "@/app/components/emoji-animation"
import { ComboIndicator } from "@/app/components/combo-indicator"
import { motion, AnimatePresence } from "framer-motion"
// Comment out batch transaction imports until we implement Stellar integration
// import { useBatchTransactions } from "@/app/components/batch-transaction-provider"
import { toast } from "sonner"
// import { BatchStatusIndicator } from "@/app/components/batch-status-indicator"
import { Button } from "@/app/components/ui/button"

// Define types for the community tags and community notes
type CommunityTag = {
  id: number
  text: string
  color: string
  count: number
}

// Enhanced project type that includes the additional fields
type EnhancedProject = {
  id: string
  title: string
  description: string
  imageSrc: string
  goalAmount: number
  currentAmount: number
  category: string
  sponsorBoosted?: boolean
  donorCount?: number
  daysLeft?: number
  tags?: string[]
  ownerAddress?: string
  communityTags?: CommunityTag[]
}

// Converted project type for SwipeCardStackV2
type ConvertedProject = {
  id: number
  title: string
  category: string
  description: string
  image: string
  fundingGoal: number
  currentFunding: number
  sponsorBoosted?: boolean
  donorCount?: number
  daysLeft?: number
  communityTags?: CommunityTag[]
}

// Create a type for ProjectCard props to match our usage
interface ExtendedProjectCardProps {
  project: EnhancedProject
  onDonate: () => void
  onShowCommunityNotes: () => void
  donationAmount: number
}

// Create a type for ComboIndicator props to match our usage
interface ExtendedComboIndicatorProps {
  count: number
  show: boolean
  onComplete: () => void
}

// Use empty array for enhancedProjects
const enhancedProjects: EnhancedProject[] = [];

// Convert projects to the format expected by SwipeCardStackV2
const convertProjectsForSwipeCard = (projects: EnhancedProject[]): ConvertedProject[] => {
  return projects.map(project => ({
    id: parseInt(project.id), // Convert string id to number
    title: project.title,
    category: project.category,
    description: project.description,
    image: project.imageSrc, // Map imageSrc to image
    fundingGoal: project.goalAmount, // Map goalAmount to fundingGoal
    currentFunding: project.currentAmount, // Map currentAmount to currentFunding
    sponsorBoosted: project.sponsorBoosted,
    donorCount: project.donorCount,
    daysLeft: project.daysLeft,
    // Add mock community tags since the original data doesn't have them
    communityTags: project.tags ? project.tags.slice(0, 2).map((tag: string, index: number) => ({
      id: index,
      text: tag,
      color: index === 0 ? 'blue' : 'green',
      count: Math.floor(Math.random() * 10) + 1
    })) : []
  }))
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [balance, setBalance] = useState(0.25)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDragging, setIsDragging] = useState(false)
  const [showCommunityNotes, setShowCommunityNotes] = useState(false)
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null)
  const [streak, setStreak] = useState(7)
  const [defaultDonationAmount] = useState(0.01)
  const [superDonationAmount] = useState(0.1)
  const [showSuccessEmoji, setShowSuccessEmoji] = useState(false)
  const [showSkipEmoji, setShowSkipEmoji] = useState(false)
  const [showSuperEmoji, setShowSuperEmoji] = useState(false)
  const [userSettings, setUserSettings] = useState({ currency: "CENTS", language: "en", region: "US" })
  const [comboCount, setComboCount] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [apiProjects, setApiProjects] = useState<EnhancedProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  // These state variables are used only in setter functions but still needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_donationAmount, setDonationAmount] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_points, setPoints] = useState(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_previousProjectIndex, setPreviousProjectIndex] = useState<number | null>(null)

  useEffect(() => {
    setUserSettings(getUserSettings())
  }, [])

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        
        // Convert API projects to EnhancedProject format
        const convertedProjects = data.projects.map((project: {
          id: string;
          title: string;
          description: string;
          imageSrc: string;
          goalAmount: number;
          currentAmount?: number;
          category?: string;
          sponsorBoosted?: boolean;
          donorCount?: number;
          daysLeft?: number;
          ownerAddress?: string;
        }) => ({
          id: project.id,
          title: project.title,
          description: project.description,
          imageSrc: project.imageSrc,
          goalAmount: project.goalAmount,
          currentAmount: project.currentAmount || 0,
          category: project.category || 'Other',
          sponsorBoosted: project.sponsorBoosted || false,
          donorCount: project.donorCount || 0,
          daysLeft: project.daysLeft || 30,
          ownerAddress: project.ownerAddress,
          tags: []
        }));
        
        setApiProjects(convertedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setApiError('Failed to load projects. Using demo data instead.');
        // Fall back to mock data
        setApiProjects(enhancedProjects);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Filter projects and prioritize sponsor boosted ones
  const filteredProjects =
    selectedCategory === "All"
      ? [...apiProjects].sort((a, b) => (b.sponsorBoosted ? 1 : 0) - (a.sponsorBoosted ? 1 : 0))
      : [...apiProjects]
          .filter((project) => project.category === selectedCategory)
          .sort((a, b) => (b.sponsorBoosted ? 1 : 0) - (a.sponsorBoosted ? 1 : 0))

  // Convert filtered projects to the format expected by SwipeCardStackV2
  const convertedProjects = convertProjectsForSwipeCard(filteredProjects)

  const currentProject = filteredProjects.length > 0 
    ? filteredProjects[currentProjectIndex % filteredProjects.length] 
    : null

  // Check if balance is too low after each donation
  useEffect(() => {
    if (balance <= 0.05 && !showTopUpModal) {
      setShowTopUpModal(true)
    }
  }, [balance, showTopUpModal])

  // Extract unique categories from projects for the filter
  // Provide default categories if apiProjects is empty
  const defaultCategories = ["Environment", "Education", "Economic", "Health", "Technology"];
  const categories = apiProjects.length > 0
    ? Array.from(new Set(apiProjects.map(project => project.category)))
    : defaultCategories;

  const handleSkip = () => {
    if (!currentProject) return;
    
    simulateHapticFeedback()
    setPreviousProjectIndex(currentProjectIndex)
    setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % filteredProjects.length)

    // Reset combo count on skip
    setComboCount(0)

    // Show emoji animation 
    setShowSkipEmoji(true)
  }

  const handleDonateAction = () => {
    if (!currentProject) return;
    
    simulateHapticFeedback()
    if (balance <= 0) {
      setShowTopUpModal(true)
    } else {
      // Process the donation directly
      processDonation(defaultDonationAmount)
    }
  }

  const handleSuperDonate = () => {
    if (!currentProject) return;
    
    simulateHapticFeedback()
    if (balance < superDonationAmount) {
      setShowTopUpModal(true)
    } else {
      // Process the super donation
      processDonation(superDonationAmount, true)
    }
  }

  const processDonation = (amount: number, isSuper = false) => {
    if (!currentProject) return;
    
    // Comment out batch transaction logic until we implement Stellar integration
    // Add the transaction to the batch
    // const txId = addTransaction(amount, currentProject.id, currentProject.title)
    // setLastTransactionId(txId)

    setDonationAmount((prev) => prev + amount)
    setPoints((prev) => prev + (isSuper ? 15 : 5))
    setBalance((prev) => prev - amount)

    // Increment streak and combo
    setStreak((prev) => prev + 1)
    setComboCount((prev) => prev + (isSuper ? 2 : 1))

    // Show animation of emoji
    if (isSuper) {
      setShowSuperEmoji(true)
    } else {
      setShowSuccessEmoji(true)
    }

    // Show combo indicator if needed (3, 5, or more)
    if (comboCount + (isSuper ? 2 : 1) >= 3) {
      setShowCombo(true)
    }

    // Advance to next project
    setPreviousProjectIndex(currentProjectIndex)
    setCurrentProjectIndex((prevIndex) => (prevIndex + 1) % filteredProjects.length)
  }

  const handleTopUp = (amount: number) => {
    setBalance((prev) => prev + amount)
    setShowTopUpModal(false)

    toast.success(`Balance topped up: ${formatCurrency(amount, userSettings.currency)}`, {
      description: `Your new balance is ${formatCurrency(balance + amount, userSettings.currency)}`,
    })
  }

  const handleShowCommunityNotes = (project: ConvertedProject | EnhancedProject) => {
    // Cast the project to EnhancedProject and set it as selected
    setSelectedProject(project as EnhancedProject)
    setShowCommunityNotes(true)
  }

  const handleAddTag = (tag: string) => {
    // In a real app, this would add the tag to the project
    console.log(`Added tag: ${tag}`)
    setShowCommunityNotes(false)

    toast.success(`Tag added: ${tag}`, {
      description: "Thank you for contributing to the community",
    })
  }

  // Function to determine if a project should be faded due to low trust
  const shouldFadeProject = (project: EnhancedProject | null) => {
    if (!project) return false;
    
    const fakeTags = project.communityTags?.filter((tag: CommunityTag) => 
      tag.text.includes("Fake") || tag.text.includes("Spam")
    ) || []

    return fakeTags.length > 0 && fakeTags.reduce((sum: number, tag: CommunityTag) => sum + tag.count, 0) > 5
  }

  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <Header variant="default" />

      <main className="flex-1">
        {/* Category filter */}
        <div className="px-4 py-3">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategoryAction={setSelectedCategory}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : apiError ? (
          <div className="text-center p-4 bg-red-50 mx-4 my-4 rounded-lg border border-red-200">
            <p className="text-red-700 mb-2">{apiError}</p>
            <p className="text-sm text-red-600">Using demo projects instead.</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 m-4 space-y-4 border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <Flame className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-center">No projects available</h3>
            <p className="text-center text-gray-600 max-w-md">
              Be the first to create a project that the community can fund! Click the Create button in the bottom navigation to get started.
            </p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => window.location.href = '/create'}
            >
              Create Project
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="px-4 pt-2 flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Balance: {formatCurrency(balance, userSettings.currency)}</span>
                <AnimatedButton
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setShowTopUpModal(true)}
                >
                  Top up
                </AnimatedButton>
              </div>
              <StreakBadge streak={streak} size="sm" />
            </motion.div>

            <Tabs defaultValue="swipe" className="w-full">
              <div className="px-4 pt-2">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="swipe">Swipe</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="swipe" className="p-4">
                <div className="relative">
                  <TooltipProvider>
                    <div className={`relative ${shouldFadeProject(currentProject) ? "opacity-70" : ""}`}>
                      <SwipeCardStackV2
                        projects={convertedProjects}
                        onDonateAction={handleDonateAction}
                        onSuperDonateAction={handleSuperDonate}
                        onShowCommunityNotesAction={handleShowCommunityNotes}
                        donationAmount={defaultDonationAmount}
                      />

                      {currentProject?.sponsorBoosted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          <Flame className="h-3 w-3 mr-1" />
                          <span>Sponsored</span>
                        </motion.div>
                      )}

                      {shouldFadeProject(currentProject) && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center"
                            >
                              <span>⚠️ Low Trust</span>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            This project has been flagged by the community as potentially untrustworthy.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        onClick={handleSkip}
                        disabled={isDragging}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Skip
                      </AnimatedButton>
                      <AnimatedButton
                        variant="default"
                        size="sm"
                        onClick={handleDonateAction}
                        disabled={isDragging}
                        className="flex items-center gap-1 bg-[#22CC88] hover:bg-[#1db978]"
                      >
                        Donate {formatCurrency(defaultDonationAmount, userSettings.currency)}
                        <Heart className="h-4 w-4" />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="secondary"
                        size="sm"
                        onClick={handleSuperDonate}
                        disabled={isDragging}
                        className="flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600"
                      >
                        <Zap className="h-4 w-4" />
                        {formatCurrency(superDonationAmount, userSettings.currency)}
                      </AnimatedButton>
                    </div>
                  </TooltipProvider>
                </div>
              </TabsContent>

              <TabsContent value="list" className="px-4">
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {(ProjectCard as React.ComponentType<ExtendedProjectCardProps>) && (
                        <ProjectCard
                          {...{
                            project,
                            onDonate: () => {
                              setSelectedProject(project)
                              handleDonateAction()
                            },
                            onShowCommunityNotes: () => handleShowCommunityNotes(project),
                            donationAmount: defaultDonationAmount
                          } as ExtendedProjectCardProps}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Emoji animations */}
      <EmojiAnimation type="success" show={showSuccessEmoji} onComplete={() => setShowSuccessEmoji(false)} />
      <EmojiAnimation type="skip" show={showSkipEmoji} onComplete={() => setShowSkipEmoji(false)} />

      {/* Super Donate Animation */}
      <AnimatePresence>
        {showSuperEmoji && (
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
              onAnimationComplete={() => setShowSuperEmoji(false)}
            >
              <Zap className="h-6 w-6" />
              <span className="text-xl font-bold">Super Donate!</span>
              <Zap className="h-6 w-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo indicator */}
      <ComboIndicator 
        {...{
          count: comboCount, 
          show: showCombo, 
          onComplete: () => setShowCombo(false)
           
        } as ExtendedComboIndicatorProps} 
      />

      <TopUpModal isOpen={showTopUpModal} onCloseAction={() => setShowTopUpModal(false)} onTopUpAction={handleTopUp} />

      {selectedProject && (
        <CommunityNotesPanel
          isOpen={showCommunityNotes}
          onCloseAction={() => setShowCommunityNotes(false)}
          project={{
            id: parseInt(selectedProject.id),
            title: selectedProject.title,
            communityTags: selectedProject.communityTags || []
          }}
          onAddTagAction={handleAddTag}
        />
      )}

      {/* Comment out BatchStatusIndicator until we implement Stellar integration */}
      {/* <BatchStatusIndicator /> */}
      <BottomNav />
    </div>
  )
}
