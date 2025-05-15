"use client"

import type React from "react"

import Image from "next/image"
import { Card, CardContent } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Flame } from "lucide-react"

interface ProjectCardProps {
  project: {
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
  }
  className?: string
  onClick?: () => void
}

export function ProjectCard({ project, className, onClick }: ProjectCardProps) {
  const percentFunded = (project.currentAmount / project.goalAmount) * 100
 
  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${className || ""}`}
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image 
          src={project.imageSrc}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {project.sponsorBoosted && (
          <div className="absolute top-2 right-2 bg-amber-100 text-amber-600 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium">
            <Flame className="h-3 w-3" />
            <span>Sponsor Boost</span>
          </div>
        )}
        
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-medium text-lg">{project.title}</h3>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-blue-600">${project.currentAmount.toLocaleString()}</span>
            <span className="text-slate-500">of ${project.goalAmount.toLocaleString()}</span>
          </div>
          <Progress value={percentFunded} max={100} />
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-2">{project.description}</p>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>{project.donorCount} donors</span>
          <span>{project.daysLeft} {project.daysLeft === 1 ? 'day' : 'days'} left</span>
        </div>
      </CardContent>
    </Card>
  )
}
