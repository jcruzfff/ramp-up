"use client"

import { useState } from "react"
import { Header } from "@/app/components/Header"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PrivacyToggle } from "@/components/privacy-toggle"
import { StreakBadge } from "@/components/streak-badge"
import UserProjects from "@/app/components/UserProjects"
import { useAuth } from '@/app/hooks/useAuth'
import { useRouter } from "next/navigation"
import { DefaultDonationSetting } from "@/app/components/settings/DefaultDonationSetting"
import { useDefaultDonation } from "@/app/hooks/useDefaultDonation"

// Mock data - replace with actual data fetching
const achievements = [
  {
    id: 1,
    title: "First Donation",
    description: "Made your first donation",
    icon: "🎉",
    unlocked: true,
    date: "2023-05-15",
    progress: 1,
    max: 1
  },
  {
    id: 2,
    title: "Early Adopter",
    description: "Joined during beta",
    icon: "🚀",
    unlocked: true,
    date: "2023-04-22",
    progress: 1,
    max: 1
  },
  {
    id: 3,
    title: "Tag Master",
    description: "Created 50 tags",
    icon: "🏷️",
    unlocked: false,
    date: null,
    progress: 23,
    max: 50
  },
  {
    id: 4,
    title: "Generous",
    description: "Donated to 10 projects",
    icon: "💖",
    unlocked: true,
    date: "2023-06-10",
    progress: 12,
    max: 10
  }
];

const friendsData = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "👨‍💼",
    totalDonated: 12.45,
    projectsSupported: 8,
    isFollowing: true
  },
  {
    id: 2,
    name: "Morgan Smith",
    avatar: "👩‍🎤",
    totalDonated: 28.75,
    projectsSupported: 14,
    isFollowing: true
  },
  {
    id: 3,
    name: "Jamie Lee",
    avatar: "🧑‍🚀",
    totalDonated: 6.30,
    projectsSupported: 5,
    isFollowing: false
  }
];

export default function ProfilePage() {
  const { isAuthenticated, userName, userEmail } = useAuth();
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("overview");
  const { donationAmount, updateDonationAmount, isInitialized } = useDefaultDonation();
  
  // Redirect unauthenticated users to home
  if (!isAuthenticated) {
    router.push('/home');
    return null;
  }
  
  return (
    <div className="min-h-screen pb-16">
      <Header title="Profile" showBack backUrl="/home" />
      
      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-500 mr-4">
                {userName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userName || 'User'}</h2>
                <p className="text-gray-500">{userEmail || 'No email'}</p>
                <div className="flex items-center mt-1">
                  <StreakBadge streak={7} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wallet">Projects</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Card */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Your Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Donated</p>
                    <p className="text-xl font-bold">$8.15</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projects Supported</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tags Created</p>
                    <p className="text-xl font-bold">23</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Impact Points</p>
                    <p className="text-xl font-bold">82</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Achievements */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 border rounded-lg flex flex-col items-center">
                      <span className="text-2xl mb-1">{achievement.icon}</span>
                      <h4 className="font-medium text-center">{achievement.title}</h4>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (achievement.progress / achievement.max) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress}/{achievement.max}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Friends */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Friends</h3>
                <div className="space-y-3">
                  {friendsData.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mr-3">
                          {friend.avatar}
                        </div>
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-xs text-gray-500">
                            ${friend.totalDonated} donated • {friend.projectsSupported} projects
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={friend.isFollowing ? "outline" : "default"} 
                        size="sm"
                      >
                        {friend.isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-3">
                  Find More Friends
                </Button>
              </CardContent>
            </Card>
            
            {/* Impact Share Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Share Your Impact</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Let your friends know about your contributions!
                </p>
                <Button className="w-full">
                  Share Your Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-4">
            <UserProjects />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            {/* Default donation amount setting */}
            {isInitialized && (
              <DefaultDonationSetting
                initialAmount={donationAmount}
                onDonationChange={updateDonationAmount}
              />
            )}
            
            <PrivacyToggle 
              isPublic={isPublic}
              onToggleAction={setIsPublic}
            />
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Display Settings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Dark Mode</span>
                    <div className="flex items-center">
                      <div className={`w-10 h-5 ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'} rounded-full relative mr-2`}>
                        <div 
                          className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${
                            isDarkMode ? 'right-0.5' : 'left-0.5'
                          }`} 
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                      >
                        {isDarkMode ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Notification Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Friend Requests</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Account Settings</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
  );
}
