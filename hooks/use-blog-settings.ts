"use client"

import { useEffect, useState } from "react"
import { ApiClient, type BlogSettings } from "@/lib/api"

const DEFAULT_SETTINGS: BlogSettings = {
  blogName: "KonataBlog",
  blogDescription: "A modern personal blog platform",
  blogTagline: "",
  authorName: "",
  authorEmail: "",
  pageSize: 10,
  commentEnabled: false,
  theme: "default",
}

export function useBlogSettings() {
  const [settings, setSettings] = useState<BlogSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await ApiClient.getPublicSettings()
        if (res.success && res.data) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...res.data,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, isLoading, error }
}
