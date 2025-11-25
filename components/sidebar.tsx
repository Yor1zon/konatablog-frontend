"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_TAGS } from "@/lib/api"
import Link from "next/link"

// Mock data for the sidebar since we want to match the visual style immediately
const archives = [
  { year: "2025", count: 1 },
  { year: "2024", count: 6 },
  { year: "2023", count: 4 },
  { year: "2022", count: 8 },
]

interface SidebarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Sidebar({ searchQuery, onSearchChange }: SidebarProps) {
  return (
    <div className="space-y-12">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search"
          className="pl-4 pr-10 py-6 text-base rounded-lg border-muted-foreground/20 bg-background"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-6">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {MOCK_TAGS.length > 0 ? (
            MOCK_TAGS.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`}>
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-sm font-normal hover:bg-muted-foreground/20 transition-colors cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tags available</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-6">Archives</h3>
        <div className="space-y-3">
          {archives.map((archive) => (
            <div key={archive.year} className="flex items-center justify-between group cursor-pointer">
              <span className="text-muted-foreground group-hover:text-primary transition-colors">{archive.year}</span>
              <span className="text-muted-foreground text-sm">({archive.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
