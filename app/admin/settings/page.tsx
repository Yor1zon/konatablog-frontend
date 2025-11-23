"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type BlogSettings } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Save, Upload } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState<BlogSettings>({
    blogName: "",
    blogDescription: "",
    blogTagline: "",
    authorName: "",
    authorEmail: "",
    pageSize: 10,
    commentEnabled: true,
    theme: "default",
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
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await ApiClient.put<BlogSettings>("/settings", settings)
      if (response.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save settings",
      })
    } finally {
      setIsSaving(false)
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
        title: "Error",
        description: "Only image files (jpg, png, gif) are allowed",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const response = await ApiClient.uploadFile<{ avatarUrl: string }>("/settings/avatar", file)
      if (response.success) {
        toast({
          title: "Success",
          description: "Avatar uploaded successfully",
        })
        refreshUser()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload avatar",
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Settings</h2>
            <p className="text-muted-foreground">Configure your blog</p>
          </div>
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blog Information */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Information</CardTitle>
              <CardDescription>Basic information about your blog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blogName">Blog Name</Label>
                <Input
                  id="blogName"
                  value={settings.blogName}
                  onChange={(e) => setSettings({ ...settings, blogName: e.target.value })}
                  placeholder="My Awesome Blog"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blogTagline">Blog Tagline</Label>
                <Input
                  id="blogTagline"
                  value={settings.blogTagline}
                  onChange={(e) => setSettings({ ...settings, blogTagline: e.target.value })}
                  placeholder="Sharing thoughts and ideas"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blogDescription">Blog Description</Label>
                <Textarea
                  id="blogDescription"
                  value={settings.blogDescription}
                  onChange={(e) => setSettings({ ...settings, blogDescription: e.target.value })}
                  placeholder="A brief description of your blog..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
              <CardDescription>Information about the blog author</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input
                  id="authorName"
                  value={settings.authorName}
                  onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorEmail">Author Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={settings.authorEmail}
                  onChange={(e) => setSettings({ ...settings, authorEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Author Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted overflow-hidden">
                    <img src={user?.avatar || "/placeholder.svg"} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                  </Button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Configure how your blog is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageSize">Posts Per Page</Label>
                <Input
                  id="pageSize"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.pageSize}
                  onChange={(e) => setSettings({ ...settings, pageSize: Number.parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">Number of posts to show per page (1-50)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  placeholder="default"
                />
              </div>
            </CardContent>
          </Card>

          {/* Feature Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>Enable or disable blog features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="commentEnabled"
                  checked={settings.commentEnabled}
                  onChange={(e) => setSettings({ ...settings, commentEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="commentEnabled" className="cursor-pointer">
                  Enable Comments
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Allow readers to comment on your blog posts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
