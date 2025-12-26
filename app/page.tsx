"use client"

import { useState, useMemo } from "react"
import { PostCard } from "@/components/post-card"
import { Sidebar } from "@/components/sidebar"
import { BlogHeader } from "@/components/blog-header"
import { usePosts } from "@/hooks/use-posts"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Post, Tag } from "@/lib/api"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const { posts, totalPages, isLoading, error } = usePosts(currentPage, 12)

  const allPosts = posts

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post: Post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = selectedTag ? post.tags.some((tag) => tag.id === selectedTag.id) : true

      const postYear = new Date(post.publishedAt || post.createdAt).getFullYear().toString()
      const matchesYear = selectedYear ? postYear === selectedYear : true

      return matchesSearch && matchesTag && matchesYear
    })
  }, [allPosts, searchQuery, selectedTag, selectedYear])

  const handleSelectTag = (tag: Tag) => {
    setSelectedTag((prev) => (prev?.id === tag.id ? null : tag))
  }

  const handleSelectYear = (year: string) => {
    setSelectedYear((prev) => (prev === year ? null : year))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BlogHeader />
      <main className="flex-1 container mx-auto px-6 md:px-16 lg:px-24 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-[70vh]">
          {/* Main Content - 8 columns (reduced from 9 to give more space to sidebar) */}
          <div className="lg:col-span-8 xl:col-span-9 min-h-[60vh]">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner className="h-8 w-8" />
              </div>
            ) : error && posts.length === 0 ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No posts found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map((post) => (
                  // @ts-ignore - handling potential type mismatch with sample data
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - 4 columns (increased from 3) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 pl-4">
            <div className="lg:sticky lg:top-[9rem]">
              <div className="lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-3">
                <Sidebar
                  posts={allPosts}
                  searchQuery={searchQuery}
                  selectedTag={selectedTag}
                  selectedYear={selectedYear}
                  onSearchChange={setSearchQuery}
                  onSelectTag={handleSelectTag}
                  onSelectYear={handleSelectYear}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
