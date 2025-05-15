"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Send, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/") return true
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const navItems = [
    {
      name: "Home",
      href: "/home",
      icon: Home,
    },
    {
      name: "Social",
      href: "/social",
      icon: Users,
    },
    {
      name: "Create",
      href: "/create", 
      icon: Send,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-10">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
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
