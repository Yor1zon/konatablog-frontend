"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { LayoutDashboard, Github } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function BlogHeader() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 pt-8 pb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Left: Title and Subtitle */}
          <Link href="/" className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Kana</h1>
            <p className="text-xs text-muted-foreground">自强不息，知行合一。</p>
          </Link>

          {/* Right: Navigation */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.nickname} />
                      <AvatarFallback>{user?.nickname?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.nickname}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                登录
              </Link>
            )}

            <div className="flex items-center space-x-2 ml-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
