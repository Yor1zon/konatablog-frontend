"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BlogHeader } from "@/components/blog-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hasResolvedAuth, setHasResolvedAuth] = useState(() => !isLoading)

  useEffect(() => {
    if (!isLoading) setHasResolvedAuth(true)
  }, [isLoading])

  useEffect(() => {
    if (hasResolvedAuth && !isAuthenticated) {
      router.replace("/login")
    }
  }, [hasResolvedAuth, isAuthenticated, router])

  if (!hasResolvedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 使用首页的导航栏 */}
      <BlogHeader />

      {/* 管理界面布局 */}
      <div className="flex">
        {/* 左侧导航栏 - 独立的AdminSidebar组件 */}
        <AdminSidebar />

        {/* 主内容区域 */}
        <main className="flex-1 ml-64 p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  )
}
