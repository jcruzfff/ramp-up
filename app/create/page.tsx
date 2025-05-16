"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/app/components/Header"
import { BottomNav } from "@/app/components/bottom-nav"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent } from "@/app/components/ui/card"
import { Upload, LinkIcon, Flame, Clock, AlertCircle, DollarSign, Wallet, Loader2 } from "lucide-react"
import { Switch } from "@/app/components/ui/switch"
import { Label } from "@/app/components/ui/label"
import { Checkbox } from "@/app/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { Input } from "@/app/components/ui/input"
import { useCreateProject } from "@/app/hooks/contracts/useCreateProject"
import { useStellarClient } from "@/app/hooks/useStellarClient"
import { toast } from "sonner"
import Image from "next/image"

const timeframeOptions = {
  "1week": 7,
  "2weeks": 14,
  "1month": 30,
  "3months": 90,
  "6months": 180,
  "1year": 365
};

// Available category options
const categoryOptions = [
  { id: "environment", label: "Environment" },
  { id: "education", label: "Education" },
  { id: "health", label: "Health" },
  { id: "technology", label: "Technology" },
  { id: "arts", label: "Arts & Culture" },
  { id: "community", label: "Community" },
  { id: "other", label: "Other" }
];

export default function CreateProject() {
  const router = useRouter()
  const { handleCreateProject, isSubmitting, error, isAuthenticated } = useCreateProject()
  const stellarClient = useStellarClient()
  const { connect, isConnected, wallet, isConnecting: clientConnecting } = stellarClient
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Add local state to track what's displayed to the user
  const [localConnectionState, setLocalConnectionState] = useState({
    isConnecting: false,
    connectionAttempted: false,
    showWarning: true
  })

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [timeframe, setTimeframe] = useState("1month")
  const [sponsorBoost, setSponsorBoost] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["other"])
  const [goalAmount, setGoalAmount] = useState<number>(1000)
  const [formError, setFormError] = useState<string | null>(null)

  // Try to detect wallet on page load
  useEffect(() => {
    // Track if the effect is still mounted to avoid state updates after unmount
    let mounted = true;
    
    const checkWalletConnection = async () => {
      // Avoid running if we're already connected or have already attempted
      if (isConnected || localConnectionState.connectionAttempted) {
        return;
      }
      
      if (mounted) setLocalConnectionState(prev => ({ ...prev, isConnecting: true }));
      
      try {
        // First check if wallet is already available
        if (wallet?.address) {
          console.log("Wallet already exists, connecting directly:", wallet.address);
          
          // Allow a short delay for any state updates
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Now try to connect
          const connected = await connect();
          
          if (mounted) {
            setLocalConnectionState(prev => ({ 
              ...prev, 
              showWarning: !connected,
              isConnecting: false,
              connectionAttempted: true
            }));
          }
        } 
        // If no wallet, try to initialize one
        else if (stellarClient.getWalletStatus) {
          console.log("No wallet detected, attempting to initialize wallet first...");
          
          // Try to initialize the wallet 
          const walletResult = await stellarClient.getWalletStatus();
          
          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Now try to connect if we got a wallet
          if (walletResult?.address || wallet?.address) {
            const connected = await connect();
            
            if (mounted) {
              setLocalConnectionState(prev => ({ 
                ...prev, 
                showWarning: !connected,
                isConnecting: false,
                connectionAttempted: true
              }));
            }
          } else {
            // No wallet was created/found
            if (mounted) {
              setLocalConnectionState(prev => ({ 
                ...prev, 
                showWarning: true,
                isConnecting: false,
                connectionAttempted: true
              }));
            }
          }
        }
        
        console.log("Wallet connection attempt completed:");
        console.log("- Connected status:", isConnected);
        console.log("- Wallet exists:", !!wallet);
        console.log("- Network:", stellarClient.networkPassphrase);
      } catch (err) {
        console.error("Failed to auto-connect wallet:", err);
        
        // Ensure warning shows when connection fails
        if (mounted) {
          setLocalConnectionState(prev => ({ 
            ...prev, 
            showWarning: true,
            isConnecting: false,
            connectionAttempted: true 
          }));
        }
      }
    };

    // Don't start the check immediately, let other state initialize first
    const timer = setTimeout(() => {
      checkWalletConnection();
    }, 1000);
    
    // Cleanup function to set mounted to false
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [connect, isConnected, wallet, localConnectionState.connectionAttempted, stellarClient]);

  // Update local state when wallet or connection status changes
  useEffect(() => {
    if (isConnected && wallet?.address) {
      setLocalConnectionState(prev => ({ 
        ...prev, 
        showWarning: false,
        connectionAttempted: true 
      }));
    }
  }, [isConnected, wallet]);

  // Also update local connecting state when client connecting state changes
  useEffect(() => {
    setLocalConnectionState(prev => ({ 
      ...prev, 
      isConnecting: clientConnecting 
    }));
  }, [clientConnecting]);

  const handleConnectWallet = async () => {
    setLocalConnectionState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Try to create/get wallet then connect
      let walletToUse = wallet;
      
      // If we don't have a wallet yet, try to create one
      if (!walletToUse?.address && stellarClient.getWalletStatus) {
        console.log("Manual connection: Attempting to create/find wallet first...");
        walletToUse = await stellarClient.getWalletStatus();
        
        // Wait for state updates
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Now try to connect with whatever wallet we have
      console.log("Manual connection: Connecting with wallet:", walletToUse?.address || "No wallet available");
      const connected = await connect();
      
      console.log("Manual wallet connection attempt completed:");
      console.log("- Connected status:", isConnected);
      console.log("- Connection result:", connected);
      console.log("- Wallet exists:", !!wallet);
      console.log("- Network:", stellarClient.networkPassphrase);
      
      // Update connection state based on actual result
      if (connected) {
        toast.success("Wallet connected successfully!");
        setLocalConnectionState(prev => ({ 
          ...prev, 
          showWarning: false,
          isConnecting: false,
          connectionAttempted: true
        }));
      } else {
        toast.error("Wallet connection failed. Please try again.");
        setLocalConnectionState(prev => ({ 
          ...prev, 
          showWarning: true,
          isConnecting: false,
          connectionAttempted: true
        }));
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      toast.error("Failed to connect wallet. Please try again.");
      setLocalConnectionState(prev => ({ 
        ...prev, 
        showWarning: true,
        isConnecting: false,
        connectionAttempted: true
      }));
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const uploadImage = async (file: File): Promise<string> => {
    // In a real application, this would upload to a storage service like S3, Cloudinary, etc.
    // For now, we'll return a placeholder URL or the existing preview
    
    // Simulate an upload delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log("Would upload file:", file.name)
    
    // If we have a preview, use that (this is just for demo purposes)
    if (imagePreview) {
      return imagePreview
    }
    
    // Fallback to a placeholder
    return 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    // Form validation
    if (!title.trim()) {
      setFormError("Project title is required")
      return
    }
    
    if (!description.trim()) {
      setFormError("Project description is required")
      return
    }
    
    if (!imageFile) {
      setFormError("Project image is required")
      return
    }
    
    if (goalAmount <= 0) {
      setFormError("Goal amount must be greater than zero")
      return
    }
    
    if (selectedCategories.length === 0) {
      setFormError("Select at least one category")
      return
    }
    
    try {
      // Convert timeframe to days
      const daysUntilDeadline = timeframeOptions[timeframe as keyof typeof timeframeOptions] || 30
      
      // Upload image if we have one
      let imageUrl = 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3'
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (err) {
          console.error('Error uploading image:', err)
          toast.error("Failed to upload image, using default image instead")
        }
      }
      
      toast.info("Creating project transaction... This may take a moment")
      
      // Create project
      try {
        await handleCreateProject({
          title,
          description,
          imageUrl,
          daysUntilDeadline,
          goalAmount,
          categories: selectedCategories,
          websiteUrl
        });
        
        toast.success("Project created successfully!");
        
        // Navigate to home page after creation
        router.push("/home")
      } catch (err) {
        console.error('Project creation error:', err)
        
        // Extract more helpful error information
        let errorMessage = 'An unknown error occurred';
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Look for specific error patterns in the message
          if (errorMessage.includes('func') && errorMessage.includes('required') && errorMessage.includes('host function')) {
            errorMessage = 'Transaction signing failed: PasskeyKit was not correctly initialized or the contract factory ID is incorrect';
          } else if (errorMessage.includes('prepare') || errorMessage.includes('simulate')) {
            errorMessage = 'Transaction preparation failed: the RPC server could not prepare the transaction';
          } else if (errorMessage.includes('Transaction submission failed')) {
            errorMessage = 'Transaction submission failed: the network rejected the transaction';
          }
        }
        
        toast.error(`Failed to create project: ${errorMessage}`)
        setFormError(`Project creation failed: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Form submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error(`Error: ${errorMessage}`)
      setFormError(`Error: ${errorMessage}`);
    }
  }

  // Check authentication and connection status
  const renderAuthWarning = () => {
    // Check statuses in order of priority, and only show one alert
    if (localConnectionState.isConnecting) {
      return (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <AlertDescription className="text-blue-700">
            Connecting to your wallet...
          </AlertDescription>
        </Alert>
      )
    }
  
    if (!isAuthenticated) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to create a project.
          </AlertDescription>
        </Alert>
      )
    }
    
    // Only show success message when properly connected
    if (isConnected && wallet?.address) {
      return null
    }
    
    // Show warning if either:
    // 1. Connection was attempted but failed
    // 2. showWarning is explicitly set to true
    if (localConnectionState.connectionAttempted || localConnectionState.showWarning) {
      return (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-700 flex items-center justify-between">
            <span>Your wallet needs to be connected to create a project.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleConnectWallet}
              disabled={localConnectionState.isConnecting}
              className="ml-4"
            >
              {localConnectionState.isConnecting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
              ) : (
                <><Wallet className="h-4 w-4 mr-2" /> Connect Wallet</>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }

  return (
    <div className="min-h-screen pb-16">
      <Header title="Create Project" showBack backUrl="/home" />

      <div className="p-4">
        {renderAuthWarning()}
        
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2"> 
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-3 border border-slate-200 rounded-lg"
                  placeholder="Project title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-2">
                  Project Image *
                </label>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-40 bg-slate-100 rounded-lg overflow-hidden mb-2">
                      <Image 
                        src={imagePreview} 
                        alt="Project preview" 
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </Button>
                  
                  <p className="text-xs text-slate-500">
                    Upload a high-quality image to represent your project (required)
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  className="w-full p-3 border border-slate-200 rounded-lg min-h-[120px]"
                  placeholder="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="goalAmount" className="block text-sm font-medium mb-2">
                  Funding Goal
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    type="number"
                    id="goalAmount"
                    className="w-full p-3 pl-10"
                    placeholder="1000"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(parseFloat(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Amount in USD you&apos;re aiming to raise</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categories (Select all that apply)
                </label>
                <div className="space-y-2 mt-1 border border-slate-200 rounded-lg p-3">
                  {categoryOptions.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Select at least one category</p>
                )}
              </div>

              <div>
                <label htmlFor="timeframe" className="block text-sm font-medium mb-2">
                  Funding Timeframe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-full p-3 pl-10 border border-slate-200 rounded-lg">
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">1 Week</SelectItem>
                      <SelectItem value="2weeks">2 Weeks</SelectItem>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-slate-500 mt-1">How long would you like to collect funds?</p>
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium mb-2">
                  Website URL (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    id="website"
                    className="w-full p-3 pl-10 border border-slate-200 rounded-lg"
                    placeholder="https://yourproject.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Paste your project link to let donors verify impact</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Flame className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <Label htmlFor="sponsor-boost" className="font-medium">
                      Sponsor Boost
                    </Label>
                    <p className="text-xs text-slate-500">Get priority placement in the swipe feed</p>
                  </div>
                </div>
                <Switch id="sponsor-boost" checked={sponsorBoost} onCheckedChange={setSponsorBoost} />
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 mb-8">
            <Button 
              type="submit" 
              className="w-full"
              disabled={
                isSubmitting || 
                !isAuthenticated || 
                (!isConnected && !wallet?.address) || 
                localConnectionState.isConnecting ||
                !title.trim() || // Require valid title
                !description.trim() || // Require valid description
                !imageFile // Require image upload
              }
            >
              {isSubmitting ? 'Creating Project...' : 'Publish Project'}
            </Button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  )
}
