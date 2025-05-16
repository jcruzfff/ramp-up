"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusSquare, Users, User } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import { useMenu } from "@/app/context/MenuContext"

export function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { openMenu } = useMenu()

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  // Full navigation with all options
  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
    },
    {
      name: "Create",
      href: "/create",
      icon: PlusSquare,
      requiresAuth: true,
    },
    {
      name: "Social",
      href: "/social",
      icon: Users,
      requiresAuth: true,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      requiresAuth: true,
    }
  ]

  // Function to handle navigation click
  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    // If the item requires auth and user is not authenticated, 
    // prevent default navigation and open the menu instead
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault()
      openMenu()
    }
  }

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-10">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(item, e)}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
                active ? "text-blue-500" : "text-slate-500"
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? "text-blue-500" : "text-slate-500"}`} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
