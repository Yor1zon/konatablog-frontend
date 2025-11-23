"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  LayoutDashboard,
  FileText,
  Folder,
  Tag,
  ImageIcon,
  Settings,
  Palette,
  Home,
  LogOut,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/posts", icon: FileText, label: "Posts" },
  { href: "/admin/categories", icon: Folder, label: "Categories" },
  { href: "/admin/tags", icon: Tag, label: "Tags" },
  { href: "/admin/media", icon: ImageIcon, label: "Media" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/themes", icon: Palette, label: "Themes" },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
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
    <div className="flex h-screen bg-slate-100/80 text-slate-900 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white/90 backdrop-blur flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-semibold">
              K
            </div>
            <div>
              <p className="font-semibold text-slate-900">KonataBlog</p>
              <p className="text-xs text-slate-500">content admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    "text-slate-500 hover:bg-slate-100",
                    isActive && "bg-slate-900 text-white shadow-md hover:bg-slate-900",
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link href="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <Home className="mr-2 h-4 w-4 text-slate-400" />
              View Blog
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4 text-slate-400" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100/60">
        {/* Top Bar */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">admin</p>
            <h1 className="text-xl font-semibold text-slate-900">
              {navItems.find((item) => item.href === pathname)?.label || "Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-500">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索..."
                className="bg-transparent outline-none w-40 text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.nickname} />
                <AvatarFallback>{user?.nickname?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user?.nickname}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
