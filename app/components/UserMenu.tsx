"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { User, Wallet, LogIn, LogOut, Home, Bell, CreditCard, Settings, Plus, Menu } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import StellarWallet from "@/app/components/StellarWallet";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetDescription
} from "@/app/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useMenu } from "@/app/context/MenuContext";

interface UserMenuProps {
  variant?: "icon" | "button";
  showText?: boolean;
}

export default function UserMenu({ variant = "icon", showText = false }: UserMenuProps) {
  const { isAuthenticated, userName, userEmail, login, logout, createAccount } = useAuth();
  const { isMenuOpen, closeMenu, toggleMenu } = useMenu();
  const [isLoading, setIsLoading] = useState(false);

  // Handle login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Create a new wallet account
  const handleCreateAccount = async () => {
    setIsLoading(true);
    try {
      await createAccount();
    } catch (error) {
      console.error("Account creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Content for unauthenticated users
  if (!isAuthenticated) {
    if (variant === "button") {
      return (
        <Button onClick={handleLogin} variant="outline" className="gap-1" disabled={isLoading}>
          {isLoading ? "Signing in..." : (
            <>
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </>
          )}
        </Button>
      );
    }

    // Icon variant for nav icons - directly using Button for menu trigger
    return (
      <>
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex flex-col items-center"
          aria-label="Menu"
          onClick={toggleMenu}
        >
          <Menu className="h-5 w-5 text-slate-500" />
          {showText && <span className="sr-only">Menu</span>}
        </Button>

        <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
          <SheetContent className="overflow-y-auto px-0 pt-12 pb-6 sm:px-6">
            <SheetHeader className="px-6 sm:px-0 mb-8">
              <SheetTitle className="text-2xl">Welcome to Stellar Swipe</SheetTitle>
              <SheetDescription className="text-base">
                Sign in to access your account and wallet.
              </SheetDescription>
            </SheetHeader>
            
            <div className="px-6 sm:px-0 mt-8 space-y-6">
              <Button 
                onClick={handleLogin} 
                className="w-full py-6 text-lg" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Connect Wallet"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleCreateAccount} 
                className="w-full py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create New Account"}
              </Button>
              
              <div className="pt-4 text-center text-sm text-gray-500">
                <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Content for authenticated users
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-500 hover:bg-blue-200"
        onClick={toggleMenu}
      >
        {userName?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
      </Button>

      <Sheet open={isMenuOpen} onOpenChange={toggleMenu}>
        <SheetContent className="overflow-y-auto px-0 pt-12 pb-6 sm:px-6">
          <SheetHeader className="px-6 sm:px-0 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-2xl font-medium">
                {userName?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
              </div>
              <div className="text-left">
                <SheetTitle className="text-2xl">{userName || 'Welcome'}</SheetTitle>
                {userEmail && <SheetDescription className="text-base">{userEmail}</SheetDescription>}
              </div>
            </div>
          </SheetHeader>
          
          <div className="px-6 sm:px-0 space-y-8">
            {/* Navigation Links */}
            <div className="space-y-2">
              <Link href="/home" onClick={() => closeMenu()} className="flex items-center gap-3 text-lg p-3 rounded-lg hover:bg-gray-100">
                <Home className="h-5 w-5 text-blue-500" />
                <span>Home</span>
              </Link>
              
              <Link href="/notifications" onClick={() => closeMenu()} className="flex items-center gap-3 text-lg p-3 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5 text-blue-500" />
                <span>Notifications</span>
              </Link>
            </div>
            
            {/* Wallet section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Your Stellar Wallet</h2>
              </div>
              <StellarWallet />
            </div>
            
            {/* Recent Transactions */}
            <Card className="bg-white shadow-sm rounded-lg border-gray-200">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-3">Recent Transactions</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Top Up</p>
                        <p className="text-xs text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <p className="font-medium text-green-500">+0.25$</p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <CreditCard className="h-4 w-4 mr-2" /> Top Up Wallet
                </Button>
              </CardContent>
            </Card>
            
            {/* Funded projects section */}
            <Card className="bg-white shadow-sm rounded-lg border-gray-200">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Your Funded Projects</h2>
                <p className="text-gray-500 text-sm">You haven&apos;t funded any projects yet.</p>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Discover Projects
                </Button>
              </CardContent>
            </Card>
            
            {/* Settings */}
            <Link href="/settings" onClick={() => closeMenu()} className="flex items-center gap-3 text-lg p-3 rounded-lg hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-500" />
              <span>Settings</span>
            </Link>
            
            {/* Logout button */}
            <div className="pt-4">
              <Button 
                onClick={handleLogout} 
                variant="destructive" 
                className="w-full py-4 text-lg"
              >
                <LogOut className="h-5 w-5 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 