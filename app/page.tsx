"use client"

import { useState } from "react"
import { PostCard } from "@/components/post-card"
import { Sidebar } from "@/components/sidebar"
import { BlogHeader } from "@/components/blog-header"
import { usePosts } from "@/hooks/use-posts"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const { posts, totalPages, isLoading, error } = usePosts(currentPage, 12)

  const allPosts = posts

  const filteredPosts = allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BlogHeader />
      <main className="flex-1 container mx-auto px-6 md:px-16 lg:px-24 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content - 8 columns (reduced from 9 to give more space to sidebar) */}
          <div className="lg:col-span-8 xl:col-span-9">
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
                <Sidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
