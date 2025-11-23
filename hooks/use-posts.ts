"use client"

import { useState, useEffect } from "react"
import { ApiClient, type Post, type PageResponse } from "@/lib/api"

export function usePosts(page = 0, size = 10) {
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await ApiClient.get<PageResponse<Post>>(
          `/posts?page=${page}&size=${size}&sort=publishedAt,desc`,
        )
        if (response.success && response.data) {
          setPosts(response.data.content)
          setTotalPages(response.data.totalPages)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [page, size])

  return { posts, totalPages, isLoading, error }
}
