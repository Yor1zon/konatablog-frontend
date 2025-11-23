"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type PageResponse, type Post, type Category, type Tag } from "@/lib/api"
import {
  FileText,
  Folder,
  TagIcon,
  Eye,
} from "lucide-react"
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalViews: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [postsRes, categoriesRes, tagsRes] = await Promise.all([
          ApiClient.get<PageResponse<Post>>("/posts?page=0&size=100"),
          ApiClient.get<Category[]>("/categories"),
          ApiClient.get<Tag[]>("/tags"),
        ])

        if (postsRes.success && postsRes.data) {
          const posts = postsRes.data.content
          setStats((prev) => ({
            ...prev,
            totalPosts: postsRes.data!.totalElements,
            publishedPosts: posts.filter((p) => p.status === "PUBLISHED").length,
            draftPosts: posts.filter((p) => p.status === "DRAFT").length,
            totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
          }))
        }

        if (categoriesRes.success && categoriesRes.data) {
          setStats((prev) => ({
            ...prev,
            totalCategories: categoriesRes.data!.length,
          }))
        }

        if (tagsRes.success && tagsRes.data) {
          setStats((prev) => ({
            ...prev,
            totalTags: tagsRes.data!.length,
          }))
        }
      } catch (err) {
        console.error("[v0] Failed to fetch dashboard data:", err)
      }
    }

    fetchDashboardData()
  }, [])

  const metricCards = [
    {
      title: "文章数量",
      value: stats.totalPosts,
      description: `${stats.publishedPosts} 篇已发布 · ${stats.draftPosts} 篇草稿`,
      icon: FileText,
      iconBg: "bg-sky-100 text-sky-600",
    },
    {
      title: "分类",
      value: stats.totalCategories,
      description: "活跃的内容分类",
      icon: Folder,
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "标签",
      value: stats.totalTags,
      description: "组织和检索的关键字",
      icon: TagIcon,
      iconBg: "bg-amber-100 text-amber-600",
    },
    {
      title: "累计浏览",
      value: stats.totalViews,
      description: "站点总阅读量",
      icon: Eye,
      iconBg: "bg-blue-100 text-blue-600",
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8 text-slate-900">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">overview</p>
          <h2 className="text-3xl font-semibold">仪表盘</h2>
          <p className="text-sm text-slate-500">欢迎回来，以下是博客最近的运行情况概览。</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-2xl p-3 ${card.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">统计</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
