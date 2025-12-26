"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type BlogSettings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Save, Upload } from "lucide-react"

const themeOptions = [
  {
    id: 1,
    name: "Default",
    slug: "default",
    description: "清爽的默认主题，适合内容为先的博客",
    previewUrl: "/default-blog-theme.jpg",
  },
  {
    id: 2,
    name: "Modern",
    slug: "modern",
    description: "现代感较强的排版，突出标题和视觉",
    previewUrl: "/modern-blog-theme.jpg",
  },
  {
    id: 3,
    name: "Classic",
    slug: "classic",
    description: "传统的博客布局，适合长文档与随笔",
    previewUrl: "/classic-blog-theme.jpg",
  },
]

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  const [settings, setSettings] = useState<BlogSettings>({
    blogName: "",
    blogDescription: "",
    blogTagline: "",
    authorName: "",
    authorEmail: "",
    pageSize: 10,
    commentEnabled: false,
    theme: "default",
  })

  const [profile, setProfile] = useState({
    displayName: user?.displayName || user?.nickname || "",
    email: user?.email || "",
    username: user?.username || "",
  })

  const fetchSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ApiClient.get<BlogSettings>("/settings/public")
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取设置失败")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    setProfile({
      displayName: user?.displayName || user?.nickname || "",
      email: user?.email || "",
      username: user?.username || "",
    })
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await ApiClient.put<BlogSettings>("/settings", settings)
      if (response.success) {
        toast({
          title: "成功",
          description: "设置已保存",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "保存设置失败",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfileSave = async () => {
    try {
      const res = await ApiClient.updateProfile({
        displayName: profile.displayName,
        email: profile.email,
        username: profile.username,
      })
      if (!res.success) throw new Error(res.message || "更新用户信息失败")
      setProfile({
        displayName: res.data?.displayName || res.data?.nickname || "",
        email: res.data?.email || "",
        username: res.data?.username || "",
      })
      await refreshUser()
      toast({ title: "成功", description: "用户信息已更新" })
      setIsProfileDialogOpen(false)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "更新用户信息失败",
      })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "只允许图片文件（jpg, png, gif）",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "文件大小必须小于5MB",
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const response = await ApiClient.uploadFile<{ avatarUrl: string }>("/users/me/avatar", file)
      if (response.success) {
        toast({
          title: "成功",
          description: "头像上传成功",
        })
        refreshUser()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "上传头像失败",
      })
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ""
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">设置中心</h2>
            <p className="text-muted-foreground">管理个人资料、博客配置以及主题样式。</p>
          </div>
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存更改"}
          </Button>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
            <CardDescription>展示当前登录用户，点击头像即可编辑个人资料。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <img
                    src={user?.avatar || "/placeholder.svg"}
                    alt="用户头像"
                    className="h-24 w-24 rounded-full object-cover shadow-md"
                  />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    编辑信息
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>编辑用户资料</DialogTitle>
                  <DialogDescription>更新头像、昵称、邮箱与个性签名。</DialogDescription>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={user?.avatar || "/placeholder.svg"}
                      alt="当前头像"
                      className="h-16 w-16 rounded-full border object-cover"
                    />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploadingAvatar ? "上传中..." : "上传新头像"}
                      </Button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <p className="text-xs text-muted-foreground">支持 JPG、PNG、GIF，最大 5MB。</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profileName">用户昵称</Label>
                      <Input
                        id="profileName"
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        placeholder="泉此方"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileUsername">用户名</Label>
                      <Input
                        id="profileUsername"
                        value={profile.username}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                        placeholder="konata"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profileEmail">用户邮箱</Label>
                      <Input
                        id="profileEmail"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="konata@example.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsProfileDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    className="bg-slate-900 text-white hover:bg-slate-800"
                    onClick={handleProfileSave}
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "保存中..." : "保存资料"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="text-center md:text-left space-y-2">
              <p className="text-2xl font-semibold">
                {profile.displayName || user?.displayName || user?.nickname || "未命名用户"}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.email || user?.email || "尚未设置邮箱"}
              </p>
              <p className="text-sm text-slate-500">
                {settings.blogTagline ? `“${settings.blogTagline}”` : "点击头像更新个性签名"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            个人资料的修改将与博客展示保持同步。
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>博客设置</CardTitle>
            <CardDescription>配置站点基本信息与展示行为。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="blogName">博客名称</Label>
                <Input
                  id="blogName"
                  value={settings.blogName}
                  onChange={(e) => setSettings({ ...settings, blogName: e.target.value })}
                  placeholder="输入您的博客名称"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pageSize">每页文章数</Label>
                <Input
                  id="pageSize"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.pageSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pageSize: Number.parseInt(e.target.value, 10) || 10,
                    })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">建议 6-20 之间，保障加载速度。</p>
              </div>
            </div>
            <div>
              <Label htmlFor="blogDescription">博客简介</Label>
              <Textarea
                id="blogDescription"
                value={settings.blogDescription}
                onChange={(e) => setSettings({ ...settings, blogDescription: e.target.value })}
                placeholder="说明博客关注的主题、节奏或读者期待。"
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="blogTagline">博客标语</Label>
              <Input
                id="blogTagline"
                value={settings.blogTagline}
                onChange={(e) => setSettings({ ...settings, blogTagline: e.target.value })}
                placeholder="记录灵感，分享所见"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>主题外观</CardTitle>
            <CardDescription>在此选择博客主题，效果会在保存后应用。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {themeOptions.map((theme) => {
                const isActive = settings.theme === theme.slug
                return (
                  <div
                    key={theme.id}
                    className={`rounded-2xl border bg-white p-4 transition-shadow ${
                      isActive ? "border-slate-900 shadow-lg" : "border-slate-200"
                    }`}
                  >
                    <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                      <img src={theme.previewUrl || "/placeholder.svg"} alt={theme.name} className="h-40 w-full object-cover" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-semibold">{theme.name}</p>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                      {isActive && <Badge>当前主题</Badge>}
                    </div>
                    <Button
                      variant={isActive ? "outline" : "default"}
                      className={`mt-4 w-full ${!isActive ? "bg-slate-900 text-white hover:bg-slate-800" : ""}`}
                      disabled={isActive}
                      onClick={() => setSettings({ ...settings, theme: theme.slug })}
                    >
                      {isActive ? "已启用" : "启用主题"}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
