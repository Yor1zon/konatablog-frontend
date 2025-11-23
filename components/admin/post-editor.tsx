"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient, type Post, type Category, type Tag } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Send, X } from "lucide-react"

interface PostEditorProps {
  postId?: number
}

export function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(!!postId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT")
  const [isFeatured, setIsFeatured] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          ApiClient.get<Category[]>("/categories"),
          ApiClient.get<Tag[]>("/tags"),
        ])

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data)
        }

        if (tagsRes.success && tagsRes.data) {
          setTags(tagsRes.data)
        }

        if (postId) {
          const postRes = await ApiClient.get<Post>(`/posts/${postId}`)
          if (postRes.success && postRes.data) {
            const post = postRes.data
            setTitle(post.title)
            setSlug(post.slug)
            setExcerpt(post.excerpt)
            setContent(post.content)
            setCategoryId(post.category?.id)
            setSelectedTags(post.tags.map((t) => t.id))
            setStatus(post.status)
            setIsFeatured(post.isFeatured)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!postId) {
      setSlug(generateSlug(value))
    }
  }

  const handleAddTag = (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId))
  }

  const handleSave = async (publishNow = false) => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required",
      })
      return
    }

    setIsSaving(true)
    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        status: publishNow ? "PUBLISHED" : status,
        isFeatured,
        categoryId: categoryId || null,
        tagIds: selectedTags,
      }

      const response = postId
        ? await ApiClient.put<Post>(`/posts/${postId}`, postData)
        : await ApiClient.post<Post>("/posts", postData)

      if (response.success) {
        toast({
          title: "Success",
          description: `Post ${postId ? "updated" : "created"} successfully`,
        })
        router.push("/admin/posts")
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save post",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredTags = tags.filter(
    (tag) => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) && !selectedTags.includes(tag.id),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">{postId ? "Edit Post" : "New Post"}</h2>
            <p className="text-muted-foreground">{postId ? "Update your blog post" : "Create a new blog post"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            <Send className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="post-url-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of your post"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content in Markdown format..."
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">Supports Markdown formatting</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: "DRAFT" | "PUBLISHED") => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId?.toString()} onValueChange={(value) => setCategoryId(Number.parseInt(value))}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Featured post
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search tags..."
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                />
                {tagSearchQuery && filteredTags.length > 0 && (
                  <div className="border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => {
                          handleAddTag(tag.id)
                          setTagSearchQuery("")
                        }}
                      >
                        <span className="text-sm">{tag.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId)
                  if (!tag) return null
                  return (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      {tag.name}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
