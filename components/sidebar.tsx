"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ApiClient, type Post, type Tag } from "@/lib/api"

interface SidebarProps {
  posts?: Post[]
  searchQuery: string
  selectedTag?: Tag | null
  selectedYear?: string | null
  onSearchChange: (value: string) => void
  onSelectTag?: (tag: Tag) => void
  onSelectYear?: (year: string) => void
}

export function Sidebar({
  posts,
  searchQuery,
  selectedTag,
  selectedYear,
  onSearchChange,
  onSelectTag,
  onSelectYear,
}: SidebarProps) {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await ApiClient.getTags()
        if (res.success && res.data) {
          setTags(res.data)
        }
      } catch (error) {
        console.error("[Sidebar] Failed to load tags:", error)
        setTags([])
      }
    }
    fetchTags()
  }, [])

  const archives = useMemo(() => {
    const counts = new Map<string, number>()
    ;(posts || []).forEach((post) => {
      const date = post.publishedAt || post.createdAt
      const year = new Date(date).getFullYear().toString()
      counts.set(year, (counts.get(year) || 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([year, count]) => ({ year, count }))
  }, [posts])

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
          {tags.length > 0 ? (
            tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onSelectTag?.(tag)}
                className={`px-3 py-1 text-sm font-normal rounded-full border transition-colors ${
                  selectedTag?.id === tag.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/60 border-transparent hover:bg-muted-foreground/20"
                }`}
              >
                {tag.name}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tags available</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-6">Archives</h3>
        <div className="space-y-3">
          {archives.length > 0 ? (
            archives.map((archive) => (
              <button
                key={archive.year}
                className={`flex w-full items-center justify-between group cursor-pointer rounded-md px-2 py-2 transition-colors ${
                  selectedYear === archive.year ? "bg-secondary" : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectYear?.(archive.year)}
              >
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{archive.year}</span>
                <span className="text-muted-foreground text-sm">({archive.count})</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No archives yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
