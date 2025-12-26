"use client"

import { useEffect } from "react"
import { useBlogSettings } from "@/hooks/use-blog-settings"

export function SettingsMeta() {
  const { settings } = useBlogSettings()

  useEffect(() => {
    if (settings.blogTagline) {
      document.title = settings.blogTagline
    } else if (settings.blogName) {
      document.title = settings.blogName
    }

    if (settings.blogDescription) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) {
        meta.setAttribute("content", settings.blogDescription)
      } else {
        const newMeta = document.createElement("meta")
        newMeta.name = "description"
        newMeta.content = settings.blogDescription
        document.head.appendChild(newMeta)
      }
    }
  }, [settings.blogName, settings.blogDescription, settings.blogTagline])

  return null
}
