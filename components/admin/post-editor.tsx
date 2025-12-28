"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
import { ArrowLeft, CornerDownLeft, Loader2, Save, Send, X } from "lucide-react"

interface PostEditorProps {
  postId?: number
}

interface ListItem {
  type: "create" | "tag"
  id?: number
  label: string
  action: () => void
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

  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [searchResults, setSearchResults] = useState<{ query: string; items: Tag[] } | null>(null)
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [isTagLoading, setIsTagLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const mergeTags = (incoming: Tag[]) => {
    setAllTags((prev) => {
      const map = new Map<number, Tag>()
      prev.forEach((t) => map.set(t.id, t))
      incoming.forEach((t) => map.set(t.id, t))
      return Array.from(map.values())
    })
  }

  const loadAllTags = async () => {
    try {
      const res = await ApiClient.getTags()
      if (res.success && res.data) {
        setAllTags(res.data)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "标签加载失败",
      })
    }
  }

  const fetchTagsByQuery = async (query: string) => {
    setIsTagLoading(true)
    try {
      const res = await ApiClient.searchTags(query, 0, 50, true)
      const fetched = Array.isArray(res.data?.content) ? res.data.content : []
      setSearchResults({ query, items: fetched })
      mergeTags(fetched)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "标签加载失败",
      })
    } finally {
      setIsTagLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await ApiClient.get<Category[]>("/categories")
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data)
        }

        if (postId) {
          const postRes = await ApiClient.getAdminPostById(postId)
          if (postRes.success && postRes.data) {
            const post = postRes.data
            setTitle(post.title)
            setSlug(post.slug)
            setExcerpt(post.excerpt)
            setContent(post.content)
            setCategoryId(post.category?.id)
            setSelectedTags(post.tags.map((t) => t.id))
            setStatus(post.status)
            mergeTags(post.tags)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载数据失败")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    loadAllTags()
  }, [postId])

  useEffect(() => {
    const query = tagSearchQuery.trim()
    if (!query) {
      setSearchResults(null)
      setIsTagLoading(false)
      setHighlightIndex(0)
      return
    }
    const timer = setTimeout(() => {
      fetchTagsByQuery(query)
      setHighlightIndex(0)
    }, 200)
    return () => clearTimeout(timer)
  }, [tagSearchQuery])

  const generateSlug = (value: string) => {
    return value
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

  const handleSmartCreateTag = async () => {
    const name = tagSearchQuery.trim()
    if (!name) return
    setIsTagLoading(true)
    try {
      const res = await ApiClient.smartCreateTag({ name })
      if (res.success && res.data) {
        mergeTags([res.data])
        handleAddTag(res.data.id)
        setTagSearchQuery("")
        toast({ title: "标签已创建", description: `已添加标签 “${res.data.name}”` })
      } else {
        throw new Error(res.message || "标签创建失败")
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "标签创建失败",
      })
    } finally {
      setIsTagLoading(false)
    }
  }

  const handleSave = async (publishNow: boolean) => {
    const nextStatus: "DRAFT" | "PUBLISHED" = publishNow ? "PUBLISHED" : "DRAFT"

    if (!title.trim()) {
      toast({ variant: "destructive", title: "提示", description: "请填写文章标题" })
      return
    }

    if (!content.trim()) {
      toast({ variant: "destructive", title: "提示", description: "请填写正文内容" })
      return
    }

    if (!categoryId) {
      toast({ variant: "destructive", title: "提示", description: "请选择文章分类" })
      return
    }

    setIsSaving(true)
    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        status: nextStatus,
        categoryId: categoryId ?? null,
      }

      const response = postId
        ? await ApiClient.put<Post>(`/posts/${postId}`, postData)
        : await ApiClient.post<Post>("/posts", postData)

      if (response.success && response.data) {
        const targetPostId = response.data.id ?? postId
        if (!targetPostId) throw new Error("无法确定文章ID")

        const bindRes = await ApiClient.setPostTags(targetPostId, selectedTags)
        if (!bindRes.success) throw new Error(bindRes.message || "标签绑定失败")

        setStatus(nextStatus)
        toast({
          title: "操作成功",
          description: publishNow ? "文章已发布" : "草稿已保存",
        })
        router.push("/admin/posts")
      } else {
        throw new Error(response.message || "保存失败")
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "错误",
        description: err instanceof Error ? err.message : "保存失败",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const candidateTags = useMemo(() => {
    const q = tagSearchQuery.trim()
    if (q) {
      if (searchResults && searchResults.query === q) return searchResults.items
      return searchResults?.items || []
    }
    return allTags
  }, [searchResults, allTags, tagSearchQuery])

  const availableTags = candidateTags.filter((tag) => !selectedTags.includes(tag.id))

  const exactMatchExists = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase()
    if (!q) return false
    return availableTags.some((tag) => tag.name.toLowerCase() === q)
  }, [availableTags, tagSearchQuery])

  const listItems: ListItem[] = useMemo(() => {
    const q = tagSearchQuery.trim().toLowerCase()
    const items: ListItem[] = []
    if (q && !exactMatchExists) {
      items.push({
        type: "create",
        label: `创建标签 “${tagSearchQuery.trim()}”`,
        action: handleSmartCreateTag,
      })
    }
    availableTags.forEach((tag) => {
      const matches = !q || tag.name.toLowerCase().includes(q)
      if (matches) {
        items.push({
          type: "tag",
          id: tag.id,
          label: tag.name,
          action: () => {
            handleAddTag(tag.id)
            setTagSearchQuery("")
          },
        })
      }
    })
    return items
  }, [availableTags, exactMatchExists, tagSearchQuery])

  useEffect(() => {
    setHighlightIndex((prev) => Math.min(prev, Math.max(listItems.length - 1, 0)))
  }, [listItems.length])

  useEffect(() => {
    const el = itemRefs.current[highlightIndex]
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }, [highlightIndex])

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
            <h2 className="text-3xl font-bold">{postId ? "编辑文章" : "新建文章"}</h2>
            <p className="text-muted-foreground">{postId ? "更新文章内容" : "创建新的文章"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            保存草稿
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSave(true)} disabled={isSaving}>
            <Send className="mr-2 h-4 w-4" />
            发布
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题（必填）</Label>
                <Input
                  id="title"
                  placeholder="请输入文章标题"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">链接路径（可选）</Label>
                <Input
                  id="slug"
                  placeholder="自定义链接段（留空自动生成）"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要（可选）</Label>
                <Textarea
                  id="excerpt"
                  placeholder="请输入文章摘要"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">正文（必填）</Label>
                <Textarea
                  id="content"
                  placeholder="请填写文章正文，支持 Markdown"
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">支持 Markdown 格式</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>分类与标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">请选择分类</Label>
                <Select value={categoryId?.toString()} onValueChange={(value) => setCategoryId(Number.parseInt(value))}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择一个分类" />
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

              <div className="space-y-2">
                <Label>标签</Label>
                <Input
                  placeholder="搜索标签（支持不区分大小写）"
                  value={tagSearchQuery}
                  onChange={(e) => setTagSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const current = listItems[highlightIndex]
                      if (current) current.action()
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      setHighlightIndex((prev) => Math.min(prev + 1, Math.max(listItems.length - 1, 0)))
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault()
                      setHighlightIndex((prev) => Math.max(prev - 1, 0))
                    }
                  }}
                />
                <div className="border rounded-lg p-2 max-h-52 overflow-y-auto space-y-1">
                  {isTagLoading ? (
                    <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      加载标签...
                    </div>
                  ) : listItems.length > 0 ? (
                    listItems.map((item, index) => (
                      <div
                        key={item.type === "tag" ? item.id : "create"}
                        ref={(el) => (itemRefs.current[index] = el)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          index === highlightIndex ? "bg-accent" : "hover:bg-accent"
                        }`}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onClick={item.action}
                      >
                        <div className="flex items-center gap-2 text-sm">
                          {item.type === "create" && <CornerDownLeft className="h-4 w-4" />}
                          <span>{item.label}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground px-1 py-2">
                      {tagSearchQuery.trim() ? "没有匹配的标签" : "暂无可用标签"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">已选标签（点击徽章可移除）</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagId) => {
                      const tag = allTags.find((t) => t.id === tagId)
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
                    {selectedTags.length === 0 && <p className="text-xs text-muted-foreground">尚未选择标签</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
