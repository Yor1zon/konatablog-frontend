"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, FileText, Tag, ImageIcon, Settings, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "仪表盘" },
  { href: "/admin/posts", icon: FileText, label: "文章管理" },
  { href: "/admin/tags", icon: Tag, label: "标签管理" },
  { href: "/admin/media", icon: ImageIcon, label: "媒体库" },
  { href: "/admin/settings", icon: Settings, label: "设置" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-background/95 backdrop-blur-sm z-40">
      <div className="pt-30 p-6 flex flex-col h-full overflow-y-auto">
        {/* 导航菜单 */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    "text-muted-foreground hover:text-foreground hover:bg-slate-100",
                    isActive && "bg-[#192A3D] text-[#FCFCFC] font-semibold hover:bg-[#303F50] hover:text-[#FCFCFC]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* 分割线和底部操作 */}
        <div className="mt-auto pt-8 border-t border-border space-y-2">
          <Link href="/">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-slate-100",
              )}
            >
              <Home className="h-4 w-4" />
              返回博客
            </div>
          </Link>
          <div
            onClick={logout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors cursor-pointer",
              "text-muted-foreground hover:text-foreground hover:bg-slate-100",
            )}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </div>
        </div>
      </div>
    </aside>
  )
}