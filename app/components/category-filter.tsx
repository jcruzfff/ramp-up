"use client"

import { ScrollArea, ScrollBar } from "@/app/components/ui/scroll-area"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/app/lib/utils"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onSelectCategoryAction: (category: string) => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategoryAction,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn("w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategoryAction("All")} 
            className="rounded-full"
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategoryAction(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
