"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type PageResponse, type Post, type Category, type Tag } from "@/lib/api"
import {
  FileText,
  Folder,
  TagIcon,
  Eye,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
export default function AdminDashboardPage() {
  const { toast } = useToast()
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
      iconBg: "bg-gray-100 text-gray-600",
    },
    {
      title: "分类",
      value: stats.totalCategories,
      description: "内容分类",
      icon: Folder,
      iconBg: "bg-gray-100 text-gray-600",
    },
    {
      title: "Tags",
      value: stats.totalTags,
      description: "相关标签",
      icon: TagIcon,
      iconBg: "bg-gray-100 text-gray-600",
    },
    {
      title: "累计浏览",
      value: stats.totalViews,
      description: "站点总访问数",
      icon: Eye,
      iconBg: "bg-gray-100 text-gray-600",
    },
  ]

  // Categories management state
  const defaultCategoryForm = {
    name: "",
    slug: "",
    description: "",
    isActive: true,
  }
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiClient.get<Category[]>("/categories")
        if (res.success && res.data) {
          setCategories(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
      }
    }
    fetchCategories()
  }, [])

  // Category management handlers
  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm(defaultCategoryForm)
    setIsCategoryDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
    })
    setIsCategoryDialogOpen(true)
  }

  const handleSaveCategory = async () => {
    const trimmedName = categoryForm.name.trim()
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "分类名称必填",
        description: "请输入分类名称后再保存。",
      })
      return
    }

    const normalizedSlug = (categoryForm.slug.trim() || trimmedName)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")

    const payload = {
      ...categoryForm,
      name: trimmedName,
      slug: normalizedSlug || `category-${Date.now()}`,
    }

    try {
      if (editingCategory) {
        // Update category
        await ApiClient.put(`/categories/${editingCategory.id}`, payload)
        setCategories(
          categories.map((cat) => (cat.id === editingCategory.id ? { ...cat, ...payload } : cat)),
        )
      } else {
        // Create category
        const res = await ApiClient.post<Category>("/categories", payload)
        if (res.success && res.data) {
          setCategories([...categories, res.data])
        }
      }
      setIsCategoryDialogOpen(false)
      setCategoryForm(defaultCategoryForm)
      toast({
        title: editingCategory ? "分类已更新" : "分类已创建",
        description: editingCategory
          ? `分类 "${categoryForm.name}" 已成功更新`
          : `分类 "${categoryForm.name}" 已成功创建`,
      })
    } catch (err) {
      toast({
        title: "操作失败",
        description: "无法保存分类，请重试",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await ApiClient.delete(`/categories/${id}`)
      setCategories(categories.filter(cat => cat.id !== id))
      toast({
        title: "分类已删除",
        description: "分类已成功删除",
      })
    } catch (err) {
      toast({
        title: "删除失败",
        description: "无法删除分类，请重试",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8 text-slate-900">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">仪表盘</h2>
          <p className="text-sm text-slate-500">欢迎回来，以下是您的博客概览。</p>
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

        {/* Categories Management Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">分类管理</h3>
            </div>
            <Button onClick={handleAddCategory} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建分类
            </Button>
          </div>

          <div className="border rounded-lg">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Folder className="mb-4 h-12 w-12 text-muted-foreground" />
                <p>暂无分类，点击右上角按钮创建第一个分类。</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>分类</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>文章数量</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs">{category.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{category.postCount || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "outline"}>
                          {category.isActive ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "编辑分类" : "新建分类"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="输入分类名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="例如 frontend"
                />
                <p className="text-xs text-muted-foreground">用于生成分类链接，如 /category/frontend。</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="输入分类描述（可选）"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <p className="font-medium text-sm">启用状态</p>
                  <p className="text-xs text-muted-foreground">停用后该分类将不会在前台显示。</p>
                </div>
                <Switch
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                  取消
                </Button>
                <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveCategory}>
                  {editingCategory ? "更新分类" : "创建分类"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
