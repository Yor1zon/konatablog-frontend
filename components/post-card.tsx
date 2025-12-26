import Link from "next/link"
import type { Post } from "@/lib/api"
import { Eye, Clock } from "lucide-react"
import { ExcerptMarkdownRenderer } from "@/components/markdown-renderer"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="py-8 border-b border-dashed last:border-0">
      {/* Category Label */}
      <div className="mb-3">
        <span className="inline-block text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
          {post.category?.name || "问题笔记"}
        </span>
      </div>

      {/* Title */}
      <Link href={`/posts/${post.slug}`} className="block group">
        <h2 className="text-2xl font-bold mb-4 blog-title group-hover:text-primary transition-colors">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <div className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
        <ExcerptMarkdownRenderer content={post.excerpt} />
      </div>

      {/* Metadata */}
      <div className="flex items-center text-xs text-muted-foreground gap-4 font-mono">
        <span className="flex items-center gap-1">
          <span className="font-bold">✎</span>
          {post.author?.username || post.author?.displayName || "NEO"}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(post.publishedAt || post.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {(post.viewCount ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
