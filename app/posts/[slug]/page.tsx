"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { BlogHeader } from "@/components/blog-header"
import { ApiClient, type Post } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Eye, ArrowLeft, TagIcon } from "lucide-react"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await ApiClient.get<Post>(`/posts/slug/${slug}`)
        if (response.success && response.data) {
          setPost(response.data)
        } else {
          setError("Post not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <BlogHeader />
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <BlogHeader />
        <div className="flex-1 container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertDescription>{error || "Post not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const authorName = post.author?.username

  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />

      <main className="flex-1">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
              {post.isFeatured && <Badge variant="default">Featured</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance blog-title">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </span>
              {authorName && <span>By {authorName}</span>}
            </div>
          </header>

          <div className="mb-8">
            <MarkdownRenderer content={post.content} />
          </div>

          {post.tags.length > 0 && (
            <footer className="border-t pt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      style={{ borderColor: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </footer>
          )}
        </article>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 KonataBlog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
