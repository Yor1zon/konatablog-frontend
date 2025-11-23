"use client"

import { useEffect, useState } from "react"
import { BlogHeader } from "@/components/blog-header"
import { ApiClient, type Tag } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await ApiClient.get<Tag[]>("/tags")
        if (response.success && response.data) {
          setTags(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tags")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Tags</h1>
          <p className="text-muted-foreground mb-8">Explore articles by tags</p>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : tags.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No tags available yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className="text-base px-4 py-2 cursor-pointer hover:bg-accent transition-colors"
                    style={{ borderColor: tag.color }}
                  >
                    {tag.name}
                    {tag.postCount !== undefined && (
                      <span className="ml-2 text-muted-foreground">({tag.postCount})</span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 KonataBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
